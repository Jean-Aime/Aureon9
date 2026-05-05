import React from 'react';
import { Users } from 'lucide-react';
import { ScrollReveal } from '../../components/ScrollReveal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { PageHero } from '../../components/public/PublicPrimitives';
import { partnerPrograms } from '../../data/publicSiteContent';
import { InfoRow } from '../../components/public/PublicPrimitives';

export default function PartnersPage() {
  return (
    <div className="space-y-10">
      <ScrollReveal>
      <div className="pt-6">
      <PageHero title="Partner Programs" intro="Partner programs sit inside the public website and connect acquisition, qualification, referrals, and operator participation." />
      </div>
      </ScrollReveal>
      <ScrollReveal>
      <div className="grid gap-6 xl:grid-cols-3">
        {partnerPrograms.map((program) => (
          <Card key={program.title} className="rounded-[2rem] border-white/60 bg-white/85 shadow-lg shadow-[rgba(10,37,64,0.08)]">
            <CardHeader>
              <CardTitle>{program.title}</CardTitle>
              <CardDescription>{program.flow}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">{program.items.map((item) => <InfoRow key={item} icon={Users} text={item} />)}</CardContent>
          </Card>
        ))}
      </div>
      </ScrollReveal>
    </div>
  );
}
