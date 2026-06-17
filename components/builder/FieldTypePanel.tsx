'use client';

import {
  Type, Mail, Hash, ChevronDown, CheckSquare,
  CircleDot, Calendar, AlignLeft, Star
} from 'lucide-react';
import type { FieldType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FieldTypeDef {
  type: FieldType;
  label: string;
  icon: React.ElementType;
  description: string;
}

const FIELD_TYPES: FieldTypeDef[] = [
  { type: 'text', label: 'Text Input', icon: Type, description: 'Short text answer' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Email address' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric value' },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, description: 'Select from list' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Multiple selection' },
  { type: 'radio', label: 'Radio Button', icon: CircleDot, description: 'Single selection' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'textarea', label: 'Text Area', icon: AlignLeft, description: 'Long text answer' },
  { type: 'rating', label: 'Rating', icon: Star, description: 'Star rating' },
];

interface FieldTypePanelProps {
  onAdd: (type: FieldType) => void;
}

export function FieldTypePanel({ onAdd }: FieldTypePanelProps) {
  return (
    <div className="w-56 shrink-0 border-r border-border bg-card h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Add Fields</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Click to add to form</p>
      </div>
      <div className="p-3 space-y-1">
        {FIELD_TYPES.map(({ type, label, icon: Icon, description }) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
              'border border-transparent hover:border-primary/30 hover:bg-primary/5',
              'transition-all duration-150 group'
            )}
          >
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
