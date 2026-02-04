import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState } from 'react';
import { type BreadcrumbItem, type PageConfig } from '@/types';
import { useForm, router } from '@inertiajs/react';
import { ChevronLeft, Plus, Trash2, ShieldCheck, Box, Info, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Permission {
    id: number;
    name: string;
}

interface ModuleData {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'standard' | 'addon';
    is_active: boolean;
    price_fmt: string;
    permissions_count: number;
    permissions: Permission[];
}

interface PageProps {
    module: ModuleData;
    homeless_permissions: { id: number; name: string }[];
    pageConfig: PageConfig;
}

export default function ModuleShow({ module, homeless_permissions, pageConfig }: PageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        permissions: [] as number[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Modules', href: route('product-management.modules.index') },
        { title: module.name, href: '#' },
    ];

    const togglePermission = (id: number) => {
        const current = data.permissions.includes(id)
            ? data.permissions.filter(pId => pId !== id)
            : [...data.permissions, id];
        setData('permissions', current);
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('product-management.modules.permissions.assign', { module: module.id }), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const handleRemove = (permissionId: number) => {
        if (confirm('Are you sure you want to remove this permission from the module? It will become unassigned.')) {
            router.delete(route('product-management.modules.permissions.remove', { permission: permissionId }));
        }
    };

    return (
        <ResourceListLayout
            title={pageConfig.title}
            description={pageConfig.description}
            breadcrumbs={breadcrumbs}
            headerActions={
                <Button variant="outline" onClick={() => router.get(route('product-management.modules.index'))}>
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back to Modules
                </Button>
            }
            config={{ showFilter: false, showPagination: false }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 h-fit border-zinc-200 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold">Module Information</CardTitle>
                        <CardDescription className="text-xs">Details and pricing configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Module Name</Label>
                            <div className="flex items-center gap-2">
                                {module.type === 'standard' ? (
                                    <Box className="h-4 w-4 text-blue-600" />
                                ) : (
                                    <Zap className="h-4 w-4 text-purple-600" />
                                )}
                                <p className="font-semibold text-foreground">{module.name}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Type</Label>
                            {module.type === 'standard' ? (
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                                    <Box className="h-3 w-3" />
                                    Standard
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                                    <Zap className="h-3 w-3" />
                                    Add-on
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</Label>
                            {module.is_active ? (
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                                    Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-400">
                                    Inactive
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Permissions</Label>
                            <p className="text-2xl font-bold text-foreground tabular-nums">{module.permissions_count}</p>
                        </div>

                        {module.description && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Description</Label>
                                <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-zinc-100 space-y-2">
                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Module Price</Label>
                            <p className="text-2xl font-bold text-foreground">{module.price_fmt}</p>
                        </div>

                        <div className="flex items-start gap-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p className="leading-relaxed">
                                This price will be charged to customers when purchasing a plan containing this module.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-zinc-200 shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-base font-semibold">Assigned Permissions</CardTitle>
                            <CardDescription className="text-xs mt-1">
                                Permissions bundled in this module
                            </CardDescription>
                        </div>
                        
                        {pageConfig.can_manage && (
                            <Button onClick={() => setIsModalOpen(true)} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Permissions
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {module.permissions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                                        <TableHead className="w-[50px] text-center">#</TableHead>
                                        <TableHead>Permission Name</TableHead>
                                        {pageConfig.can_manage && (
                                            <TableHead className="text-right px-6">Actions</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {module.permissions.map((permission, index) => (
                                        <TableRow key={permission.id} className="group hover:bg-muted/30">
                                            <TableCell className="text-center text-muted-foreground tabular-nums">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-md bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                                                        <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <span className="font-medium text-foreground">{permission.name}</span>
                                                </div>
                                            </TableCell>
                                            {pageConfig.can_manage && (
                                                <TableCell className="text-right px-6">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 hover:text-red-600" 
                                                        onClick={() => handleRemove(permission.id)}
                                                    >
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
                                <ShieldCheck className="h-12 w-12 text-muted-foreground/40 mb-3" />
                                <p className="text-sm font-medium text-foreground">No permissions assigned yet</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Click "Add Permissions" to assign permissions to this module
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if(!val) reset(); }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Permissions to {module.name}</DialogTitle>
                        <DialogDescription>
                            Select unassigned permissions to add to this module
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        {homeless_permissions.length > 0 ? (
                            <div className="max-h-[350px] overflow-y-auto border border-zinc-200 rounded-md">
                                {homeless_permissions.map((permission) => (
                                    <div 
                                        key={permission.id} 
                                        className="flex items-center space-x-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-zinc-100 last:border-0"
                                        onClick={() => togglePermission(permission.id)}
                                    >
                                        <Checkbox 
                                            id={`permission-${permission.id}`}
                                            checked={data.permissions.includes(permission.id)}
                                            onCheckedChange={() => togglePermission(permission.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <label 
                                            htmlFor={`permission-${permission.id}`}
                                            className="text-sm font-medium cursor-pointer flex-1"
                                        >
                                            {permission.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-200 rounded-md">
                                <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mb-2" />
                                <p className="text-sm text-muted-foreground">No unassigned permissions available</p>
                            </div>
                        )}

                        {data.permissions.length > 0 && (
                            <div className="flex items-center gap-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300">
                                <Info className="h-4 w-4 flex-shrink-0" />
                                <p>
                                    <strong>{data.permissions.length}</strong> permission(s) selected
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="ghost" size="lg" onClick={() => setIsModalOpen(false)} className="text-zinc-500">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAssign} 
                            disabled={processing || data.permissions.length === 0}
                            size="lg"
                            className="px-6 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                        >
                            {processing ? 'Adding...' : `Add ${data.permissions.length} Permission(s)`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ResourceListLayout>
    );
}