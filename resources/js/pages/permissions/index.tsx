import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem, PaginatedData, SelectOption } from '@/types';
import { Plus, Trash2, Pencil, Search, ShieldCheck, LayoutGrid, Link as LinkIcon } from 'lucide-react';

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
        type_label: string;
        type_color: string;
        scope_label: string;
        price_fmt: string;
        is_menu: boolean;
        module_name: string;
        has_module: boolean;
    };
    route_info: {
        name: string;
    };
    form_default: any;
};

type PageProps = {
    permissions: PaginatedData<Permission>;
    filters: { search?: string; type?: string; scope?: string; module_id?: string; };
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
        type: 'general',
        scope: 'company',
        price: '',
        route_name: '',
        icon: '',
        isMenu: false,
    });

    const handleRouteSelect = (routeName: string) => {
        setData('route_name', routeName);
    };

    const handleFilterChange = (newSearch?: string, newType?: string, newScope?: string, newModule?: string) => {
        const params: any = {
            search: newSearch ?? searchQuery,
            type: newType ?? filters.type,
            scope: newScope ?? filters.scope,
            module_id: newModule ?? filters.module_id,
        };

        if (params.type === 'all') delete params.type;
        if (params.scope === 'all') delete params.scope;
        if (params.module_id === 'all') delete params.module_id;
        if (!params.search) delete params.search;

        router.get(route('access-control.permissions.index'), params, { 
            preserveState: true, 
            replace: true 
        });
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentId(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const openEditModal = (p: Permission) => {
        setIsEditing(true);
        setCurrentId(p.id);
        setData(p.form_default);
        clearErrors();
        setIsOpen(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        };

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

            <Select 
                value={filters.module_id || 'all'} 
                onValueChange={(val) => handleFilterChange(undefined, undefined, undefined, val)}
            >
                <SelectTrigger className="w-[180px] h-9 bg-background">
                    <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {pageConfig.options?.modules?.map((m: SelectOption) => (
                        <SelectItem key={String(m.value)} value={String(m.value)}>
                            {m.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filters.scope || 'all'} onValueChange={(val) => handleFilterChange(undefined, undefined, val)}>
                <SelectTrigger className="w-[160px] h-9 bg-background"><SelectValue placeholder="Scope" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    {pageConfig.options?.scopes?.map((s: SelectOption) => (
                        <SelectItem key={String(s.value)} value={String(s.value)}>{s.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filters.type || 'all'} onValueChange={(val) => handleFilterChange(undefined, val)}>
                <SelectTrigger className="w-[160px] h-9 bg-background"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {pageConfig.options?.types?.map((t: SelectOption) => (
                        <SelectItem key={String(t.value)} value={String(t.value)}>{t.label}</SelectItem>
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
                            <TableHead>Scope</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {permissions.data.map((permission, i) => (
                            <TableRow key={permission.id} className="group hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground tabular-nums">{permissions.from + i}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{permission.name}</span>
                                        {permission.ui.is_menu && (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1 uppercase tracking-tight">
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
                                <TableCell>
                                    <span className="capitalize text-xs font-mono px-2 py-0.5 rounded border">
                                        {permission.ui.scope_label}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-mono ${permission.ui.type_color}`}>
                                        {permission.ui.type_label}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-mono text-sm font-medium">{permission.ui.price_fmt}</span>
                                        <span className="text-[10px] text-muted-foreground">per month</span>
                                    </div>
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
                        <DialogDescription>Kelola rute Laravel dan kontrol akses aplikasi.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-medium text-zinc-500 uppercase">Permission Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="view-reports" />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="icon" className="text-xs font-medium text-zinc-500 uppercase">Lucide Icon</Label>
                                <div className="relative">
                                    <Input id="icon" value={data.icon} onChange={(e) => setData('icon', e.target.value)} placeholder="LayoutGrid" className="pl-10" />
                                    <LayoutGrid className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 p-4 rounded-lg border border-zinc-200 bg-zinc-50/30">
                            <div className="flex items-center gap-2 mb-1">
                                <LinkIcon className="h-4 w-4 text-zinc-500" />
                                <Label className="text-xs font-semibold uppercase">Route Mapping</Label>
                            </div>
                            
                            <Select value={data.route_name || ""} onValueChange={handleRouteSelect}>
                                <SelectTrigger className="w-full bg-background">
                                    <SelectValue placeholder="Pilih rute Laravel..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {pageConfig.routes.map(r => (
                                        <SelectItem key={r.route_name} value={r.route_name}>
                                            <span className="text-sm font-medium">{r.route_name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.route_name} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-500 uppercase">Scope Access</Label>
                                <Select value={data.scope} onValueChange={(val: any) => setData('scope', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="company">Company</SelectItem>
                                        <SelectItem value="workspace">Workspace</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-500 uppercase">Permission Type</Label>
                                <Select value={data.type} onValueChange={(val: any) => setData('type', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General (Free)</SelectItem>
                                        <SelectItem value="unique">Unique (Paid)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-zinc-500 uppercase">Monthly Price (IDR)</Label>
                            <div className="relative">
                                <Input type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} placeholder="0" className="pl-10" />
                                <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-medium">Rp</span>
                            </div>
                            <InputError message={errors.price} />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 border-dashed">
                            <div className="space-y-0.5">
                                <Label htmlFor="is-menu" className="text-sm font-semibold">Tampilkan di Sidebar</Label>
                                <p className="text-[11px] text-zinc-500">Gunakan rute ini sebagai menu navigasi utama.</p>
                            </div>
                            <Switch id="is-menu" checked={data.isMenu} onCheckedChange={(val) => setData('isMenu', val)} />
                        </div>

                        <DialogFooter className="gap-2 pt-2 border-t mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing} className="px-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                                {isEditing ? 'Update' : 'Create'} Permission
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}