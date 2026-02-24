import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem, PaginatedData } from '@/types';
import { Plus, Trash2, Pencil, Search, Layers, Settings2 } from 'lucide-react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    original_price: number;
    duration: number;
    is_free: boolean;
    is_active: boolean;
    modules_count: number;
    form_default: {
        name: string;
        description: string;
        price: number;
        original_price: number;
        duration: number;
        is_active: boolean;
    };
};

type PageProps = {
    plans: PaginatedData<Plan>;
    filters: { search?: string; type?: string; duration?: string; status?: string; };
    pageConfig: PageConfig;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Plan Management', href: route('product-management.plans.index') },
];

export default function PlanIndex({ plans, filters, pageConfig }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        price: 0,
        original_price: 0,
        duration: 30,
        is_active: true,
    });

    const handleFilterChange = (key: string, value: string) => {
        const params: any = { ...filters, search: searchQuery, [key]: value };
        Object.keys(params).forEach(k => { if (params[k] === 'all' || !params[k]) delete params[k]; });

        router.get(route('product-management.plans.index'), params, { 
            preserveState: true, replace: true 
        });
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentSlug(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const openEditModal = (p: Plan) => {
        setIsEditing(true);
        setCurrentSlug(p.slug);
        setData(p.form_default);
        clearErrors();
        setIsOpen(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: () => { setIsOpen(false); reset(); }};

        if (isEditing && currentSlug) {
            put(route('product-management.plans.update', { plan: currentSlug }), options);
        } else {
            post(route('product-management.plans.store'), options);
        }
    };

    const handleDelete = (p: Plan) => {
        if (confirm(`Are you sure you want to delete plan "${p.name}"? This action cannot be undone.`)) {
            router.delete(route('product-management.plans.destroy', { plan: p.slug }));
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR', 
            maximumFractionDigits: 0 
        }).format(value);
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search plans..."
                    className="pl-9 bg-background h-9 border-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', searchQuery)}
                />
            </div>

            <Select value={filters.type || 'all'} onValueChange={(val) => handleFilterChange('type', val)}>
                <SelectTrigger className="w-[130px] h-9 bg-background"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Pricing</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
            </Select>

            <Select value={filters.duration || 'all'} onValueChange={(val) => handleFilterChange('duration', val)}>
                <SelectTrigger className="w-[140px] h-9 bg-background"><SelectValue placeholder="Duration" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Durations</SelectItem>
                    <SelectItem value="monthly">Monthly (30 Days)</SelectItem>
                    <SelectItem value="yearly">Yearly (365 Days)</SelectItem>
                </SelectContent>
            </Select>

            <Select value={filters.status || 'all'} onValueChange={(val) => handleFilterChange('status', val)}>
                <SelectTrigger className="w-[120px] h-9 bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <>
            <ResourceListLayout
                title={pageConfig.title}
                description={pageConfig.description}
                breadcrumbs={breadcrumbs}
                filterWidget={FilterWidget}
                headerActions={<Button onClick={openCreateModal}><Plus className="h-4 w-4 mr-2" />Add Plan</Button>}
                pagination={plans}
                isEmpty={plans.data.length === 0}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Plan Details</TableHead>
                            <TableHead>Price & Billing</TableHead>
                            <TableHead>Original Price</TableHead>
                            <TableHead>Modules</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {plans.data.map((plan, i) => (
                            <TableRow key={plan.id} className="group hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground tabular-nums">{plans.from + i}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{plan.name}</span>
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tight">{plan.slug}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-mono text-sm font-semibold">{plan.is_free ? 'FREE' : formatCurrency(plan.price)}</span>
                                        <span className="text-[10px] text-muted-foreground">{plan.duration === 365 ? 'Yearly Billed' : 'Monthly Billed'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-mono text-sm font-semibold">{plan.is_free ? 'FREE' : formatCurrency(plan.original_price)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center gap-1.5 text-xs">
                                        <Layers className="h-3 w-3" /> {plan.modules_count} Modules
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {plan.is_active 
                                        ? <span className="inline-flex items-center gap-1 rounded-md bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                                        : <span className="inline-flex items-center gap-1 rounded-md bg-zinc-50 border border-dashed border-zinc-300 px-2 py-0.5 text-xs text-zinc-500">Inactive</span>
                                    }
                                </TableCell>
                                <TableCell className="text-right px-6 space-x-1">
                                    <Link href={route('product-management.plans.show', { plan: plan.slug })}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Manage Modules"><Settings2 className="h-3.5 w-3.5" /></Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(plan)}><Pencil className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(plan)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResourceListLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Plan' : 'New Plan'}</DialogTitle>
                        <DialogDescription>Set a single price and duration for this subscription tier.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Plan Name</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Professional Monthly" className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200" />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Description</Label>
                            <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} className="min-h-[80px] border-zinc-200 shadow-none focus-visible:ring-zinc-200" placeholder="Brief explanation of the plan benefits and features..." />
                            <InputError message={errors.description} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Billing Cycle</Label>
                            <Select value={data.duration.toString()} onValueChange={(val) => setData('duration', parseInt(val))}>
                                <SelectTrigger className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 Days (Monthly)</SelectItem>
                                    <SelectItem value="365">365 Days (Yearly)</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.duration} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="original_price" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Original Price (Optional)</Label>
                                <Input id="original_price" type="number" value={data.original_price === 0 ? '' : data.original_price} onChange={(e) => { const val = e.target.value; setData('original_price', val === '' ? 0 : Number(val)); }} placeholder="Enter original price..." className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200" />
                                <InputError message={errors.original_price} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Selling Price (IDR)</Label>
                                <Input id="price" type="number" value={data.price === 0 ? '' : data.price} onChange={(e) => { const val = e.target.value; setData('price', val === '' ? 0 : Number(val)); }} placeholder="Enter price..." className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200" />
                                <InputError message={errors.price} />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-100">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active" className="text-sm font-medium text-foreground">Active Status</Label>
                                    <p className="text-[11px] text-zinc-500 italic">Turn off to hide this plan from the registration page.</p>
                                </div>
                                <Switch id="is_active" checked={data.is_active} onCheckedChange={(val) => setData('is_active', val)} />
                            </div>
                        )}

                        <DialogFooter className="gap-2 pt-2">
                            <Button type="button" variant="ghost" size="lg" onClick={() => setIsOpen(false)} className="text-zinc-500">Cancel</Button>
                            <Button type="submit" disabled={processing} size="lg" className="px-6 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">{isEditing ? 'Save Changes' : 'Create Plan'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}