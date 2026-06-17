'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  MoreHorizontal, Eye, BarChart3, Pencil, Copy, Trash2,
  Globe, Lock, FileText
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Form } from '@/lib/types';

interface FormCardProps {
  form: Form;
  responseCount: number;
  onDelete: (id: string) => void;
  onDuplicate: (form: Form) => void;
  onTogglePublish: (id: string, current: boolean) => void;
}

export function FormCard({ form, responseCount, onDelete, onDuplicate, onTogglePublish }: FormCardProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <div className="group bg-card rounded-xl border border-border hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Color bar */}
        <div className="h-1 bg-gradient-to-r from-primary to-primary/40" />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <h3 className="font-semibold text-sm truncate">{form.title}</h3>
              </div>
              {form.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{form.description}</p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/forms/${form.id}`}>
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/forms/${form.id}/responses`}>
                    <Eye className="w-4 h-4 mr-2" /> Responses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/forms/${form.id}/analytics`}>
                    <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDuplicate(form)}>
                  <Copy className="w-4 h-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {form.views_count} views
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> {responseCount} responses
            </span>
            <span className="ml-auto">
              {formatDistanceToNow(new Date(form.updated_at), { addSuffix: true })}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              {form.is_published ? (
                <><Globe className="w-3.5 h-3.5 text-primary" /><span className="text-primary font-medium">Published</span></>
              ) : (
                <><Lock className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-muted-foreground">Draft</span></>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_published}
                onCheckedChange={() => onTogglePublish(form.id, form.is_published)}
                className="scale-75"
              />
              <Link href={`/dashboard/forms/${form.id}`}>
                <Button size="sm" variant="outline" className="h-7 text-xs">Edit</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{form.title}&quot; and all its responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { onDelete(form.id); setShowDelete(false); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
