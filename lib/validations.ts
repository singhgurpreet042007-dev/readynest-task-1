import { z } from 'zod';

export const signUpSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const fieldOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Option label is required'),
  value: z.string().min(1, 'Option value is required'),
});

export const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'number', 'dropdown', 'checkbox', 'radio', 'date', 'textarea', 'rating']),
  label: z.string().min(1, 'Field label is required'),
  placeholder: z.string().optional(),
  required: z.boolean(),
  options: z.array(fieldOptionSchema).optional(),
  helpText: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const formSettingsSchema = z.object({
  submitMessage: z.string().min(1),
  allowMultipleSubmissions: z.boolean(),
  showProgressBar: z.boolean(),
  theme: z.enum(['default', 'minimal', 'bold']),
});

export const createFormSchema = z.object({
  title: z.string().min(1, 'Form title is required').max(200),
  description: z.string().max(1000).optional(),
});

export const updateFormSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  is_published: z.boolean().optional(),
  fields: z.array(formFieldSchema).optional(),
  settings: formSettingsSchema.optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
