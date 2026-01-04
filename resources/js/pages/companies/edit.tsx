import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Activity, ArrowLeft, Building2, Mail, MapPin, Phone, Save, Tag, Trash2, User } from 'lucide-react';
import { FormEventHandler } from 'react';

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
        if (confirm('Are you sure you want to delete this company? This action cannot be undone and will remove all associated data.')) {
            router.delete(`/company-management/companies/${company.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${company.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href="/company-management/companies">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Company</h2>
                        </div>
                        <p className="text-sm text-muted-foreground pl-10">
                            Update details for <span className="font-medium text-foreground">{company.name}</span>.
                        </p>
                    </div>

                    <div className="pl-10 md:pl-0">
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={handleDelete}
                            className="h-9 gap-2 shadow-sm"
                        >
                            <Trash2 className="h-4 w-4" /> 
                            <span className="hidden sm:inline">Delete Company</span>
                        </Button>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-4xl rounded-xl border border-border/50 bg-background shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 p-6 md:grid-cols-2">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="company_owner_name">Owner / PIC Name <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        id="company_owner_name"
                                        className="pl-9"
                                        placeholder="Full name of company owner"
                                        value={data.company_owner_name}
                                        onChange={(e) => setData('company_owner_name', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.company_owner_name} />
                            </div>

                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <Label htmlFor="name">Company Name <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        id="name"
                                        className="pl-9"
                                        placeholder="e.g. Acme Corp"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                                <Select 
                                    value={data.company_category_id} 
                                    onValueChange={(val) => setData('company_category_id', val)}
                                >
                                    <SelectTrigger className="w-full bg-background pl-9 relative">
                                        <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.company_category_id} />
                            </div>

                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-9 bg-muted/20"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">Updating email changes the owner's login credentials.</p>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        id="phone"
                                        className="pl-9"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                                    <textarea
                                        id="address"
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Full business address..."
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.address} />
                            </div>

                            <div className="space-y-2 col-span-2 bg-muted/30 p-4 rounded-lg border border-border/50 mt-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Account Status</Label>
                                        <p className="text-xs text-muted-foreground">
                                            If suspended, all users under this company will lose access.
                                        </p>
                                    </div>
                                    <div className="w-[180px]">
                                        <Select 
                                            value={data.is_active} 
                                            onValueChange={(val) => setData('is_active', val)}
                                        >
                                            <SelectTrigger className="bg-background">
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
                                </div>
                                <InputError message={errors.is_active} />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-border/50 bg-muted/10 px-6 py-4">
                            <Link href="/company-management/companies">
                                <Button type="button" variant="ghost">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="min-w-[120px] gap-2">
                                <Save className="h-4 w-4" /> 
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}