// import ResourceListLayout from '@/layouts/resource/resource-list-layout';
// import { useState } from 'react';
// import { type BreadcrumbItem, type PageConfig } from '@/types';
// import { useForm, router } from '@inertiajs/react';
// import { ChevronLeft, Plus, Trash2, Box, Info, CreditCard } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';

// interface Module {
//     id: number;
//     name: string;
// }

// interface PlanData {
//     id: number;
//     name: string;
//     slug: string;
//     description: string | null;
//     price_monthly: number;
//     price_yearly: number | null;
//     is_active: boolean;
//     is_basic: boolean;
//     modules_count: number;
//     modules: Module[];
// }

// interface PageProps {
//     plan: PlanData;
//     available_modules: { id: number; name: string }[];
//     pageConfig: PageConfig;
// }

// const formatIDR = (amount: number) => {
//     return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
// };

// export default function PlanShow({ plan, available_modules, pageConfig }: PageProps) {
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     const { data, setData, post, processing, reset } = useForm({
//         modules: [] as number[],
//     });

//     const breadcrumbs: BreadcrumbItem[] = [
//         { title: 'Dashboard', href: route('dashboard') },
//         { title: 'Plans', href: route('product-management.plans.index') },
//         { title: plan.name, href: '#' },
//     ];

//     const toggleModule = (id: number) => {
//         const current = data.modules.includes(id)
//             ? data.modules.filter(mId => mId !== id)
//             : [...data.modules, id];
//         setData('modules', current);
//     };

//     const handleAssign = (e: React.FormEvent) => {
//         e.preventDefault();
//         post(route('product-management.plans.modules.assign', { plan: plan.id }), {
//             onSuccess: () => {
//                 setIsModalOpen(false);
//                 reset();
//             },
//         });
//     };

//     const handleRemove = (moduleId: number) => {
//         if (confirm('Are you sure you want to remove this module from the plan?')) {
//             router.delete(route('product-management.plans.modules.remove', { 
//                 plan: plan.id, 
//                 module: moduleId 
//             }));
//         }
//     };

//     return (
//         <ResourceListLayout
//             title={pageConfig.title}
//             description={pageConfig.description}
//             breadcrumbs={breadcrumbs}
//             headerActions={
//                 <Button variant="outline" onClick={() => router.get(route('product-management.plans.index'))}>
//                     <ChevronLeft className="h-4 w-4 mr-2" /> Back to Plans
//                 </Button>
//             }
//             config={{ showFilter: false, showPagination: false }}
//         >
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <Card className="lg:col-span-1 h-fit border-zinc-200 shadow-sm">
//                     <CardHeader className="pb-4">
//                         <CardTitle className="text-base font-semibold">Plan Information</CardTitle>
//                         <CardDescription className="text-xs">Subscription details and pricing</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-5">
//                         <div className="space-y-2">
//                             <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Plan Name</Label>
//                             <div className="flex items-center gap-2">
//                                 <CreditCard className="h-4 w-4 text-blue-600" />
//                                 <p className="font-semibold text-foreground">{plan.name}</p>
//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</Label>
//                             {plan.is_active ? (
//                                 <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">
//                                     Active
//                                 </span>
//                             ) : (
//                                 <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-400">
//                                     Archived
//                                 </span>
//                             )}
//                         </div>

//                         <div className="space-y-2">
//                             <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Modules</Label>
//                             <p className="text-2xl font-bold text-foreground tabular-nums">{plan.modules_count}</p>
//                         </div>

//                         {plan.description && (
//                             <div className="space-y-2">
//                                 <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Description</Label>
//                                 <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
//                             </div>
//                         )}

//                         <div className="pt-4 border-t border-zinc-100 space-y-4">
//                             <div className="space-y-2">
//                                 <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Monthly Price</Label>
//                                 <p className="text-2xl font-bold text-foreground">{formatIDR(plan.price_monthly)}</p>
//                             </div>

//                             {plan.price_yearly && (
//                                 <div className="space-y-2">
//                                     <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Yearly Price</Label>
//                                     <p className="text-2xl font-bold text-foreground">{formatIDR(plan.price_yearly)}</p>
//                                     <p className="text-xs text-green-600">
//                                         Save {formatIDR((plan.price_monthly * 12) - plan.price_yearly)}
//                                     </p>
//                                 </div>
//                             )}

//                             {plan.is_basic && !plan.price_yearly && (
//                                 <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-700 dark:text-amber-300">
//                                     <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
//                                     <p className="leading-relaxed">
//                                         Basic plans only support monthly billing to encourage upgrades.
//                                     </p>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="flex items-start gap-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300">
//                             <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
//                             <p className="leading-relaxed">
//                                 Plan pricing is calculated based on included modules. Add or remove modules to adjust the plan features.
//                             </p>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card className="lg:col-span-2 border-zinc-200 shadow-sm">
//                     <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
//                         <div>
//                             <CardTitle className="text-base font-semibold">Included Modules</CardTitle>
//                             <CardDescription className="text-xs mt-1">
//                                 Modules bundled in this subscription plan
//                             </CardDescription>
//                         </div>
                        
//                         {pageConfig.can_manage && (
//                             <Button onClick={() => setIsModalOpen(true)} size="sm">
//                                 <Plus className="h-4 w-4 mr-2" />
//                                 Add Modules
//                             </Button>
//                         )}
//                     </CardHeader>
//                     <CardContent className="p-0">
//                         {plan.modules.length > 0 ? (
//                             <Table>
//                                 <TableHeader>
//                                     <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
//                                         <TableHead className="w-[50px] text-center">#</TableHead>
//                                         <TableHead>Module Name</TableHead>
//                                         {pageConfig.can_manage && (
//                                             <TableHead className="text-right px-6">Actions</TableHead>
//                                         )}
//                                     </TableRow>
//                                 </TableHeader>
//                                 <TableBody>
//                                     {plan.modules.map((module, index) => (
//                                         <TableRow key={module.id} className="group hover:bg-muted/30">
//                                             <TableCell className="text-center text-muted-foreground tabular-nums">
//                                                 {index + 1}
//                                             </TableCell>
//                                             <TableCell>
//                                                 <div className="flex items-center gap-3">
//                                                     <div className="h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
//                                                         <Box className="h-4 w-4 text-blue-600 dark:text-blue-400" />
//                                                     </div>
//                                                     <span className="font-medium text-foreground">{module.name}</span>
//                                                 </div>
//                                             </TableCell>
//                                             {pageConfig.can_manage && (
//                                                 <TableCell className="text-right px-6">
//                                                     <Button 
//                                                         variant="ghost" 
//                                                         size="icon" 
//                                                         className="h-8 w-8 hover:text-red-600" 
//                                                         onClick={() => handleRemove(module.id)}
//                                                     >
//                                                         <Trash2 className="h-3.5 w-3.5" />
//                                                     </Button>
//                                                 </TableCell>
//                                             )}
//                                         </TableRow>
//                                     ))}
//                                 </TableBody>
//                             </Table>
//                         ) : (
//                             <div className="flex flex-col items-center justify-center py-16 text-center">
//                                 <Box className="h-12 w-12 text-muted-foreground/40 mb-3" />
//                                 <p className="text-sm font-medium text-foreground">No modules assigned yet</p>
//                                 <p className="text-xs text-muted-foreground mt-1">
//                                     Click "Add Modules" to include modules in this plan
//                                 </p>
//                             </div>
//                         )}
//                     </CardContent>
//                 </Card>
//             </div>

//             <Dialog open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if(!val) reset(); }}>
//                 <DialogContent className="sm:max-w-[500px]">
//                     <DialogHeader>
//                         <DialogTitle>Add Modules to {plan.name}</DialogTitle>
//                         <DialogDescription>
//                             Select available modules to include in this plan
//                         </DialogDescription>
//                     </DialogHeader>

//                     <div className="space-y-4 pt-4">
//                         {available_modules.length > 0 ? (
//                             <div className="max-h-[350px] overflow-y-auto border border-zinc-200 rounded-md">
//                                 {available_modules.map((module) => (
//                                     <div 
//                                         key={module.id} 
//                                         className="flex items-center space-x-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-zinc-100 last:border-0"
//                                         onClick={() => toggleModule(module.id)}
//                                     >
//                                         <Checkbox 
//                                             id={`module-${module.id}`}
//                                             checked={data.modules.includes(module.id)}
//                                             onCheckedChange={() => toggleModule(module.id)}
//                                             onClick={(e) => e.stopPropagation()}
//                                         />
//                                         <label 
//                                             htmlFor={`module-${module.id}`}
//                                             className="text-sm font-medium cursor-pointer flex-1"
//                                         >
//                                             {module.name}
//                                         </label>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-200 rounded-md">
//                                 <Box className="h-10 w-10 text-muted-foreground/40 mb-2" />
//                                 <p className="text-sm text-muted-foreground">No available modules</p>
//                                 <p className="text-xs text-muted-foreground mt-1">All active modules are already included in this plan</p>
//                             </div>
//                         )}

//                         {data.modules.length > 0 && (
//                             <div className="flex items-center gap-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300">
//                                 <Info className="h-4 w-4 flex-shrink-0" />
//                                 <p>
//                                     <strong>{data.modules.length}</strong> module(s) selected
//                                 </p>
//                             </div>
//                         )}
//                     </div>

//                     <DialogFooter className="gap-2 pt-2">
//                         <Button type="button" variant="ghost" size="lg" onClick={() => setIsModalOpen(false)} className="text-zinc-500">
//                             Cancel
//                         </Button>
//                         <Button 
//                             onClick={handleAssign} 
//                             disabled={processing || data.modules.length === 0}
//                             size="lg"
//                             className="px-6 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
//                         >
//                             {processing ? 'Adding...' : `Add ${data.modules.length} Module(s)`}
//                         </Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </ResourceListLayout>
//     );
// }

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
                <Card className="lg:col-span-1 h-fit border-zinc-200 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold">Plan Information</CardTitle>
                        <CardDescription className="text-xs">Subscription details and pricing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Plan Name</Label>
                            <p className="font-semibold text-foreground">{plan.name}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</Label>
                            <div>
                                {plan.is_active ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 border border-green-200 px-2.5 py-1 text-xs font-medium text-green-700">
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 border border-dashed border-zinc-300 px-2.5 py-1 text-xs text-zinc-500">
                                        Inactive / Archived
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Modules</Label>
                            <p className="text-2xl font-bold text-foreground tabular-nums">{plan.modules_count}</p>
                        </div>

                        {plan.description && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Description</Label>
                                <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-zinc-100 space-y-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    {plan.duration === 365 ? 'Yearly Price' : 'Monthly Price'}
                                </Label>
                                <p className="text-2xl font-bold text-foreground">
                                    {plan.price === 0 ? 'FREE' : formatIDR(plan.price)}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
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

                <Card className="lg:col-span-2 border-zinc-200 shadow-sm">
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
                                <p className="text-xs text-muted-foreground mt-1">
                                    Click "Add Modules" to include features in this plan
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if(!val) reset(); }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Modules to {plan.name}</DialogTitle>
                        <DialogDescription>
                            Select available modules to include in this plan
                        </DialogDescription>
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