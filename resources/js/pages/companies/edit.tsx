import AppLayout from '@/layouts/app-layout';
import { FormEventHandler } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Activity, ArrowLeft, Building2, Mail, MapPin, Phone, Save, Tag, Trash2, User } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = {
    id: number;
    name: string;
    slug: string;
};

type Company = {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    company_category_id: number;
    is_active: boolean;
    owner?: {
        name: string;
    };
};

type PageProps = {
    company: Company;
    categories: Category[];
};

export default function CompanyEdit({ company, categories }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Company List', href: '/company-management/companies' },
        { title: 'Edit Company', href: `/company-management/companies/${company.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        company_owner_name: company.owner?.name || '',
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        company_category_id: company.company_category_id ? String(company.company_category_id) : '',
        is_active: company.is_active ? '1' : '0',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/company-management/companies/${company.id}`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
            router.delete(`/company-management/companies/${company.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${company.name}`} />

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild className="h-9 w-9 text-muted-foreground hover:text-foreground">
                                <Link href="/company-management/companies">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Company</h2>
                        </div>
                        <p className="text-sm text-muted-foreground pl-11">
                            Update details for <span className="font-semibold text-foreground">{company.name}</span>
                        </p>
                    </div>

                    <div className="pl-11 md:pl-0">
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={handleDelete}
                            className="h-9 gap-2"
                        >
                            <Trash2 className="h-4 w-4" /> 
                            <span>Delete Company</span>
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 p-8 md:grid-cols-2">
                            <div className="space-y-2 col-span-2">
                                <Label className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Owner / PIC Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        className="pl-9 bg-zinc-50/50 dark:bg-zinc-900/50"
                                        value={data.company_owner_name}
                                        onChange={(e) => setData('company_owner_name', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.company_owner_name} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Company Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        className="pl-9 bg-zinc-50/50 dark:bg-zinc-900/50"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Category</Label>
                                <Select value={data.company_category_id} onValueChange={(val) => setData('company_category_id', val)}>
                                    <SelectTrigger className="bg-zinc-50/50 dark:bg-zinc-900/50 pl-9 relative">
                                        <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.company_category_id} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        type="email"
                                        className="pl-9 bg-muted/30 font-medium"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        className="pl-9 bg-zinc-50/50 dark:bg-zinc-900/50"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                                    <textarea
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-zinc-50/50 dark:bg-zinc-900/50 px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.address} />
                            </div>

                            <div className="col-span-2 bg-muted/40 p-5 rounded-lg border border-dashed border-border mt-2">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-base font-bold">Account Status</Label>
                                        <p className="text-xs text-muted-foreground italic">Suspension will disable all member access under this company.</p>
                                    </div>
                                    <Select value={data.is_active} onValueChange={(val) => setData('is_active', val)}>
                                        <SelectTrigger className="w-[160px] bg-background">
                                            <div className="flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-muted-foreground" />
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Active</SelectItem>
                                            <SelectItem value="0">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputError message={errors.is_active} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t bg-zinc-50/50 dark:bg-zinc-900/50 px-8 py-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/company-management/companies">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="min-w-[140px] gap-2">
                                <Save className="h-4 w-4" /> 
                                {processing ? 'Saving...' : 'Update Company'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}