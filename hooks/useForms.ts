'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Form } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export function useForms() {
  const { user } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) setError(error.message);
    else setForms((data as Form[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  async function createForm(title: string, description = '') {
    if (!user) return null;
    const { data, error } = await supabase
      .from('forms')
      .insert({ user_id: user.id, title, description, fields: [], settings: defaultSettings() })
      .select()
      .single();
    if (error) throw error;
    await fetchForms();
    return data as Form;
  }

  async function deleteForm(id: string) {
    await supabase.from('forms').delete().eq('id', id);
    setForms((prev) => prev.filter((f) => f.id !== id));
  }

  async function duplicateForm(form: Form) {
    if (!user) return;
    await supabase.from('forms').insert({
      user_id: user.id,
      title: `${form.title} (Copy)`,
      description: form.description,
      fields: form.fields,
      settings: form.settings,
      is_published: false,
    });
    await fetchForms();
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from('forms').update({ is_published: !current }).eq('id', id);
    setForms((prev) => prev.map((f) => f.id === id ? { ...f, is_published: !current } : f));
  }

  return { forms, loading, error, fetchForms, createForm, deleteForm, duplicateForm, togglePublish };
}

function defaultSettings() {
  return {
    submitMessage: 'Thank you for your response!',
    allowMultipleSubmissions: true,
    showProgressBar: false,
    theme: 'default' as const,
  };
}
