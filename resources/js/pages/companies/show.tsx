import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, Hash, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href="/company-management/companies">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                Company Details
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground pl-10">
                            Detailed information for{' '}
                            <span className="font-medium text-foreground">
                                {company.name}
                            </span>
                        </p>
                    </div>

                    <div className="pl-10 md:pl-0">
                        <Link href={`/company-management/companies/${company.id}/edit`}>
                            <Button size="sm" className="gap-2">
                                <Pencil className="h-4 w-4" />
                                Edit Company
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-background shadow-sm">
                    <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border">
                                <AvatarImage src={company.logo || ''} />
                                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                    {company.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <h3 className="text-lg font-semibold">
                                    {company.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {company.company_category?.name || 'Uncategorized'}
                                </p>
                            </div>
                        </div>

                        <div className="md:ml-auto">
                            <Badge variant="outline">
                                {company.is_active ? 'Active' : 'Suspended'}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        <Detail
                            icon={<Mail className="h-4 w-4" />}
                            label="Business Email"
                            value={company.email}
                        />
                        <Detail
                            icon={<Phone className="h-4 w-4" />}
                            label="Phone Number"
                            value={company.phone || '—'}
                        />
                        <Detail
                            icon={<Calendar className="h-4 w-4" />}
                            label="Registered At"
                            value={formatDate(company.created_at)}
                        />
                        <Detail
                            icon={<Hash className="h-4 w-4" />}
                            label="Slug"
                            value={company.slug}
                        />
                    </div>

                    <Separator />

                    <div className="flex gap-4 p-6">
                        <IconWrapper>
                            <MapPin className="h-4 w-4" />
                        </IconWrapper>
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Address
                            </p>
                            <p className="text-sm font-medium leading-relaxed">
                                {company.address || 'No address provided.'}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex gap-4 p-6 bg-muted/20">
                        <IconWrapper>
                            <User className="h-4 w-4" />
                        </IconWrapper>
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Company Owner
                            </p>
                            <p className="text-sm font-medium">
                                {company.company_owner?.name || 'Unknown'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function IconWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60">
            {children}
        </div>
    );
}

function Detail({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex gap-4">
            <IconWrapper>{icon}</IconWrapper>
            <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}