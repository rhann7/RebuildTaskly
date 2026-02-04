import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem, PaginatedData, SelectOption } from '@/types';
import { Plus, Trash2, Pencil, Search, Box, Zap, Settings2 } from 'lucide-react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type Module = {
    id: number;
    name: string;
    slug: string;
    type: 'standard' | 'addon';
    price: number;
    price_fmt: string;
    is_active: boolean;
    permissions_count: number;
    form_default: {
        name: string;
        type: string;
        price: number;
        description: string;
        is_active: boolean;
    };
};

type PageProps = {
    modules: PaginatedData<Module>;
    filters: { search?: string; type?: string; };
    pageConfig: PageConfig; 
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Modules List', href: route('product-management.modules.index') },
];

export default function ModuleIndex({ modules, filters, pageConfig }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'standard',
        price: 0,
        description: '',
        is_active: true,
    });

    const handleFilterChange = (newSearch?: string, newType?: string) => {
        const params: any = {
            search: newSearch ?? searchQuery,
            type: newType ?? filters.type,
        };

        if (params.type === 'all') delete params.type;
        if (!params.search) delete params.search;

        router.get(route('product-management.modules.index'), params, { 
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

    const openEditModal = (m: Module) => {
        setIsEditing(true);
        setCurrentSlug(m.slug);
        setData(m.form_default);
        clearErrors();
        setIsOpen(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: () => { setIsOpen(false); reset(); }};

        if (isEditing && currentSlug) {
            put(route('product-management.modules.update', { module: currentSlug }), options);
        } else {
            post(route('product-management.modules.store'), options);
        }
    };

    const handleDelete = (m: Module) => {
        if (confirm(`Are you sure you want to delete module "${m.name}"? All permissions in this module will become unassigned.`)) {
            router.delete(route('product-management.modules.destroy', { module: m.slug }), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                }
            });
        }
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search modules..."
                    className="pl-9 bg-background h-9 border-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
                />
            </div>

            <Select value={filters.type || 'all'} onValueChange={(val) => handleFilterChange(undefined, val)}>
                <SelectTrigger className="w-[180px] h-9 bg-background">
                    <SelectValue placeholder="Module Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {pageConfig.options?.types?.map((opt: SelectOption) => (
                        <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>
                    ))}
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
                headerActions={<Button onClick={openCreateModal}><Plus className="h-4 w-4 mr-2" />Add New Module</Button>}
                pagination={modules}
                isEmpty={modules.data.length === 0}
                config={{ 
                    showFilter: true, 
                    showPagination: true, 
                    showPaginationInfo: true, 
                    showHeaderActions: true, 
                    showShadow: true, 
                    showBorder: true, 
                    emptyStateIcon: <Box className="h-6 w-6 text-muted-foreground/60" /> 
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Module Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {modules.data.map((module, i) => (
                            <TableRow key={module.id} className="group hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground tabular-nums">
                                    {modules.from + i}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{module.name}</span>
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tight">{module.slug}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
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
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-sm text-foreground">{module.price_fmt}</span>
                                </TableCell>
                                <TableCell>
                                    {module.is_active ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-400">
                                            Inactive
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right px-6 space-x-1">
                                    <Link href={route('product-management.modules.show', { module: module.slug })}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Manage Permissions">
                                            <Settings2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(module)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(module)}>
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
                        <DialogTitle>{isEditing ? 'Edit Module' : 'New Module'}</DialogTitle>
                        <DialogDescription>Configure module details and pricing for subscription plans.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Module Name</Label>
                                <Input 
                                    id="name" 
                                    value={data.name} 
                                    onChange={(e) => setData('name', e.target.value)} 
                                    placeholder="Inventory Management" 
                                    className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Module Type</Label>
                                <Select value={data.type} onValueChange={(val: any) => setData('type', val)}>
                                    <SelectTrigger className="h-9 border-zinc-200 shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard">
                                            <div className="flex items-center gap-2">
                                                <Box className="h-3 w-3" />
                                                Standard
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="addon">
                                            <div className="flex items-center gap-2">
                                                <Zap className="h-3 w-3" />
                                                Add-on
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Module Price (IDR)</Label>
                            <Input 
                                id="price" 
                                type="number" 
                                value={data.price === 0 ? '' : data.price} 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setData('price', val === '' ? 0 : Number(val));
                                }}
                                placeholder="Enter price..."
                                className="h-9 border-zinc-200 shadow-none focus-visible:ring-zinc-200"
                            />
                            <InputError message={errors.price} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Description</Label>
                            <Textarea 
                                id="description" 
                                value={data.description} 
                                onChange={(e) => setData('description', e.target.value)} 
                                className="min-h-[80px] border-zinc-200 shadow-none focus-visible:ring-zinc-200" 
                                placeholder="Brief explanation of the module features..."
                            />
                            <InputError message={errors.description} />
                        </div>

                        {isEditing && (
                            <div className="flex items-center justify-between py-4 border-t border-b border-zinc-100 border-dashed">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is-active" className="text-sm font-medium">Active Status</Label>
                                    <p className="text-[11px] text-zinc-400">Enable this module to be available in subscription plans.</p>
                                </div>
                                <Switch 
                                    id="is-active"
                                    checked={data.is_active} 
                                    onCheckedChange={(val) => setData('is_active', val)} 
                                />
                            </div>
                        )}

                        <DialogFooter className="gap-2 pt-2">
                            <Button type="button" variant="ghost" size="lg" onClick={() => setIsOpen(false)} className="text-zinc-500">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} size="lg" className="px-6 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
                                {isEditing ? 'Save Changes' : 'Create Module'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}