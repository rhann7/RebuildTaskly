import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Hash, Mail, MapPin, Pencil, Phone, User, ShieldCheck, ExternalLink, Activity } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    company_owner?: { name: string; user_id: number };
    created_at: string;
    members_count?: number; 
    workspaces_count?: number;
}

interface PageProps {
    company: Company;
}

const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
};

const breadcrumbs = (company: Company): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Company List', href: '/company-management/companies' },
    { title: company.name, href: `/company-management/companies/${company.slug}` },
];

export default function CompanyShow({ company }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs(company)}>
            <Head title={`Company · ${company.name}`} />

            <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="rounded-full">
                            <Link href="/company-management/companies">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Company Profile</h2>
                            <p className="text-sm text-muted-foreground">Detailed overview and system status.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                            <ExternalLink className="h-4 w-4" />
                            <span>Login as Owner</span>
                        </Button>
                        
                        <Button size="sm" asChild className="gap-2">
                            <Link href={`/company-management/companies/${company.slug}/edit`}>
                                <Pencil className="h-4 w-4" />
                                Edit Profile
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <Card className="border-border shadow-sm">
                            <CardContent className="pt-6 text-center">
                                <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-lg mb-4">
                                    <AvatarImage src={company.logo || ''} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                        {company.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="text-xl font-bold">{company.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{company.company_category?.name || 'General'}</p>
                                
                                <Badge variant={company.is_active ? 'secondary' : 'destructive'} className="w-full justify-center py-1">
                                    {company.is_active ? (
                                        <div className="flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> System Active</div>
                                    ) : (
                                        <div className="flex items-center gap-2"><Activity className="h-3 w-3" /> Suspended</div>
                                    )}
                                </Badge>
                            </CardContent>
                            <Separator />
                            <div className="grid grid-cols-2 divide-x">
                                <div className="p-4 text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Members</p>
                                    <p className="text-lg font-bold">{company.members_count || 0}</p>
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold">Workspaces</p>
                                    <p className="text-lg font-bold">{company.workspaces_count || 0}</p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    System Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Internal ID</span>
                                    <span className="font-mono font-bold text-xs">#{company.id}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Registered</span>
                                    <span className="font-medium">{formatDate(company.created_at)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Business Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2 p-6 pt-0">
                                <DetailItem icon={<Mail />} label="Email Address" value={company.email} />
                                <DetailItem icon={<Phone />} label="Contact Number" value={company.phone || '—'} />
                                <DetailItem icon={<User />} label="Account Owner" value={company.company_owner?.name || '—'} />
                                <DetailItem icon={<Hash />} label="URL Slug" value={`/${company.slug}`} isSlug />
                                <div className="md:col-span-2 mt-2">
                                    <DetailItem 
                                        icon={<MapPin />} 
                                        label="Headquarters" 
                                        value={company.address || 'No physical address registered.'} 
                                        isAddress
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-center p-8 border-2 border-dashed rounded-xl text-muted-foreground text-sm">
                            Additional company logs and user management modules can be integrated here.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function DetailItem({ icon, label, value, isSlug, isAddress }: { icon: React.ReactNode; label: string; value: string; isSlug?: boolean; isAddress?: boolean }) {
    return (
        <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 border border-primary/10 text-primary">
                {icon}
            </div>
            <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 leading-none">{label}</p>
                <p className={`text-sm ${isSlug ? 'font-mono bg-muted px-1.5 py-0.5 rounded' : 'font-semibold'} ${isAddress ? 'italic font-normal' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}