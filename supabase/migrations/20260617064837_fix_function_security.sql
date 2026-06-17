
-- Fix 1: Add SET search_path = '' to all functions to prevent search path injection
-- Fix 2: Revoke public EXECUTE on handle_new_user (trigger-only, not a public RPC)
-- Fix 3: Change increment_form_views to SECURITY INVOKER + grant targeted UPDATE

-- Recreate handle_new_user with fixed search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Revoke direct execution of handle_new_user from all non-superuser roles
-- It is a trigger function and must not be callable via REST API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Recreate update_updated_at with fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Revoke direct execution of update_updated_at (trigger-only)
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM authenticated;

-- Recreate increment_form_views as SECURITY INVOKER with fixed search_path
-- Grant targeted UPDATE permission so anon/authenticated can update views_count
CREATE OR REPLACE FUNCTION public.increment_form_views(form_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.forms
  SET views_count = views_count + 1
  WHERE slug = form_slug
    AND is_published = TRUE;
END;
$$;

-- Grant UPDATE on only the views_count column to anon and authenticated
-- so SECURITY INVOKER can succeed without elevating privileges
GRANT UPDATE (views_count) ON public.forms TO anon;
GRANT UPDATE (views_count) ON public.forms TO authenticated;

-- Ensure the RPC is callable (EXECUTE already granted via public by default for SECURITY INVOKER)
GRANT EXECUTE ON FUNCTION public.increment_form_views(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_form_views(TEXT) TO authenticated;
