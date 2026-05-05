import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from '../../components/ScrollReveal';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { PageHero } from '../../components/public/PublicPrimitives';
import { participantClasses } from '../../data/publicSiteContent';

export default function RequestAccessPage() {
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      <ScrollReveal>
      <PageHero title="Request Access" intro="The website CTA leads here before registration, verification, and dashboard access." />
      </ScrollReveal>
      <ScrollReveal>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[2rem] border-white/60 bg-white/85 shadow-lg shadow-[rgba(10,37,64,0.08)]">
          <CardHeader>
            <CardTitle>Access Intake</CardTitle>
            <CardDescription>Fields are aligned to the public request-access CTA and the participant architecture in the documents.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
              <div className="grid gap-4 sm:grid-cols-2"><Input placeholder="Full name" /><Input type="email" placeholder="Email address" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input placeholder="Organization or business" />
                <select className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-1 focus:ring-[#0A2540]">
                  <option>Participant class</option>{participantClasses.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <select className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-1 focus:ring-[#0A2540]">
                  <option>Desired entry path</option><option>Membership Overview</option><option>Founding Member Program</option><option>Partner Programs</option><option>Opportunities</option>
                </select>
                <Input placeholder="Country or operating region" />
              </div>
              <Textarea className="min-h-[140px]" placeholder="Qualification notes, verification context, or access goals" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="rounded-full bg-[var(--aureon-ink)] px-5 hover:bg-[#14385f]">Submit Access Request</Button>
                <Button type="button" variant="outline" className="rounded-full border-slate-300" onClick={() => navigate('/login')}>Go to Login</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-white/60 bg-[linear-gradient(140deg,rgba(10,37,64,0.98),rgba(13,76,129,0.95))] text-white shadow-2xl shadow-[rgba(10,37,64,0.12)]">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Lifecycle</p><h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">Landing to dashboard access</h2></div>
            <div className="space-y-3">{['Landing', 'Sign Up', 'Verification', 'Tier Assignment', 'Dashboard Access'].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-semibold">{index + 1}</span><span>{item}</span></div>)}</div>
            {submitted && <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Access request captured in the frontend flow. The next step is wiring this surface to live registration or review endpoints.</div>}
          </CardContent>
        </Card>
      </div>
      </ScrollReveal>
    </div>
  );
}
