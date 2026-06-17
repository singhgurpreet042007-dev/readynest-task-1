'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, subDays, startOfDay } from 'date-fns';
import { ChevronLeft, Loader2, Eye, BarChart3, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { supabase } from '@/lib/supabase';
import type { Form, FormResponse } from '@/lib/types';

const COLORS = ['hsl(174,72%,36%)', 'hsl(200,72%,45%)', 'hsl(142,72%,36%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)'];

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [formRes, respRes] = await Promise.all([
      supabase.from('forms').select('*').eq('id', id).maybeSingle(),
      supabase.from('form_responses').select('*').eq('form_id', id).order('submitted_at', { ascending: true }),
    ]);
    if (formRes.error || !formRes.data) { router.push('/dashboard'); return; }
    setForm(formRes.data as Form);
    setResponses((respRes.data as FormResponse[]) ?? []);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!form) return null;

  const totalViews = form.views_count;
  const totalResponses = responses.length;
  const conversionRate = totalViews > 0 ? ((totalResponses / totalViews) * 100).toFixed(1) : '0.0';

  // Submissions over last 14 days
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 13 - i));
    const dateStr = format(date, 'MMM d');
    const count = responses.filter((r) => {
      const d = startOfDay(new Date(r.submitted_at));
      return d.getTime() === date.getTime();
    }).length;
    return { date: dateStr, count };
  });

  // Field breakdown for choice fields
  const fields = form.fields ?? [];
  const choiceFields = fields.filter((f) => ['dropdown', 'checkbox', 'radio'].includes(f.type));

  const fieldBreakdown = choiceFields.map((field) => {
    const counts: Record<string, number> = {};
    responses.forEach((r) => {
      const val = (r.data as Record<string, unknown>)[field.id];
      const vals = Array.isArray(val) ? val : [String(val ?? '')];
      vals.forEach((v) => {
        if (v) counts[v] = (counts[v] ?? 0) + 1;
      });
    });
    return {
      label: field.label,
      data: Object.entries(counts).map(([name, value]) => ({ name, value })),
    };
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/dashboard/forms/${id}`} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{form.title}</h1>
          <p className="text-sm text-muted-foreground">Analytics</p>
        </div>
        <Badge variant={form.is_published ? 'default' : 'secondary'} className="ml-2">
          {form.is_published ? 'Published' : 'Draft'}
        </Badge>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-blue-600' },
          { label: 'Responses', value: totalResponses, icon: Users, color: 'text-primary' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-green-600' },
          { label: 'Form Fields', value: fields.length, icon: BarChart3, color: 'text-orange-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`w-4 h-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submissions over time */}
      <Card className="mb-6 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Submissions (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {totalResponses === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No responses yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={last14} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Responses" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Field breakdowns */}
      {fieldBreakdown.length > 0 && (
        <div>
          <h2 className="font-semibold text-base mb-4">Field Breakdowns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldBreakdown.map(({ label, data }) => (
              <Card key={label} className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">No data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                        >
                          {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
