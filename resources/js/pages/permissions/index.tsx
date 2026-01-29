import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem } from '@/types';
import { Plus, Trash2, Pencil, Search, Star, Zap, ShieldCheck, LayoutGrid, Link as LinkIcon, Box } from 'lucide-react';

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
    module_id: number | null;
    module_name: string;
    type: 'general' | 'unique';
    scope: 'company' | 'workspace';
    price_raw: number;
    price_fmt: string;
    route_path: string | null;
    route_name: string | null;
    controller_action: string | null;
    icon: string | null;
    isMenu: boolean;
};

type PageProps = {
    permissions: {
        data: Permission[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number;
        to: number;
        total: number;
    };
    filters: { search?: string; type?: string; scope?: string; };
    modules: Array<{ id: number; name: string }>;
    pageConfig: PageConfig & {
        routes: Array<{
            route_path: string;
            route_name: string;
            controller_action: string;
        }>;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Permissions List', href: route('access-control.permissions.index') },
];

export default function PermissionIndex({ permissions, filters, modules, pageConfig }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        module_id: '' as string | number,
        type: 'general',
        scope: 'company',
        price: '',
        route_path: '',
        route_name: '',
        controller_action: '',
        icon: '',
        isMenu: false,
    });

    const handleRouteSelect = (routeName: string) => {
        const selected = pageConfig.routes.find(r => r.route_name === routeName);
        if (selected) {
            setData((prev) => ({
                ...prev,
                route_name: selected.route_name,
                route_path: selected.route_path,
                controller_action: selected.controller_action,
            }));
        }
    };

    const handleFilterChange = (newSearch?: string, newType?: string, newScope?: string) => {
        router.get(route('access-control.permissions.index'), {
            search: newSearch ?? searchQuery,
            type: newType ?? filters.type,
            scope: newScope ?? filters.scope
        }, { preserveState: true, replace: true });
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
        setData({
            name: p.name,
            module_id: p.module_id || '',
            type: p.type,
            scope: p.scope,
            price: p.price_raw.toString(),
            route_path: p.route_path || '',
            route_name: p.route_name || '',
            controller_action: p.controller_action || '',
            icon: p.icon || '',
            isMenu: p.isMenu,
        });
        clearErrors();
        setIsOpen(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing && currentId) {
            put(route('access-control.permissions.update', { permission: currentId }), { onSuccess: () => { setIsOpen(false); reset(); } });
        } else {
            post(route('access-control.permissions.store'), { onSuccess: () => { setIsOpen(false); reset(); } });
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

            <Select value={filters.scope || 'all'} onValueChange={(val) => handleFilterChange(undefined, undefined, val)}>
                <SelectTrigger className="w-[160px] h-9 bg-background"><SelectValue placeholder="Scope" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="workspace">Workspace</SelectItem>
                </SelectContent>
            </Select>

            <Select value={filters.type || 'all'} onValueChange={(val) => handleFilterChange(undefined, val)}>
                <SelectTrigger className="w-[160px] h-9 bg-background"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="unique">Unique</SelectItem>
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
                            <TableHead>Permission & Module</TableHead>
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
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                                <Box className="h-2.5 w-2.5" /> {permission.module_name}
                                            </span>
                                            {permission.isMenu && (
                                                <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1 uppercase tracking-tight">
                                                    <LayoutGrid className="h-3 w-3" /> Sidebar Menu
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><span className="capitalize text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">{permission.scope}</span></TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium bg-zinc-50 dark:bg-zinc-900 ${permission.type === 'unique' ? 'text-zinc-900 dark:text-zinc-100 border-zinc-300' : 'text-zinc-500 border-zinc-200'}`}>
                                        {permission.type === 'unique' ? <Star className="h-3 w-3" /> : <Zap className="h-3 w-3" />} {permission.type}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-mono text-sm font-medium">{permission.price_fmt}</span>
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
                <DialogContent className="sm:max-w-[500px] border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">{isEditing ? 'Edit Permission' : 'New Permission'}</DialogTitle>
                        <DialogDescription>Tentukan modul dan rute Laravel yang akan dikontrol aksesnya.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Module Association</Label>
                            <Select value={data.module_id?.toString()} onValueChange={(val) => setData('module_id', val)}>
                                <SelectTrigger className="h-10 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50">
                                    <SelectValue placeholder="Pilih modul fitur..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {modules.map((m) => (
                                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.module_id} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Permission Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. view-dashboard" className="h-10 border-zinc-200" />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="icon" className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Lucide Icon</Label>
                                <div className="relative">
                                    <Input id="icon" value={data.icon} onChange={(e) => setData('icon', e.target.value)} placeholder="LayoutGrid" className="h-10 pl-10 border-zinc-200" />
                                    <LayoutGrid className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30">
                            <div className="flex items-center gap-2 mb-1">
                                <LinkIcon className="h-4 w-4 text-zinc-500" />
                                <Label className="text-xs font-semibold uppercase">Route Mapping</Label>
                            </div>
                            
                            <Select value={data.route_name || ""} onValueChange={handleRouteSelect}>
                                <SelectTrigger className="w-full h-10 bg-background border-zinc-200">
                                    <SelectValue placeholder="Pilih rute Laravel..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {pageConfig.routes.map(r => (
                                        <SelectItem key={r.route_name} value={r.route_name}>
                                            <div className="flex flex-col py-0.5">
                                                <span className="text-sm font-medium">{r.route_name}</span>
                                                <span className="text-[10px] text-zinc-500 font-mono italic">{r.route_path}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {data.route_name && (
                                <div className="grid grid-cols-2 gap-4 pt-2 mt-2 border-t border-zinc-100">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">Path</Label>
                                        <p className="text-[11px] font-mono text-zinc-600 truncate">{data.route_path}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">Action</Label>
                                        <p className="text-[11px] font-mono text-zinc-600 truncate">{data.controller_action}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Scope Access</Label>
                                <Select value={data.scope} onValueChange={(val) => setData('scope', val)}>
                                    <SelectTrigger className="h-10 border-zinc-200"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="company">Company</SelectItem>
                                        <SelectItem value="workspace">Workspace</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Permission Type</Label>
                                <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                    <SelectTrigger className="h-10 border-zinc-200"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General (Free)</SelectItem>
                                        <SelectItem value="unique">Unique (Paid)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Monthly Price (IDR)</Label>
                            <div className="relative">
                                <Input type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} placeholder="0" className="h-10 pl-10 border-zinc-200" />
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
                                {isEditing ? 'Update Permission' : 'Create Permission'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}