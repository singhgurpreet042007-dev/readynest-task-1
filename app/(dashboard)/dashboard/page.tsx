'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FileText, BarChart3, Eye, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormCard } from '@/components/dashboard/FormCard';
import { useForms } from '@/hooks/useForms';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const { forms, loading, createForm, deleteForm, duplicateForm, togglePublish } = useForms();
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [showNewForm, setShowNewForm] = useState(false);
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
      setShowNewForm(false);
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

  const totalViews = forms.reduce((s, f) => s + f.views_count, 0);
  const totalResponses = Object.values(responseCounts).reduce((s, c) => s + c, 0);
  const publishedCount = forms.filter((f) => f.is_published).length;
  const conversionRate = totalViews > 0 ? Math.round((totalResponses / totalViews) * 100) : 0;

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hello, {firstName}!</h1>
          <p className="text-muted-foreground text-sm mt-1">Here&apos;s an overview of your forms.</p>
        </div>
        <Button onClick={() => setShowNewForm(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Form
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Forms', value: forms.length, icon: FileText, color: 'text-primary' },
          { label: 'Published', value: publishedCount, icon: TrendingUp, color: 'text-green-600' },
          { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-blue-600' },
          { label: 'Responses', value: totalResponses, icon: BarChart3, color: 'text-orange-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`w-4 h-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              {label === 'Responses' && (
                <p className="text-xs text-muted-foreground mt-0.5">{conversionRate}% conversion</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forms */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-xl">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No forms yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Create your first form and start collecting responses.</p>
          <Button onClick={() => setShowNewForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Create your first form
          </Button>
        </div>
      ) : (
        <>
          <h2 className="font-semibold text-base mb-4">Recent Forms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.slice(0, 6).map((form) => (
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
          {forms.length > 6 && (
            <div className="text-center mt-6">
              <Link href="/dashboard/forms">
                <Button variant="outline">View all {forms.length} forms</Button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* New Form Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new form</DialogTitle>
            <DialogDescription>Give your form a name and optional description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="form-title">Form title *</Label>
              <Input
                id="form-title"
                placeholder="e.g. Customer Feedback"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="form-desc">Description (optional)</Label>
              <Textarea
                id="form-desc"
                placeholder="What is this form for?"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
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
