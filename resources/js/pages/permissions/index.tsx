import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem } from '@/types';
import { Plus, Trash2, Pencil, Search, Star, Zap, ShieldCheck, LayoutGrid } from 'lucide-react';

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
    type: string;
    scope: string;
    price: number;
    route_path: string | null;
    route_name: string | null;
    controller_action: string | null;
    icon: string | null;
    isMenu: boolean;
    guard_name: string;
    created_at: string;
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
    pageConfig: PageConfig & {
        routes: Array<{
            route_path: string;
            route_name: string;
            controller_action: string;
        }>
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Permissions List', href: '/access-control/permissions' },
];

export default function PermissionIndex({ permissions, filters, pageConfig }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [scopeFilter, setScopeFilter] = useState(filters.scope || 'all');
    
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({ 
        name: '', 
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
        router.get('/access-control/permissions', { 
            search: newSearch ?? searchQuery, 
            type: newType ?? typeFilter,
            scope: newScope ?? scopeFilter
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
            type: p.type, 
            scope: p.scope, 
            price: p.price.toString(),
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
        const url = isEditing && currentId ? `/access-control/permissions/${currentId}` : '/access-control/permissions'; 
        
        if (isEditing) {
            put(url, { onSuccess: () => { setIsOpen(false); reset(); } });
        } else {
            post(url, { onSuccess: () => { setIsOpen(false); reset(); } });
        }
    };

    const handleDelete = (id: number) => { 
        if (confirm('Are you sure you want to delete this permission?')) {
            router.delete(`/access-control/permissions/${id}`); 
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
            
            <Select value={scopeFilter} onValueChange={(val) => { setScopeFilter(val); handleFilterChange(undefined, undefined, val); }}>
                <SelectTrigger className="w-[160px] h-9 bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {pageConfig.options.scopes.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); handleFilterChange(undefined, val); }}>
                <SelectTrigger className="w-[160px] h-9 bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {pageConfig.options.types.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                        </SelectItem>
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
                            <TableHead>Permission</TableHead>
                            <TableHead>Route Path</TableHead>
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
                                        {permission.isMenu && (
                                            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                                                <LayoutGrid className="h-3 w-3" /> SIDEBAR MENU
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-[11px] text-muted-foreground">
                                    {permission.route_path || '-'}
                                </TableCell>
                                <TableCell>
                                    <span className="capitalize text-xs font-mono bg-muted/50 px-2 py-0.5 rounded border">
                                        {permission.scope}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center gap-1 rounded border bg-muted/50 px-2 py-0.5 text-[11px] font-medium ${permission.type === 'unique' ? 'text-purple-500' : 'text-muted-foreground'}`}>
                                        {permission.type === 'unique' ? <Star className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                                        {permission.type}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-mono text-sm font-medium">
                                            {permission.scope === 'system' ? 'Admin Only' : `Rp ${new Intl.NumberFormat('id-ID').format(permission.price)}`}
                                        </span>
                                        {permission.scope !== 'system' && <span className="text-[10px] text-muted-foreground">per month</span>}
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
                        <DialogDescription>Define the permission key and link it to a system route.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="grid gap-2">
                            <Label>Lucide Icon Name</Label>
                            <Input value={data.icon} onChange={(e) => setData('icon', e.target.value)} placeholder="e.g. LayoutGrid, Zap, Settings" />
                            <p className="text-[10px] text-muted-foreground">Use any icon name from lucide-react.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label>Identifier (Permission Name)</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. access-workspace" />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2 border-t pt-4">
                            <Label className="text-blue-600 text-xs uppercase font-bold">Dynamic Route Configuration</Label>
                            <Select value={data.route_name} onValueChange={handleRouteSelect}>
                                <SelectTrigger className="bg-blue-50/30 border-blue-100">
                                    <SelectValue placeholder="Autofill from existing Laravel routes..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {pageConfig.routes.map((r) => (
                                        <SelectItem key={r.route_name} value={r.route_name}>
                                            <div className="flex flex-col items-start">
                                                <span>{r.route_name}</span>
                                                <span className="text-[10px] text-muted-foreground">{r.route_path}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.route_name} />
                        </div>

                        <div className="flex items-center space-x-2 border rounded-md p-3 bg-zinc-50/50">
                            <Switch checked={data.isMenu} onCheckedChange={(val) => setData('isMenu', val)} />
                            <div className="grid gap-0.5">
                                <Label className="text-sm font-semibold">Sidebar Menu</Label>
                                <span className="text-[10px] text-muted-foreground">Automatically show this route in the sidebar if accessible.</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Scope Access</Label>
                                <Select value={data.scope} onValueChange={(val) => setData('scope', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="system">System</SelectItem>
                                        <SelectItem value="company">Company</SelectItem>
                                        <SelectItem value="workspace">Workspace</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="unique">Unique</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {data.scope !== 'system' && (
                            <div className="grid gap-2">
                                <Label>Monthly Price (IDR)</Label>
                                <Input type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} placeholder="50000" />
                                <InputError message={errors.price} />
                            </div>
                        )}

                        <DialogFooter className="border-t pt-4 mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{isEditing ? 'Save Changes' : 'Create Permission'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}