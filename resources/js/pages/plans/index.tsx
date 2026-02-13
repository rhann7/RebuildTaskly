import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem, PaginatedData } from '@/types';
import { Plus, Trash2, Pencil, Search, Layers, Settings2 } from 'lucide-react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    discount_monthly_percent: number;
    discount_yearly_percent: number;
    final_price_monthly: string;
    final_price_yearly: string;
    is_free: boolean;
    is_yearly: boolean;
    is_active: boolean;
    modules_count: number;
    form_default: {
        name: string;
        description: string;
        price_monthly: number;
        price_yearly: number;
        discount_monthly_percent: number;
        discount_yearly_percent: number;
        is_free: boolean;
        is_yearly: boolean;
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
        price_monthly: 0,
        price_yearly: 0,
        discount_monthly_percent: 0,
        discount_yearly_percent: 0,
        is_free: false,
        is_yearly: false,
        is_active: true,
    });

    const handleFilterChange = (key: string, value: string) => {
        const params: any = {
            search: searchQuery,
            type: filters.type,
            duration: filters.duration,
            status: filters.status,
            [key]: value
        };

        Object.keys(params).forEach(k => {
            if (params[k] === 'all' || !params[k]) delete params[k];
        });

        router.get(route('product-management.plans.index'), params, { 
            preserveState: true, 
            replace: true 
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
                <SelectTrigger className="w-[130px] h-9 bg-background"><SelectValue placeholder="Duration" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Duration</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="monthly_only">Monthly Only</SelectItem>
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
                headerActions={<Button onClick={openCreateModal}><Plus className="h-4 w-4 mr-2" />Add New Plan</Button>}
                pagination={plans}
                isEmpty={plans.data.length === 0}
                config={{ 
                    showFilter: true, showPagination: true, showPaginationInfo: true, 
                    showHeaderActions: true, showShadow: true, showBorder: true, 
                    emptyStateIcon: <Layers className="h-6 w-6 text-muted-foreground/60" /> 
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Plan Details</TableHead>
                            <TableHead>Monthly Price</TableHead>
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
                                        <span className="font-mono text-sm font-semibold">{plan.is_free ? 'FREE' : plan.final_price_monthly}</span>
                                        {plan.discount_monthly_percent > 0 && (<span className="text-[10px] text-muted-foreground line-through">Rp {plan.price_monthly?.toLocaleString('id-ID')}</span>)}
                                        {plan.is_yearly && <span className="text-[10px] text-muted-foreground">Incl. Yearly option</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                        <Layers className="h-3 w-3" /> {plan.modules_count} Modules
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {plan.is_active ? (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-50 border border-dashed border-zinc-300 px-2 py-0.5 text-xs text-zinc-500">Inactive</span>
                                    )}
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
                        <DialogTitle>{isEditing ? 'Edit Plan' : 'New Subscription Plan'}</DialogTitle>
                        <DialogDescription>Configure pricing tiers and subscription details for your plans.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Plan Name</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Professional Plan" className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200" />
                            
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Description</Label>
                            <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} className="min-h-[80px] border-zinc-200 shadow-none focus-visible:ring-zinc-200" placeholder="Brief explanation of the plan benefits and features..." />
                            
                            <InputError message={errors.description} />
                        </div>

                        {!data.is_free && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price_monthly" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Monthly Price (IDR)</Label>
                                    <Input 
                                        id="price_monthly" 
                                        type="number" 
                                        value={data.price_monthly === 0 ? '' : data.price_monthly} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData('price_monthly', val === '' ? 0 : Number(val));
                                        }}
                                        placeholder="Enter monthly price..."
                                        className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200"
                                    />

                                    <InputError message={errors.price_monthly} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="discount_monthly" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Monthly Discount (%)</Label>
                                    <Input 
                                        id="discount_monthly"
                                        type="number" 
                                        value={data.discount_monthly_percent === 0 ? '' : data.discount_monthly_percent} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData('discount_monthly_percent', val === '' ? 0 : Number(val));
                                        }}
                                        placeholder="0"
                                        className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200"
                                    />

                                    <InputError message={errors.discount_monthly_percent} />
                                </div>
                            </div>
                        )}

                        {data.is_yearly && !data.is_free && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price_yearly" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Yearly Price (IDR)</Label>
                                    <Input 
                                        id="price_yearly"
                                        type="number" 
                                        value={data.price_yearly === 0 ? '' : data.price_yearly} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData('price_yearly', val === '' ? 0 : Number(val));
                                        }}
                                        placeholder="Enter yearly price..."
                                        className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200"
                                    />

                                    <InputError message={errors.price_yearly} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="discount_yearly" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Yearly Discount (%)</Label>
                                    <Input 
                                        id="discount_yearly"
                                        type="number" 
                                        value={data.discount_yearly_percent === 0 ? '' : data.discount_yearly_percent} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData('discount_yearly_percent', val === '' ? 0 : Number(val));
                                        }}
                                        placeholder="0"
                                        className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200"
                                    />

                                    <InputError message={errors.discount_yearly_percent} />
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 py-4 border-t border-b border-zinc-100 border-dashed">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is-free" className="text-sm font-medium">Free Plan</Label>
                                    <p className="text-[11px] text-zinc-400">Enable this to make the plan available at no cost.</p>
                                </div>
                                <Switch id="is-free" checked={data.is_free} onCheckedChange={(val) => setData('is_free', val)} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is-yearly" className="text-sm font-medium">Enable Yearly Subscription</Label>
                                    <p className="text-[11px] text-zinc-400">Allow customers to subscribe on a yearly billing cycle.</p>
                                </div>
                                <Switch id="is-yearly" checked={data.is_yearly} onCheckedChange={(val) => setData('is_yearly', val)} />
                            </div>
                        </div>

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