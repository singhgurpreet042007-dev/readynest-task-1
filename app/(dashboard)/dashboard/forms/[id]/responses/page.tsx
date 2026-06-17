'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ChevronLeft, Loader2, Inbox, Search, Download,
  Trash2, Eye, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Form, FormResponse } from '@/lib/types';

export default function ResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FormResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [formRes, respRes] = await Promise.all([
      supabase.from('forms').select('*').eq('id', id).maybeSingle(),
      supabase.from('form_responses').select('*').eq('form_id', id).order('submitted_at', { ascending: false }),
    ]);

    if (formRes.error || !formRes.data) { router.push('/dashboard'); return; }
    setForm(formRes.data as Form);
    setResponses((respRes.data as FormResponse[]) ?? []);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete(responseId: string) {
    await supabase.from('form_responses').delete().eq('id', responseId);
    setResponses((prev) => prev.filter((r) => r.id !== responseId));
    setDeleteId(null);
    toast.success('Response deleted');
  }

  function exportCSV() {
    if (!form || !responses.length) return;
    const fields = form.fields ?? [];
    const headers = ['Submitted At', ...fields.map((f) => f.label)];
    const rows = responses.map((r) => [
      format(new Date(r.submitted_at), 'yyyy-MM-dd HH:mm'),
      ...fields.map((f) => {
        const val = (r.data as Record<string, unknown>)[f.id];
        if (Array.isArray(val)) return val.join(', ');
        return String(val ?? '');
      }),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = responses.filter((r) => {
    const vals = Object.values(r.data as Record<string, unknown>).join(' ').toLowerCase();
    return vals.includes(search.toLowerCase()) || r.respondent_email?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!form) return null;

  const fields = form.fields ?? [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/forms/${id}`} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{form.title}</h1>
          <p className="text-sm text-muted-foreground">Responses</p>
        </div>
        <Badge variant="secondary" className="ml-2">{responses.length}</Badge>
        <div className="ml-auto flex gap-2">
          {responses.length > 0 && (
            <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search responses..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-xl">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">{search ? 'No matching responses' : 'No responses yet'}</h3>
          {!search && (
            <p className="text-muted-foreground text-sm">
              Share your form to start collecting responses.{' '}
              {!form.is_published && <Link href={`/dashboard/forms/${id}`} className="text-primary hover:underline">Publish it first.</Link>}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Submitted</TableHead>
                {fields.slice(0, 4).map((f) => (
                  <TableHead key={f.id} className="text-xs truncate max-w-32">{f.label}</TableHead>
                ))}
                {fields.length > 4 && <TableHead className="text-xs">+{fields.length - 4} more</TableHead>}
                <TableHead className="text-xs w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((response) => (
                <TableRow key={response.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => setSelected(response)}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(response.submitted_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  {fields.slice(0, 4).map((f) => {
                    const val = (response.data as Record<string, unknown>)[f.id];
                    const display = Array.isArray(val) ? val.join(', ') : String(val ?? '—');
                    return (
                      <TableCell key={f.id} className="text-xs max-w-40 truncate">{display}</TableCell>
                    );
                  })}
                  {fields.length > 4 && <TableCell className="text-xs text-muted-foreground">···</TableCell>}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setSelected(response)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(response.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Response Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Detail</DialogTitle>
            {selected && (
              <p className="text-xs text-muted-foreground">
                Submitted {format(new Date(selected.submitted_at), 'MMM d, yyyy HH:mm')}
              </p>
            )}
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              {fields.map((f) => {
                const val = (selected.data as Record<string, unknown>)[f.id];
                const display = Array.isArray(val) ? val.join(', ') : String(val ?? '—');
                return (
                  <div key={f.id} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{f.label}</p>
                    <p className="text-sm bg-muted/30 rounded-lg px-3 py-2 border border-border">{display || '—'}</p>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete response?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
