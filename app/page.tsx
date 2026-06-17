'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight, CheckCircle2, LayoutDashboard, Share2,
  BarChart3, Zap, Shield, Globe
} from 'lucide-react';

const FEATURES = [
  { icon: LayoutDashboard, title: 'Drag & Drop Builder', desc: 'Intuitive interface to build forms without writing any code.' },
  { icon: Share2, title: 'Instant Sharing', desc: 'Generate unique links and embed codes in one click.' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track views, submissions, and conversion rates live.' },
  { icon: Zap, title: 'Multiple Field Types', desc: 'Text, email, dropdowns, checkboxes, ratings, and more.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Responses are encrypted and only accessible to you.' },
  { icon: Globe, title: 'Fully Responsive', desc: 'Forms look great on desktop, tablet, and mobile.' },
];

const FIELD_TYPES = ['Text Input', 'Email', 'Number', 'Dropdown', 'Checkbox', 'Radio Button', 'Date', 'Text Area', 'Rating'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">DynamicForms Pro</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#fields" className="hover:text-foreground transition-colors">Field Types</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <Badge variant="secondary" className="mb-6 text-primary border-primary/20">
          Dynamic Form Builder
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          Build. Customize.{' '}
          <span className="text-primary">Share.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Create powerful forms with a drag-and-drop builder, collect responses in real-time,
          and analyze data with beautiful dashboards — no code required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8 h-12">
              Start Building Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-base px-8 h-12">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Mock form preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
          <div className="max-w-2xl mx-auto rounded-2xl border border-border shadow-2xl bg-card overflow-hidden">
            <div className="bg-muted/50 border-b border-border px-6 py-4 flex items-center justify-between">
              <span className="font-semibold text-sm">Customer Feedback Form</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
            </div>
            <div className="p-8 space-y-5 text-left">
              {[
                { label: 'Full Name', placeholder: 'Enter your name' },
                { label: 'Email Address', placeholder: 'Enter your email' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-sm font-medium mb-1.5">{f.label}</label>
                  <div className="h-10 rounded-md border border-border bg-muted/30 px-3 flex items-center text-sm text-muted-foreground">
                    {f.placeholder}
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1.5">How did you hear about us?</label>
                <div className="h-10 rounded-md border border-border bg-muted/30 px-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Select an option</span>
                  <span className="text-xs">&#8964;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg">A complete toolkit for form creation and response management.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Field Types */}
      <section id="fields" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Supported Field Types</h2>
          <p className="text-muted-foreground text-lg">Every field type you could ever need.</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {FIELD_TYPES.map((f) => (
            <div key={f} className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20 text-primary-foreground text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to build your first form?</h2>
        <p className="text-primary-foreground/80 text-lg mb-8">Join thousands of teams collecting data effortlessly.</p>
        <Link href="/signup">
          <Button size="lg" variant="secondary" className="text-base px-8 h-12">
            Get Started — It&apos;s Free <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} DynamicForms Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
