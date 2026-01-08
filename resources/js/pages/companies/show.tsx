import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Hash, Mail, MapPin, Pencil, Phone, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Company {
    id: number;
    name: string;
    slug: string;
    email: string;
    phone: string | null;
    logo: string | null;
    address: string | null;
    is_active: boolean;
    company_category?: { name: string };
    company_owner?: { name: string };
    created_at: string;
}

interface PageProps {
    company: Company;
}

const breadcrumbs = (company: Company): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Company List', href: '/company-management/companies' },
    { title: company.name, href: `/company-management/companies/${company.slug}` },
];

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

export default function CompanyShow({ company }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs(company)}>
            <Head title={`Company · ${company.name}`} />

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild className="h-9 w-9 text-muted-foreground hover:text-foreground">
                                <Link href="/company-management/companies">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Company Details</h2>
                        </div>
                        <p className="text-sm text-muted-foreground pl-11">
                            Reviewing profile for <span className="font-semibold text-foreground">{company.name}</span>
                        </p>
                    </div>

                    <div className="pl-11 md:pl-0">
                        <Button size="sm" asChild className="gap-2 px-4">
                            <Link href={`/company-management/companies/${company.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                Edit Company
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="overflow-hidden border-border shadow-sm">
                    <div className="bg-zinc-50/50 dark:bg-zinc-900/50 p-8 border-b">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center">
                            <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
                                <AvatarImage src={company.logo || ''} />
                                <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                                    {company.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-bold">{company.name}</h3>
                                    <Badge variant={company.is_active ? 'default' : 'destructive'} className="rounded-full px-3">
                                        {company.is_active ? 'Active' : 'Suspended'}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground font-medium flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-primary/40" />
                                    {company.company_category?.name || 'General Business'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-0">
                        <div className="grid gap-0 md:grid-cols-2">
                            <div className="p-8 border-b md:border-b-0 md:border-r space-y-8">
                                <DetailItem 
                                    icon={<Mail className="h-4 w-4" />} 
                                    label="Business Email" 
                                    value={company.email} 
                                />
                                <DetailItem 
                                    icon={<Phone className="h-4 w-4" />} 
                                    label="Phone Number" 
                                    value={company.phone || '—'} 
                                />
                                <DetailItem 
                                    icon={<User className="h-4 w-4" />} 
                                    label="Company Owner" 
                                    value={company.company_owner?.name || 'Unknown'} 
                                />
                            </div>

                            <div className="p-8 space-y-8">
                                <DetailItem 
                                    icon={<Calendar className="h-4 w-4" />} 
                                    label="Registration Date" 
                                    value={formatDate(company.created_at)} 
                                />
                                <DetailItem 
                                    icon={<Hash className="h-4 w-4" />} 
                                    label="System Identifier (Slug)" 
                                    value={company.slug} 
                                />
                                <div className="flex gap-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Physical Address</p>
                                        <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                                            {company.address || 'No office address registered.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center text-xs text-muted-foreground italic">
                    Internal ID Reference: {company.id}
                </div>
            </div>
        </AppLayout>
    );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50">
                <span className="text-muted-foreground">{icon}</span>
            </div>
            <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
        </div>
    );
}