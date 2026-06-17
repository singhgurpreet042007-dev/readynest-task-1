'use client';

import { useState } from 'react';
import { Plus, Trash2, X, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { FormField, FormFieldOption } from '@/lib/types';
import { nanoid } from '@/lib/nanoid';

interface FieldEditorProps {
  field: FormField;
  onChange: (updated: FormField) => void;
  onRemove: () => void;
}

const HAS_OPTIONS = ['dropdown', 'checkbox', 'radio'];

export function FieldEditor({ field, onChange, onRemove }: FieldEditorProps) {
  function update(patch: Partial<FormField>) {
    onChange({ ...field, ...patch });
  }

  function addOption() {
    const opts = field.options ?? [];
    const label = `Option ${opts.length + 1}`;
    update({ options: [...opts, { id: nanoid(), label, value: label.toLowerCase().replace(/\s+/g, '_') }] });
  }

  function updateOption(id: string, patch: Partial<FormFieldOption>) {
    update({
      options: (field.options ?? []).map((o) => o.id === id ? { ...o, ...patch } : o),
    });
  }

  function removeOption(id: string) {
    update({ options: (field.options ?? []).filter((o) => o.id !== id) });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold capitalize">{field.type} Field</h3>
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Label */}
        <div className="space-y-1.5">
          <Label className="text-xs">Label *</Label>
          <Input
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="Field label"
          />
        </div>

        {/* Placeholder */}
        {['text', 'email', 'number', 'textarea'].includes(field.type) && (
          <div className="space-y-1.5">
            <Label className="text-xs">Placeholder</Label>
            <Input
              value={field.placeholder ?? ''}
              onChange={(e) => update({ placeholder: e.target.value })}
              placeholder="Placeholder text"
            />
          </div>
        )}

        {/* Help text */}
        <div className="space-y-1.5">
          <Label className="text-xs">Help text</Label>
          <Input
            value={field.helpText ?? ''}
            onChange={(e) => update({ helpText: e.target.value })}
            placeholder="Optional help text shown below the field"
          />
        </div>

        <Separator />

        {/* Required toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs font-medium">Required</Label>
            <p className="text-xs text-muted-foreground">Users must fill this field</p>
          </div>
          <Switch
            checked={field.required}
            onCheckedChange={(v) => update({ required: v })}
          />
        </div>

        {/* Number constraints */}
        {field.type === 'number' && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Min value</Label>
                <Input
                  type="number"
                  value={field.min ?? ''}
                  onChange={(e) => update({ min: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="No limit"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max value</Label>
                <Input
                  type="number"
                  value={field.max ?? ''}
                  onChange={(e) => update({ max: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="No limit"
                />
              </div>
            </div>
          </>
        )}

        {/* Text length constraints */}
        {['text', 'textarea'].includes(field.type) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Min length</Label>
                <Input
                  type="number"
                  value={field.minLength ?? ''}
                  onChange={(e) => update({ minLength: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="None"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max length</Label>
                <Input
                  type="number"
                  value={field.maxLength ?? ''}
                  onChange={(e) => update({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="None"
                />
              </div>
            </div>
          </>
        )}

        {/* Options for dropdown/checkbox/radio */}
        {HAS_OPTIONS.includes(field.type) && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs font-medium">Options</Label>
              {(field.options ?? []).map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
                  <Input
                    value={opt.label}
                    onChange={(e) => updateOption(opt.id, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="Option label"
                    className="h-8 text-sm"
                  />
                  <button
                    onClick={() => removeOption(opt.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-2 h-8" onClick={addOption}>
                <Plus className="w-3.5 h-3.5" /> Add Option
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
