import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem, PaginatedData, SelectOption } from '@/types';
import { Plus, Trash2, Pencil, Search, ShieldCheck, LayoutGrid } from 'lucide-react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type Permission = {
    id: number;
    name: string;
    ui: {
        is_menu: boolean;
        icon: string | null;
        module_name: string;
        has_module: boolean;
    };
    route_info: { name: string; };
    form_default: {
        name: string;
        route_name: string;
        icon: string;
        isMenu: boolean;
        module_id: number | null;
    };
};

type PageProps = {
    permissions: PaginatedData<Permission>;
    filters: { search?: string; module_id?: string; };
    pageConfig: PageConfig & { routes: Array<{ route_name: string; }>; };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Permissions List', href: route('access-control.permissions.index') },
];

export default function PermissionIndex({ permissions, filters, pageConfig }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        route_name: '',
        icon: '',
        isMenu: false,
        module_id: null as string | number | null,
    });

    const handleRouteSelect = (routeName: string) => setData('route_name', routeName);

    const handleFilterChange = (newSearch?: string, newModule?: string) => {
        const params: any = {
            search: newSearch ?? searchQuery,
            module_id: newModule ?? filters.module_id,
        };
        
        if (params.module_id === 'all') delete params.module_id;
        if (!params.search) delete params.search;

        router.get(route('access-control.permissions.index'), params, { preserveState: true, replace: true });
    };

    const openCreateModal = () => { setIsEditing(false); setCurrentId(null); reset(); clearErrors(); setIsOpen(true); };
    const openEditModal = (p: Permission) => { setIsEditing(true); setCurrentId(p.id); setData(p.form_default); clearErrors(); setIsOpen(true); };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: () => { setIsOpen(false); reset(); } };
        if (isEditing && currentId) {
            put(route('access-control.permissions.update', { permission: currentId }), options);
        } else {
            post(route('access-control.permissions.store'), options);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this permission?')) {
            router.delete(route('access-control.permissions.destroy', { permission: id }), { onSuccess: () => { setIsOpen(false); reset(); } });
        }
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search permissions..."
                    className="pl-9 bg-background h-9 border-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
                />
            </div>

            <Select value={filters.module_id || 'all'} onValueChange={(val) => handleFilterChange(undefined, val)}>
                <SelectTrigger className="w-[180px] h-9 bg-background">
                    <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {pageConfig.options?.modules?.map((m: SelectOption) => (
                        <SelectItem key={String(m.value)} value={String(m.value)}>{m.label}</SelectItem>
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
                headerActions={<Button onClick={openCreateModal}><Plus className="h-4 w-4 mr-2" />Add New Permission</Button>}
                pagination={permissions}
                isEmpty={permissions.data.length === 0}
                config={{ showFilter: true, showPagination: true, showPaginationInfo: true, showHeaderActions: true, showShadow: true, showBorder: true, emptyStateIcon: <ShieldCheck className="h-6 w-6 text-muted-foreground/60" /> }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Permission Name</TableHead>
                            <TableHead>Module</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {permissions.data.map((permission, i) => (
                            <TableRow key={permission.id} className="group hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground tabular-nums">{permissions.from + i}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">{permission.name}</span>
                                        </div>
                                        {permission.ui.is_menu && (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1 tracking-tight">
                                                    <LayoutGrid className="h-3 w-3" /> Sidebar Menu
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {permission.ui.has_module ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                                            {permission.ui.module_name}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-400">
                                            Unassigned
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right px-6 space-x-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(permission)}><Pencil className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(permission.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResourceListLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Permission' : 'New Permission'}</DialogTitle>
                        <DialogDescription>Create permissions for Laravel routes access.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[10px] uppercase font-bold text-zinc-400">Permission Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="view-reports" className="h-9 border-zinc-400 shadow-none focus-visible:ring-zinc-400" />
                                <InputError message={errors.name} />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="icon" className="text-[10px] uppercase font-bold text-zinc-400">Lucide Icon</Label>
                                <Input id="icon" value={data.icon} onChange={(e) => setData('icon', e.target.value)} placeholder="LayoutGrid" className="h-9 border-zinc-400 shadow-none focus-visible:ring-zinc-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-zinc-400 flex items-center">Module Assignment</Label>
                            <Select 
                                value={data.module_id ? String(data.module_id) : "unassigned"} 
                                onValueChange={(val) => setData('module_id', val === "unassigned" ? null : val)}
                            >
                                <SelectTrigger className="w-full h-9 border-zinc-400 shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent">
                                    <SelectValue placeholder="Pilih Module (Opsional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">None / Unassigned</SelectItem>
                                    {pageConfig.options?.modules?.map((m: SelectOption) => (
                                        <SelectItem key={String(m.value)} value={String(m.value)}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {!data.module_id && (
                                <p className="text-xs text-amber-600 flex items-center gap-1">
                                    Permission without a module will not be included in any plan.
                                </p>
                            )}
                            
                            <InputError message={errors.module_id} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-2">Route Mapping</Label>
                            <Select value={data.route_name || ""} onValueChange={handleRouteSelect}>
                                <SelectTrigger className="w-full h-9 border-zinc-400 shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent">
                                    <SelectValue placeholder="Choose laravel routes..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {pageConfig.routes.map(r => (
                                        <SelectItem key={r.route_name} value={r.route_name}>
                                            <span className="text-sm">{r.route_name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.route_name} />
                        </div>

                        <div className="flex items-center justify-between py-4 border-t border-b border-zinc-100 border-dashed">
                            <div className="space-y-0.5">
                                <Label htmlFor="is-menu" className="text-sm font-medium">Display in Sidebar</Label>
                                <p className="text-[11px] text-zinc-400">Use this route as the main navigation menu.</p>
                            </div>
                            <Switch id="is-menu" checked={data.isMenu} onCheckedChange={(val) => setData('isMenu', val)} />
                        </div>

                        <DialogFooter className="gap-2 pt-2">
                            <Button type="button" variant="ghost" size="lg" onClick={() => setIsOpen(false)} className="text-zinc-500">Cancel</Button>
                            <Button type="submit" disabled={processing} size="lg" className="px-6 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
                                {isEditing ? 'Save Changes' : 'Create Permission'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}