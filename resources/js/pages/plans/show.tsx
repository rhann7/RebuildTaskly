import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState } from 'react';
import { type BreadcrumbItem, type PageConfig } from '@/types';
import { useForm, router } from '@inertiajs/react';
import { ChevronLeft, Plus, Trash2, Box, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Module {
    id: number;
    name: string;
}

interface PlanData {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    duration: number;
    is_active: boolean;
    modules_count: number;
    modules: Module[];
}

interface PageProps {
    plan: PlanData;
    available_modules: { id: number; name: string }[];
    pageConfig: PageConfig;
}

const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

export default function PlanShow({ plan, available_modules, pageConfig }: PageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        modules: [] as number[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Plans', href: route('product-management.plans.index') },
        { title: plan.name, href: '#' },
    ];

    const toggleModule = (id: number) => {
        const current = data.modules.includes(id)
            ? data.modules.filter(mId => mId !== id)
            : [...data.modules, id];
        setData('modules', current);
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('product-management.plans.modules.assign', { plan: plan.id }), {
            onSuccess: () => { setIsModalOpen(false); reset(); },
            preserveScroll: true,
        });
    };

    const handleRemove = (moduleId: number) => {
        if (confirm('Are you sure you want to remove this module from the plan?')) {
            router.delete(route('product-management.plans.modules.remove', { plan: plan.id, module: moduleId }), { preserveScroll: true });
        }
    };

    return (
        <ResourceListLayout
            title={pageConfig.title}
            description={pageConfig.description}
            breadcrumbs={breadcrumbs}
            headerActions={<Button variant="outline" onClick={() => router.get(route('product-management.plans.index'))}><ChevronLeft className="h-4 w-4 mr-2" /> Back to Plans</Button>}
            config={{ showFilter: false, showPagination: false }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-foreground font-semibold">Plan Information</CardTitle>
                        <CardDescription className="text-xs text-zinc-400">Subscription details and pricing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase">Plan Name</Label>
                            <p className="text-xs text-zinc-400">{plan.name}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase">Status</Label>
                            {plan.is_active ? (
                                <p className="text-xs font-medium text-green-400">Active</p>
                            ) : (
                                <p className="text-xs text-zinc-400">Inactive / Archived</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase">Total Modules</Label>
                            <p className="text-xs text-zinc-400">{plan.modules_count}</p>
                        </div>

                        {plan.description && (
                            <div className="space-y-2">
                                <Label className="text-xs uppercase">Description</Label>
                                <p className="text-xs text-zinc-400 leading-relaxed">{plan.description}</p>
                            </div>
                        )}

                        <div className="pt-6 border-t border-zinc-100 space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-zinc-400">
                                    {plan.duration === 365 ? 'Yearly Price' : 'Monthly Price'}
                                </Label>
                                <p className="text-2xl font-bold text-foreground">
                                    {plan.price === 0 ? 'FREE' : formatIDR(plan.price)}
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Billed every {plan.duration} days
                                </p>
                            </div>

                            <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <p className="leading-relaxed">
                                    Companies will receive renewal alerts <strong>3 days</strong> before this plan expires.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-base font-semibold">Included Modules</CardTitle>
                            <CardDescription className="text-xs mt-1">
                                Modules bundled in this subscription plan
                            </CardDescription>
                        </div>
                        
                        {pageConfig.can_manage && (
                            <Button onClick={() => setIsModalOpen(true)} size="sm">
                                <Plus className="h-4 w-4 mr-2" />Add Modules
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {plan.modules.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent bg-zinc-50/50">
                                        <TableHead className="w-[50px] text-center">#</TableHead>
                                        <TableHead>Module Name</TableHead>
                                        {pageConfig.can_manage && (
                                            <TableHead className="text-right px-6">Actions</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plan.modules.map((module, index) => (
                                        <TableRow key={module.id} className="group hover:bg-muted/30">
                                            <TableCell className="text-center text-muted-foreground tabular-nums">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center">
                                                        <Box className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-medium text-foreground">{module.name}</span>
                                                </div>
                                            </TableCell>
                                            {pageConfig.can_manage && (
                                                <TableCell className="text-right px-6">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleRemove(module.id)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Box className="h-12 w-12 text-muted-foreground/40 mb-3" />
                                <p className="text-sm font-medium text-foreground">No modules assigned yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Click "Add Modules" to include features in this plan</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if(!val) reset(); }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Modules to {plan.name}</DialogTitle>
                        <DialogDescription>Select available modules to include in this plan</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        {available_modules.length > 0 ? (
                            <div className="max-h-[350px] overflow-y-auto border border-zinc-200 rounded-md">
                                {available_modules.map((module) => (
                                    <div key={module.id} className="flex items-center space-x-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-zinc-100 last:border-0" onClick={() => toggleModule(module.id)}>
                                        <Checkbox id={`module-${module.id}`} checked={data.modules.includes(module.id)} onCheckedChange={() => toggleModule(module.id)} onClick={(e) => e.stopPropagation()} />
                                        <label htmlFor={`module-${module.id}`} className="text-sm font-medium cursor-pointer flex-1">
                                            {module.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-200 rounded-md">
                                <Box className="h-10 w-10 text-muted-foreground/40 mb-2" />
                                <p className="text-sm text-muted-foreground">No available modules</p>
                            </div>
                        )}

                        {data.modules.length > 0 && (
                            <div className="flex items-center gap-2 rounded-md bg-zinc-900 p-3 text-xs text-white">
                                <Info className="h-4 w-4 flex-shrink-0" />
                                <p><strong>{data.modules.length}</strong> module(s) selected to be added.</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssign} disabled={processing || data.modules.length === 0} className="bg-zinc-900 text-white">
                            {processing ? 'Processing...' : `Confirm Add Modules`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ResourceListLayout>
    );
}