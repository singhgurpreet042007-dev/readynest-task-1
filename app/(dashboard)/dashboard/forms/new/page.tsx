'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForms } from '@/hooks/useForms';
import { toast } from 'sonner';

export default function NewFormPage() {
  const router = useRouter();
  const { createForm } = useForms();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const form = await createForm(title.trim(), desc.trim());
      toast.success('Form created!');
      if (form) router.push(`/dashboard/forms/${form.id}`);
    } catch {
      toast.error('Failed to create form');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Create New Form</h1>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Form Details</CardTitle>
          <CardDescription>Give your form a name and description to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Form title *</Label>
            <Input
              id="title"
              placeholder="e.g. Customer Feedback Survey"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description (optional)</Label>
            <Textarea
              id="desc"
              placeholder="What is this form for?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!title.trim() || creating} className="gap-2">
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
