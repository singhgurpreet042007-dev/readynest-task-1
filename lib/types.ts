export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'dropdown'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'textarea'
  | 'rating';

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FormFieldOption[];
  helpText?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface FormSettings {
  submitMessage: string;
  allowMultipleSubmissions: boolean;
  showProgressBar: boolean;
  theme: 'default' | 'minimal' | 'bold';
}

export interface Form {
  id: string;
  user_id: string;
  title: string;
  description: string;
  slug: string;
  is_published: boolean;
  fields: FormField[];
  settings: FormSettings;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface FormResponse {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  respondent_email: string | null;
  submitted_at: string;
  metadata: Record<string, unknown>;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormWithResponseCount extends Form {
  response_count?: number;
}

export interface FormAnalytics {
  totalViews: number;
  totalSubmissions: number;
  conversionRate: number;
  submissionsOverTime: { date: string; count: number }[];
  fieldBreakdown: { fieldId: string; label: string; responses: Record<string, number> }[];
}

// Supabase DB type stubs for typed client
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      forms: {
        Row: Form;
        Insert: Omit<Form, 'id' | 'created_at' | 'updated_at' | 'views_count'>;
        Update: Partial<Omit<Form, 'id' | 'user_id' | 'created_at'>>;
      };
      form_responses: {
        Row: FormResponse;
        Insert: Omit<FormResponse, 'id' | 'submitted_at'>;
        Update: never;
      };
    };
    Functions: {
      increment_form_views: { Args: { form_slug: string }; Returns: void };
    };
  };
};
