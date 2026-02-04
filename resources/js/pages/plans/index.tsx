import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler, useEffect } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem, PaginatedData } from '@/types';
import { Plus, Trash2, Pencil, Search, CreditCard, Settings2, Info } from 'lucide-react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type Plan = {
    id: number;
    name: string;
    slug: string;
    description: string;
    price_monthly: number;
    price_yearly: number | null;
    is_active: boolean;
    is_basic: boolean;
    modules_count: number;
    form_default: {
        name: string;
        description: string;
        price_monthly: number;
        price_yearly: number | null;
        is_active: boolean;
        is_basic: boolean;
    };
};

type PageProps = {
    plans: PaginatedData<Plan>;
    filters: { search?: string };
    pageConfig: PageConfig;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Subscription Plans', href: route('product-management.plans.index') },
];

const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

export default function PlanIndex({ plans, filters, pageConfig }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        price_monthly: 0,
        price_yearly: 0 as number | null,
        is_active: true,
        is_basic: false,
        module_ids: [] as number[],
    });

    useEffect(() => {
        if (data.is_basic) {
            setData('price_yearly', null);
        }
    }, [data.is_basic, setData]);

    const handleFilterChange = () => {
        const params: any = { search: searchQuery };
        if (!params.search) delete params.search;

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
        if (isEditing && currentSlug) {
            put(route('product-management.plans.update', { plan: currentSlug }), {
                onSuccess: () => { 
                    setIsOpen(false); 
                    reset(); 
                }
            });
        } else {
            post(route('product-management.plans.store'));
        }
    };

    const handleDelete = (p: Plan) => {
        if (confirm(`Are you sure you want to delete plan "${p.name}"? All module associations will be removed.`)) {
            router.delete(route('product-management.plans.destroy', { plan: p.slug }), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                }
            });
        }
    };

    const FilterWidget = (
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search plans..."
                className="pl-9 bg-background h-9 border-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
            />
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
                    showFilter: true, 
                    showPagination: true, 
                    showPaginationInfo: true, 
                    showHeaderActions: true, 
                    showShadow: true, 
                    showBorder: true, 
                    emptyStateIcon: <CreditCard className="h-6 w-6 text-muted-foreground/60" /> 
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Plan Name</TableHead>
                            <TableHead>Monthly Price</TableHead>
                            <TableHead>Yearly Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {plans.data.map((plan, i) => (
                            <TableRow key={plan.id} className="group hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground tabular-nums">
                                    {plans.from + i}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">{plan.name}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tight">{plan.slug}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-sm text-foreground">{formatIDR(plan.price_monthly)}</span>
                                </TableCell>
                                <TableCell>
                                    {plan.price_yearly ? (
                                        <span className="font-mono text-sm text-foreground">{formatIDR(plan.price_yearly)}</span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {plan.is_active ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-400">
                                            Archived
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right px-6 space-x-1">
                                    <Link href={route('product-management.plans.show', { plan: plan.slug })}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Manage Modules">
                                            <Settings2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(plan)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(plan)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
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
                        <DialogDescription>Configure subscription plan pricing and basic plan status.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Plan Name</Label>
                            <Input 
                                id="name" 
                                value={data.name} 
                                onChange={(e) => setData('name', e.target.value)} 
                                placeholder="Enterprise Plan" 
                                className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200"
                            />
                            <InputError message={errors.name} />
                        </div>

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
                                <Label 
                                    htmlFor="price_yearly" 
                                    className={`text-[10px] font-bold uppercase tracking-widest ${data.is_basic ? 'text-zinc-300' : 'text-zinc-400'}`}
                                >
                                    Yearly Price (IDR)
                                </Label>
                                <Input 
                                    id="price_yearly"
                                    type="number" 
                                    disabled={data.is_basic} 
                                    value={data.price_yearly ?? ''} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setData('price_yearly', val === '' ? null : Number(val));
                                    }}
                                    placeholder={data.is_basic ? 'Not available' : 'Optional...'}
                                    className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200 disabled:opacity-50"
                                />
                                <InputError message={errors.price_yearly} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Description</Label>
                            <Textarea 
                                id="description" 
                                value={data.description} 
                                onChange={(e) => setData('description', e.target.value)} 
                                className="min-h-[80px] border-zinc-200 shadow-none focus-visible:ring-zinc-200"
                                placeholder="Brief plan description and features..."
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between py-4 px-3 border border-zinc-200 border-dashed rounded-md">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is-basic" className="text-sm font-medium">Basic Plan</Label>
                                    <p className="text-[11px] text-zinc-400">Default for new users</p>
                                </div>
                                <Switch 
                                    id="is-basic"
                                    checked={data.is_basic} 
                                    onCheckedChange={(val) => setData('is_basic', val)} 
                                />
                            </div>

                            <div className="flex items-center justify-between py-4 px-3 border border-zinc-200 border-dashed rounded-md">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is-active" className="text-sm font-medium">Active Status</Label>
                                    <p className="text-[11px] text-zinc-400">Show to public</p>
                                </div>
                                <Switch 
                                    id="is-active"
                                    checked={data.is_active} 
                                    onCheckedChange={(val) => setData('is_active', val)} 
                                />
                            </div>
                        </div>
                        
                        {data.is_basic && (
                            <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-700 dark:text-amber-300">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <p>
                                    Setting this plan as <strong>Basic</strong> will automatically remove the Basic status from other plans. 
                                    The yearly pricing option will be disabled for Basic plans.
                                </p>
                            </div>
                        )}

                        <DialogFooter className="gap-2 pt-2">
                            <Button type="button" variant="ghost" size="lg" onClick={() => setIsOpen(false)} className="text-zinc-500">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} size="lg" className="px-6 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
                                {isEditing ? 'Save Changes' : 'Create Plan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}