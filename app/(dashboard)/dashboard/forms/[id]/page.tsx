'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, Save, Globe, Lock, Eye, Share2,
  BarChart3, ChevronLeft, Settings2, Pencil, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FieldTypePanel } from '@/components/builder/FieldTypePanel';
import { FormCanvas } from '@/components/builder/FormCanvas';
import { FieldEditor } from '@/components/builder/FieldEditor';
import { supabase } from '@/lib/supabase';
import { nanoid } from '@/lib/nanoid';
import { toast } from 'sonner';
import type { Form, FormField, FieldType } from '@/lib/types';

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('build');
  const [shareOpen, setShareOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState('');
  const [descVal, setDescVal] = useState('');

  const fetchForm = useCallback(async () => {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) { toast.error('Form not found'); router.push('/dashboard'); return; }
    const f = data as Form;
    setForm(f);
    setFields(f.fields ?? []);
    setTitleVal(f.title);
    setDescVal(f.description ?? '');
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchForm(); }, [fetchForm]);

  function addField(type: FieldType) {
    const newField: FormField = {
      id: nanoid(),
      type,
      label: defaultLabel(type),
      required: false,
      options: ['dropdown', 'checkbox', 'radio'].includes(type)
        ? [
            { id: nanoid(), label: 'Option 1', value: 'option_1' },
            { id: nanoid(), label: 'Option 2', value: 'option_2' },
          ]
        : undefined,
    };
    setFields((prev) => [...prev, newField]);
    setSelectedId(newField.id);
    setIsDirty(true);
  }

  function updateField(updated: FormField) {
    setFields((prev) => prev.map((f) => f.id === updated.id ? updated : f));
    setIsDirty(true);
  }

  function deleteField(fieldId: string) {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (selectedId === fieldId) setSelectedId(null);
    setIsDirty(true);
  }

  function reorderFields(from: number, to: number) {
    setFields((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
    setIsDirty(true);
  }

  async function saveForm() {
    if (!form) return;
    setSaving(true);
    const { error } = await supabase
      .from('forms')
      .update({ fields, title: titleVal, description: descVal })
      .eq('id', form.id);
    if (error) toast.error('Failed to save');
    else { toast.success('Saved!'); setIsDirty(false); setForm((f) => f ? { ...f, title: titleVal, description: descVal, fields } : f); }
    setSaving(false);
  }

  async function togglePublish() {
    if (!form) return;
    const next = !form.is_published;
    const { error } = await supabase.from('forms').update({ is_published: next }).eq('id', form.id);
    if (error) { toast.error('Failed to update'); return; }
    setForm((f) => f ? { ...f, is_published: next } : f);
    toast.success(next ? 'Form published!' : 'Form unpublished');
  }

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;
  const shareUrl = form ? `${window.location.origin}/f/${form.slug}` : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <header className="border-b border-border bg-background px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>

        {/* Title */}
        {editingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={titleVal}
              onChange={(e) => setTitleVal(e.target.value)}
              className="h-8 text-sm font-semibold w-56"
              autoFocus
              onBlur={() => { setEditingTitle(false); setIsDirty(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setEditingTitle(false); setIsDirty(true); } }}
            />
          </div>
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors group"
          >
            {titleVal || 'Untitled Form'}
            <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}

        <Badge variant={form.is_published ? 'default' : 'secondary'} className="text-xs">
          {form.is_published ? <><Globe className="w-3 h-3 mr-1" />Published</> : <><Lock className="w-3 h-3 mr-1" />Draft</>}
        </Badge>

        {isDirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}

        <div className="ml-auto flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-8">
              <TabsTrigger value="build" className="text-xs h-7">Build</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs h-7">Settings</TabsTrigger>
            </TabsList>
          </Tabs>

          <Link href={`/dashboard/forms/${form.id}/responses`}>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
              <Eye className="w-3.5 h-3.5" /> Responses
            </Button>
          </Link>
          <Link href={`/dashboard/forms/${form.id}/analytics`}>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
              <BarChart3 className="w-3.5 h-3.5" /> Analytics
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShareOpen(true)}>
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
          <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={saveForm} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </Button>
          <Button
            size="sm"
            variant={form.is_published ? 'outline' : 'default'}
            className="gap-1.5 h-8 text-xs"
            onClick={togglePublish}
          >
            {form.is_published ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
            {form.is_published ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </header>

      {/* Main */}
      {activeTab === 'build' ? (
        <div className="flex flex-1 overflow-hidden">
          <FieldTypePanel onAdd={addField} />
          <FormCanvas
            fields={fields}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onReorder={reorderFields}
            onDelete={deleteField}
            formTitle={titleVal}
            formDescription={descVal}
          />
          {selectedField ? (
            <div className="w-64 shrink-0 border-l border-border bg-card h-full overflow-y-auto">
              <FieldEditor
                field={selectedField}
                onChange={updateField}
                onRemove={() => deleteField(selectedField.id)}
              />
            </div>
          ) : (
            <div className="w-64 shrink-0 border-l border-border bg-card h-full flex items-center justify-center">
              <div className="text-center p-6">
                <Settings2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Select a field to edit its properties</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <FormSettings
          form={form}
          descVal={descVal}
          onDescChange={(v) => { setDescVal(v); setIsDirty(true); }}
          onSave={saveForm}
          saving={saving}
        />
      )}

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Form</DialogTitle>
            <DialogDescription>
              {form.is_published
                ? 'Share this link with anyone to collect responses.'
                : 'Publish your form first to enable sharing.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {form.is_published ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Shareable link</Label>
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly className="text-sm" />
                    <Button
                      variant="outline"
                      onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Copied!'); }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Embed code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`);
                        toast.success('Copied!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => window.open(shareUrl, '_blank')}
                >
                  <Eye className="w-4 h-4" /> Preview Form
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={() => { togglePublish(); setShareOpen(false); }}>
                <Globe className="w-4 h-4 mr-2" /> Publish Form
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FormSettings({
  form, descVal, onDescChange, onSave, saving
}: {
  form: Form;
  descVal: string;
  onDescChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [settings, setSettings] = useState(form.settings);

  async function saveSettings() {
    await supabase.from('forms').update({ settings }).eq('id', form.id);
    onSave();
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Form Settings</h2>
          <p className="text-sm text-muted-foreground">Configure your form&apos;s behavior and appearance.</p>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            value={descVal}
            onChange={(e) => onDescChange(e.target.value)}
            placeholder="Describe your form..."
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Success message</Label>
          <Input
            value={settings.submitMessage}
            onChange={(e) => setSettings((s) => ({ ...s, submitMessage: e.target.value }))}
            placeholder="Thank you for your response!"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-t border-border">
          <div>
            <Label className="text-sm font-medium">Allow multiple submissions</Label>
            <p className="text-xs text-muted-foreground">Users can submit more than once</p>
          </div>
          <Switch
            checked={settings.allowMultipleSubmissions}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, allowMultipleSubmissions: v }))}
          />
        </div>

        <div className="flex items-center justify-between py-3 border-t border-border">
          <div>
            <Label className="text-sm font-medium">Show progress bar</Label>
            <p className="text-xs text-muted-foreground">Display completion progress</p>
          </div>
          <Switch
            checked={settings.showProgressBar}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, showProgressBar: v }))}
          />
        </div>

        <Button onClick={saveSettings} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function defaultLabel(type: string): string {
  const labels: Record<string, string> = {
    text: 'Text Input', email: 'Email Address', number: 'Number',
    dropdown: 'Dropdown', checkbox: 'Checkbox', radio: 'Radio Group',
    date: 'Date', textarea: 'Text Area', rating: 'Rating',
  };
  return labels[type] ?? 'Field';
}
