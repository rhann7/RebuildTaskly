import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function CreateCompany({ categories }: PageProps) {
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

            <div className="max-w-3xl mx-auto py-6 px-4">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
                        <Link href="/company-management/companies">
                            <ChevronLeft className="h-4 w-4 mr-1" /> Back to List
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                        <CardDescription>
                            Create a new company. Password will be auto-generated based on company name.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company_owner_name">Owner Full Name</Label>
                                    <Input
                                        id="company_owner_name"
                                        value={data.company_owner_name}
                                        onChange={(e) => setData('company_owner_name', e.target.value)}
                                        placeholder="e.g. John Doe"
                                    />
                                    <InputError message={errors.company_owner_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Company Name</Label>
                                    <Input
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="e.g. Acme Corp"
                                    />
                                    <InputError message={errors.company_name} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Company Email (for Login)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="company@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_phone">Phone Number</Label>
                                    <Input
                                        id="company_phone"
                                        value={data.company_phone}
                                        onChange={(e) => setData('company_phone', e.target.value)}
                                        placeholder="08123456789"
                                    />
                                    <InputError message={errors.company_phone} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Company Category</Label>
                                <Select 
                                    value={data.company_category_id} 
                                    onValueChange={(val) => setData('company_category_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
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
                                <Label htmlFor="company_address">Office Address</Label>
                                <Input
                                    id="company_address"
                                    value={data.company_address}
                                    onChange={(e) => setData('company_address', e.target.value)}
                                    placeholder="Full address here..."
                                />
                                <InputError message={errors.company_address} />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing} className="w-full md:w-auto">
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Register Company
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}