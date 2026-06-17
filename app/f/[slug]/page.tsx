'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Loader2, AlertCircle, LayoutDashboard, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import type { Form, FormField } from '@/lib/types';

export default function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Record<string, unknown>>();

  const fetchForm = useCallback(async () => {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error || !data) { setNotFound(true); setLoading(false); return; }
    const f = data as Form;
    setForm(f);
    setLoading(false);

    // Increment views
    await supabase.rpc('increment_form_views', { form_slug: slug });
  }, [slug]);

  useEffect(() => { fetchForm(); }, [fetchForm]);

  async function onSubmit(data: Record<string, unknown>) {
  if (!form) return;

  setSubmitting(true);

  const { error } = await supabase
    .from('form_responses')
    .insert({
  form_id: form.id,
  data,
});

  if (error) {
    console.error('Submission Error:', error);
    alert(`Submission failed: ${error.message}`);
    setSubmitting(false);
    return;
  }

  setSubmitted(true);
  setSubmitting(false);
}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Form not found</h1>
          <p className="text-muted-foreground">This form doesn&apos;t exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Response submitted!</h1>
          <p className="text-muted-foreground">{form.settings?.submitMessage || 'Thank you for your response!'}</p>
        </div>
      </div>
    );
  }

  const fields = form.fields ?? [];

  return (
    <div className="min-h-screen bg-muted/20 py-10 px-4">
      {/* Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-muted-foreground text-xs">
          <LayoutDashboard className="w-3.5 h-3.5" />
          Powered by DynamicForms Pro
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Form header */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-4 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
          {form.description && <p className="text-muted-foreground text-sm leading-relaxed">{form.description}</p>}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
            {fields.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                register={register}
                setValue={setValue}
                watch={watch}
                error={errors[field.id]?.message as string | undefined}
              />
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                This form has no fields yet.
              </div>
            )}

            {fields.length > 0 && (
              <Button type="submit" className="w-full h-11 text-base" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

interface FieldInputProps {
  field: FormField;
  register: ReturnType<typeof useForm>['register'];
  setValue: ReturnType<typeof useForm>['setValue'];
  watch: ReturnType<typeof useForm>['watch'];
  error?: string;
}

function FieldInput({ field, register, setValue, watch, error }: FieldInputProps) {
  const value = watch(field.id as never);

  const validationRules = {
    required: field.required ? `${field.label} is required` : false,
    ...(field.minLength ? { minLength: { value: field.minLength, message: `Minimum ${field.minLength} characters` } } : {}),
    ...(field.maxLength ? { maxLength: { value: field.maxLength, message: `Maximum ${field.maxLength} characters` } } : {}),
    ...(field.min !== undefined ? { min: { value: field.min, message: `Minimum value is ${field.min}` } } : {}),
    ...(field.max !== undefined ? { max: { value: field.max, message: `Maximum value is ${field.max}` } } : {}),
    ...(field.type === 'email' ? { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' } } : {}),
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}

      {(field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'date') && (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          {...register(field.id as never, validationRules as never)}
        />
      )}

      {field.type === 'textarea' && (
        <Textarea
          placeholder={field.placeholder}
          rows={4}
          {...register(field.id as never, validationRules as never)}
        />
      )}

      {field.type === 'dropdown' && (
        <Select onValueChange={(v) => setValue(field.id as never, v as never)}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt.id} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === 'radio' && (
        <RadioGroup onValueChange={(v) => setValue(field.id as never, v as never)} className="space-y-2">
          {(field.options ?? []).map((opt) => (
            <div key={opt.id} className="flex items-center gap-2.5">
              <RadioGroupItem value={opt.value} id={`${field.id}-${opt.id}`} />
              <Label htmlFor={`${field.id}-${opt.id}`} className="font-normal cursor-pointer">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {field.type === 'checkbox' && (
        <div className="space-y-2">
          {(field.options ?? []).map((opt) => {
            const checked = Array.isArray(value) && (value as string[]).includes(opt.value);
            return (
              <div key={opt.id} className="flex items-center gap-2.5">
                <Checkbox
                  id={`${field.id}-${opt.id}`}
                  checked={checked}
                  onCheckedChange={(c) => {
                    const current = Array.isArray(value) ? (value as string[]) : [];
                    setValue(
                      field.id as never,
                      (c ? [...current, opt.value] : current.filter((v) => v !== opt.value)) as never
                    );
                  }}
                />
                <Label htmlFor={`${field.id}-${opt.id}`} className="font-normal cursor-pointer">{opt.label}</Label>
              </div>
            );
          })}
        </div>
      )}

      {field.type === 'rating' && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue(field.id as never, star as never)}
              className="focus:outline-none"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  Number(value) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground/40 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
