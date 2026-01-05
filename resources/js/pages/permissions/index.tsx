import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Pencil, Search, Star, Zap, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type Permission = {
    id: number;
    name: string;
    type: string;
    scope: string;
    price: number;
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
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Permissions List', href: '/access-control/permissions' },
];

export default function PermissionIndex({ permissions, filters }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [scopeFilter, setScopeFilter] = useState(filters.scope || 'all');
    
    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm({ 
        name: '', 
        type: 'general',
        scope: 'company',
        price: '' 
    });

    // Logika pengaman agar harga selalu 0 jika scope-nya system
    useEffect(() => {
        transform((data) => ({
            ...data,
            price: data.scope === 'system' ? '0' : data.price,
        }));
    }, [data.scope, data.price, transform]);

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
        setData({ name: '', type: 'general', scope: 'company', price: '' });
        clearErrors(); 
        setIsOpen(true); 
    };
    
    const openEditModal = (p: Permission) => { 
        setIsEditing(true); 
        setCurrentId(p.id); 
        setData({ name: p.name, type: p.type, scope: p.scope, price: p.price.toString() }); 
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

            {/* Scope Filter kembali ke versi awal (Compact) */}
            <Select value={scopeFilter} onValueChange={(val) => { setScopeFilter(val); handleFilterChange(undefined, undefined, val); }}>
                <SelectTrigger className="w-[160px] h-9 bg-background">
                    <SelectValue placeholder="All Scopes" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="workspace">Workspace</SelectItem>
                </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); handleFilterChange(undefined, val); }}>
                <SelectTrigger className="w-[160px] h-9 bg-background">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>
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
                title="Manage Permissions"
                description="Control access levels and feature availability."
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
                                <TableCell className="font-medium text-foreground">{permission.name}</TableCell>
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Permission' : 'New Permission'}</DialogTitle>
                        <DialogDescription>Define the permission key and its category.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                        <div className="grid gap-2">
                            <Label>Identifier</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. create-workspace" autoFocus />
                            <InputError message={errors.name} />
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
                                <InputError message={errors.price as string} />
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{isEditing ? 'Save Changes' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}