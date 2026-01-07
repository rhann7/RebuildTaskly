import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
    id: number;
    name: string;
}

interface PageProps {
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Company List', href: '/company-management/companies' },
    { title: 'Add New Company', href: '/company-management/companies/create' },
];

export default function CompanyCreate({ categories }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        company_owner_name: '',
        company_name: '',
        email: '',
        company_phone: '',
        company_address: '',
        company_category_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/company-management/companies');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Company" />

            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
                        <Link href="/company-management/companies">
                            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Company List
                        </Link>
                    </Button>
                </div>

                <Card className="shadow-sm border-border">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">Company Information</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Register a new company to the system. The owner will receive auto-generated credentials.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="company_owner_name" className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Owner Full Name</Label>
                                    <Input
                                        id="company_owner_name"
                                        className="bg-zinc-50/50 dark:bg-zinc-900/50"
                                        value={data.company_owner_name}
                                        onChange={(e) => setData('company_owner_name', e.target.value)}
                                        placeholder="John Doe"
                                    />
                                    <InputError message={errors.company_owner_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_name" className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Company Name</Label>
                                    <Input
                                        id="company_name"
                                        className="bg-zinc-50/50 dark:bg-zinc-900/50"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="Acme Corporation"
                                    />
                                    <InputError message={errors.company_name} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Login Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="bg-zinc-50/50 dark:bg-zinc-900/50"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="admin@acme.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_phone" className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Phone Number</Label>
                                    <Input
                                        id="company_phone"
                                        className="bg-zinc-50/50 dark:bg-zinc-900/50"
                                        value={data.company_phone}
                                        onChange={(e) => setData('company_phone', e.target.value)}
                                        placeholder="+62 812..."
                                    />
                                    <InputError message={errors.company_phone} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Company Category</Label>
                                <Select 
                                    value={data.company_category_id} 
                                    onValueChange={(val) => setData('company_category_id', val)}
                                >
                                    <SelectTrigger className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                        <SelectValue placeholder="Select business category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.company_category_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company_address" className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">Physical Office Address</Label>
                                <Input
                                    id="company_address"
                                    className="bg-zinc-50/50 dark:bg-zinc-900/50"
                                    value={data.company_address}
                                    onChange={(e) => setData('company_address', e.target.value)}
                                    placeholder="Jl. Sudirman No. 123..."
                                />
                                <InputError message={errors.company_address} />
                            </div>

                            <div className="flex items-center justify-end pt-4 border-t gap-3">
                                <Button variant="outline" asChild type="button">
                                    <Link href="/company-management/companies">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="px-8">
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Create Company'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}