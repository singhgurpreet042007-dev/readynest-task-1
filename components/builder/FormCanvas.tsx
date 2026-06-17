'use client';

import { useRef } from 'react';
import {
  GripVertical, ChevronUp, ChevronDown as ChevronDownIcon, Trash2,
  Type, Mail, Hash,
  CheckSquare, CircleDot, Calendar, AlignLeft, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormField, FieldType } from '@/lib/types';

const FIELD_ICONS: Record<FieldType, React.ElementType> = {
  text: Type, email: Mail, number: Hash, dropdown: ChevronDownIcon,
  checkbox: CheckSquare, radio: CircleDot, date: Calendar, textarea: AlignLeft, rating: Star,
};

interface FormCanvasProps {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onDelete: (id: string) => void;
  formTitle: string;
  formDescription: string;
}

export function FormCanvas({
  fields, selectedId, onSelect, onReorder, onDelete, formTitle, formDescription
}: FormCanvasProps) {
  const dragIndex = useRef<number | null>(null);

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    onReorder(dragIndex.current, index);
    dragIndex.current = index;
  }

  function handleDragEnd() {
    dragIndex.current = null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Form header */}
        <div className="mb-6 p-5 bg-card rounded-xl border border-border">
          <h2 className="text-xl font-bold">{formTitle || 'Untitled Form'}</h2>
          {formDescription && (
            <p className="text-sm text-muted-foreground mt-1">{formDescription}</p>
          )}
        </div>

        {/* Empty state */}
        {fields.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
              <Type className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Click a field type on the left to add it</p>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-3">
          {fields.map((field, index) => {
            const Icon = FIELD_ICONS[field.type];
            const isSelected = selectedId === field.id;

            return (
              <div
                key={field.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelect(field.id)}
                className={cn(
                  'group bg-card rounded-xl border-2 transition-all cursor-pointer',
                  isSelected
                    ? 'border-primary shadow-sm'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <div className="flex items-center gap-3 p-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab shrink-0" />
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{field.label || 'Untitled field'}</span>
                      {field.required && (
                        <span className="text-destructive text-xs font-bold shrink-0">*</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{field.type}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (index > 0) onReorder(index, index - 1); }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (index < fields.length - 1) onReorder(index, index + 1); }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      disabled={index === fields.length - 1}
                    >
                      <ChevronDownIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Field preview */}
                <div className="px-4 pb-4">
                  <FieldPreview field={field} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FieldPreview({ field }: { field: FormField }) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <div className="h-9 rounded-md border border-border bg-muted/30 px-3 flex items-center text-sm text-muted-foreground/70">
          {field.placeholder || `Enter ${field.type}...`}
        </div>
      );
    case 'textarea':
      return (
        <div className="h-20 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground/70">
          {field.placeholder || 'Enter your response...'}
        </div>
      );
    case 'dropdown':
      return (
        <div className="h-9 rounded-md border border-border bg-muted/30 px-3 flex items-center justify-between text-sm text-muted-foreground/70">
          <span>{field.options?.[0]?.label ?? 'Select an option'}</span>
          <ChevronDownIcon className="w-4 h-4" />
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-1.5">
          {(field.options?.slice(0, 3) ?? [{ id: '1', label: 'Option 1', value: 'option_1' }]).map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-border bg-muted/30" />
              <span className="text-sm text-muted-foreground/70">{opt.label}</span>
            </div>
          ))}
        </div>
      );
    case 'radio':
      return (
        <div className="space-y-1.5">
          {(field.options?.slice(0, 3) ?? [{ id: '1', label: 'Option 1', value: 'option_1' }]).map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-border bg-muted/30" />
              <span className="text-sm text-muted-foreground/70">{opt.label}</span>
            </div>
          ))}
        </div>
      );
    case 'date':
      return (
        <div className="h-9 rounded-md border border-border bg-muted/30 px-3 flex items-center justify-between text-sm text-muted-foreground/70">
          <span>MM / DD / YYYY</span>
          <Calendar className="w-4 h-4" />
        </div>
      );
    case 'rating':
      return (
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-5 h-5 text-muted-foreground/30" />
          ))}
        </div>
      );
    default:
      return null;
  }
}

