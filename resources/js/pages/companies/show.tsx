import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, User, ShieldCheck, Fingerprint, Building2, Hash, Calendar, MapPin, History, Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AppealLog {
    id: number;
    status_to: 'active' | 'suspended';
    reason: string | null;
    created_at: string;
    user?: { name: string };
}

interface Company {
    id: number;
    name: string;
    slug: string;
    email: string;
    phone: string | null;
    logo: string | null;
    address: string | null;
    is_active: boolean;
    reason: string | null;
    category?: { name: string };
    user?: { name: string; id: number };
    appeal_logs?: AppealLog[];
    created_at: string;
}

interface PageProps {
    company: Company;
    pageConfig: { title: string };
}

export default function CompanyShow({ company, pageConfig }: PageProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Company List', href: '/company-management/companies' },
        { title: company.name, href: `/company-management/companies/${company.slug}` },
    ];

    const handleImpersonate = () => {
        if (company.user?.id && confirm(`Login sebagai ${company.name}?`)) {
            router.get(`/impersonate/take/${company.user.id}`);
        }
    };

    const logoUrl = company.logo ? `/storage/logos/${company.logo}` : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${pageConfig.title} - ${company.name}`} />

            <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
                            <Link href="/company-management/companies">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Company Details</h2>
                            <p className="text-sm text-muted-foreground italic">ID Perusahaan: #{company.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleImpersonate}
                            className="gap-2 border-blue-200 hover:bg-blue-50 text-blue-600 dark:border-blue-900 dark:hover:bg-blue-950"
                        >
                            <Fingerprint className="h-4 w-4" />
                            <span>Impersonate Owner</span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <Card className="border-border shadow-sm overflow-hidden">
                            <CardContent className="pt-8 text-center">
                                <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-xl mb-4 rounded-2xl">
                                    <AvatarImage src={logoUrl || ''} className="object-cover" />
                                    <AvatarFallback className="bg-zinc-100 text-zinc-400 rounded-2xl">
                                        <Building2 className="h-10 w-10" />
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="text-xl font-bold">{company.name}</h3>
                                <p className="text-sm font-medium text-primary px-3 py-0.5 bg-primary/5 rounded-full inline-block mt-1">
                                    {company.category?.name || 'Uncategorized'}
                                </p>
                                
                                <div className="mt-6">
                                    <Badge variant={company.is_active ? 'default' : 'destructive'} className="w-full justify-center py-1.5 uppercase tracking-wider text-[10px]">
                                        {company.is_active ? (
                                            <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Active</div>
                                        ) : (
                                            <div className="flex items-center gap-2 font-bold italic">Suspended</div>
                                        )}
                                    </Badge>
                                </div>
                            </CardContent>
                            <Separator />
                            <div className="p-4 bg-muted/30 space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Registered</span>
                                    <span className="font-semibold">{new Date(company.created_at).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> Slug</span>
                                    <span className="font-mono font-bold">/{company.slug}</span>
                                </div>
                            </div>
                        </Card>

                        {!company.is_active && (
                            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold text-red-600 flex items-center gap-2">
                                        <Info className="h-4 w-4" /> Alasan Penangguhan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-red-700 dark:text-red-400 italic font-medium leading-relaxed">
                                        "{company.reason || 'Tidak ada alasan spesifik.'}"
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm border-border">
                            <CardHeader className="border-b bg-zinc-50/50 dark:bg-zinc-900/50">
                                <CardTitle className="text-lg font-bold">Informasi Bisnis</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2 p-6">
                                <DetailItem icon={<Mail />} label="Official Email" value={company.email} />
                                <DetailItem icon={<Phone />} label="Contact Number" value={company.phone || '—'} />
                                <DetailItem icon={<User />} label="Account Owner" value={company.user?.name || 'No Owner Linked'} />
                                <DetailItem 
                                    icon={<MapPin />} 
                                    label="Office Address" 
                                    value={company.address || 'No physical address registered.'} 
                                    isAddress
                                />
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-border overflow-hidden">
                            <CardHeader className="border-b bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-row items-center gap-2">
                                <History className="h-4 w-4 text-zinc-500" />
                                <CardTitle className="text-lg font-bold">Appeal Logs</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-zinc-100 dark:bg-zinc-800 text-[10px] uppercase tracking-widest font-black text-muted-foreground border-b">
                                            <tr>
                                                <th className="px-6 py-3">Date</th>
                                                <th className="px-6 py-3">Action</th>
                                                <th className="px-6 py-3">System Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {company.appeal_logs?.length ? (
                                                company.appeal_logs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                                            {new Date(log.created_at).toLocaleString('id-ID', {
                                                                dateStyle: 'medium',
                                                                timeStyle: 'short'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge 
                                                                variant={log.status_to === 'active' ? 'outline' : 'destructive'}
                                                                className={`text-[9px] px-2 py-0 ${log.status_to === 'active' ? 'border-green-200 text-green-600 bg-green-50' : ''}`}
                                                            >
                                                                {log.status_to.toUpperCase()}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs italic text-zinc-500 max-w-xs truncate">
                                                            {log.reason || '—'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                                                        Belum ada riwayat perubahan status.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function DetailItem({ icon, label, value, isAddress }: { icon: React.ReactNode; label: string; value: string; isAddress?: boolean }) {
    return (
        <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                <div className="[&>svg]:h-4 [&>svg]:w-4">{icon}</div>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 leading-none">{label}</p>
                <p className={`text-sm font-semibold ${isAddress ? 'italic font-medium leading-relaxed' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}