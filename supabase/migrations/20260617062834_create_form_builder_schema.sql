
-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Form',
  description TEXT DEFAULT '',
  slug TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  fields JSONB DEFAULT '[]'::JSONB,
  settings JSONB DEFAULT '{
    "submitMessage": "Thank you for your response!",
    "allowMultipleSubmissions": true,
    "showProgressBar": false,
    "theme": "default"
  }'::JSONB,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_forms" ON forms FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_forms" ON forms FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_forms" ON forms FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_forms" ON forms FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Allow public access to published forms (for viewing/submitting)
CREATE POLICY "public_select_published_forms" ON forms FOR SELECT
  TO anon USING (is_published = TRUE);

-- Form responses table
CREATE TABLE IF NOT EXISTS form_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  respondent_email TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Form owners can read their responses
CREATE POLICY "select_form_responses" ON form_responses FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = form_responses.form_id AND forms.user_id = auth.uid()
    )
  );

-- Anyone (including anon) can insert responses to published forms
CREATE POLICY "insert_form_responses_anon" ON form_responses FOR INSERT
  TO anon WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = form_responses.form_id AND forms.is_published = TRUE
    )
  );

CREATE POLICY "insert_form_responses_auth" ON form_responses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = form_responses.form_id AND forms.is_published = TRUE
    )
  );

CREATE POLICY "delete_form_responses" ON form_responses FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = form_responses.form_id AND forms.user_id = auth.uid()
    )
  );

-- Function to increment form view count
CREATE OR REPLACE FUNCTION increment_form_views(form_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE forms SET views_count = views_count + 1 WHERE slug = form_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
