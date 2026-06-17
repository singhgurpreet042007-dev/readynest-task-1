'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormCard } from '@/components/dashboard/FormCard';
import { useForms } from '@/hooks/useForms';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function FormsPage() {
  const router = useRouter();
  const { forms, loading, createForm, deleteForm, duplicateForm, togglePublish } = useForms();
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!forms.length) return;
    const ids = forms.map((f) => f.id);
    supabase
      .from('form_responses')
      .select('form_id')
      .in('form_id', ids)
      .then(({ data }: { data: { form_id: string }[] | null }) => {
        const counts: Record<string, number> = {};
        data?.forEach(({ form_id }) => {
          counts[form_id] = (counts[form_id] ?? 0) + 1;
        });
        setResponseCounts(counts);
      });
  }, [forms]);

  async function handleCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const form = await createForm(newTitle.trim(), newDesc.trim());
      setShowNew(false);
      setNewTitle('');
      setNewDesc('');
      toast.success('Form created!');
      if (form) router.push(`/dashboard/forms/${form.id}`);
    } catch {
      toast.error('Failed to create form');
    } finally {
      setCreating(false);
    }
  }

  const filtered = forms.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase()) ||
    f.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">My Forms</h1>
        <Button onClick={() => setShowNew(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Form
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search forms..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-xl">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">{search ? 'No forms match your search' : 'No forms yet'}</h3>
          {!search && (
            <>
              <p className="text-muted-foreground text-sm mb-6">Create your first form and start collecting responses.</p>
              <Button onClick={() => setShowNew(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Create your first form
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              responseCount={responseCounts[form.id] ?? 0}
              onDelete={deleteForm}
              onDuplicate={duplicateForm}
              onTogglePublish={togglePublish}
            />
          ))}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new form</DialogTitle>
            <DialogDescription>Give your form a name and optional description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-title">Form title *</Label>
              <Input
                id="new-title"
                placeholder="e.g. Customer Feedback"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-desc">Description (optional)</Label>
              <Textarea
                id="new-desc"
                placeholder="What is this form for?"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newTitle.trim() || creating}>
              {creating && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Create Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
