import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Pencil, Search, Star, Zap, Filter, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type Permission = {
    id: number;
    name: string;
    type: string;
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
    filters: { search?: string; type?: string; };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Permissions', href: '/access-control/permissions' },
];

export default function PermissionIndex({ permissions, filters }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({ 
        name: '', 
        type: 'general',
        price: '' 
    });

    const openCreateModal = () => { 
        setIsEditing(false); 
        setCurrentId(null); 
        setData({ name: '', type: 'general', price: '' }); 
        clearErrors(); 
        setIsOpen(true); 
    };
    
    const openEditModal = (p: Permission) => { 
        setIsEditing(true); 
        setCurrentId(p.id); 
        setData({ name: p.name, type: p.type, price: p.price.toString() }); 
        clearErrors(); 
        setIsOpen(true); 
    };
    
    const handleDelete = (id: number) => { 
        if (confirm('Are you sure you want to delete this permission?')) {
            router.delete(`/access-control/permissions/${id}`); 
        }
    };
    
    const handleSubmit: FormEventHandler = (e) => { 
        e.preventDefault(); 
        const action = isEditing && currentId ? put : post; 
        const url = isEditing && currentId ? `/access-control/permissions/${currentId}` : '/access-control/permissions'; 
        action(url, { onSuccess: () => { setIsOpen(false); reset(); } }); 
    };
    
    const handleSearch = () => { 
        router.get('/access-control/permissions', { search: searchQuery, type: typeFilter }, { preserveState: true, replace: true }); 
    };

    const handleTypeChange = (value: string) => { 
        setTypeFilter(value); 
        router.get('/access-control/permissions', { search: searchQuery, type: value }, { preserveState: true, replace: true }); 
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>

            <Select value={typeFilter} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[200px] h-9 bg-background">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="All Types" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="unique">Unique</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
    
    const HeaderActions = (
        <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Permission
        </Button>
    );

    return (
        <>
            <ResourceListLayout
                title="Manage Permissions"
                description="Control access levels and feature availability."
                breadcrumbs={breadcrumbs}
                filterWidget={FilterWidget}
                headerActions={HeaderActions}
                pagination={permissions}
                isEmpty={permissions.data.length === 0}
                config={{
                    showFilter: true,
                    showPagination: true,
                    showPaginationInfo: true,
                    showHeaderActions: true,
                    showShadow: true,
                    showBorder: true,
                    emptyStateIcon: <ShieldCheck className="h-6 w-6 text-muted-foreground/60" />,
                    emptyStateTitle: 'No permissions found',
                    emptyStateDescription: 'Create your first permission or adjust your search filters.',
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Permission</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Guard</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {permissions.data.map((permission, i) => (
                            <TableRow
                                key={permission.id}
                                className="group hover:bg-muted/30 transition-colors"
                            >
                                <TableCell className="text-center text-muted-foreground tabular-nums">
                                    {permissions.from + i}
                                </TableCell>

                                <TableCell>
                                    <span className="font-medium text-foreground">
                                        {permission.name}
                                    </span>
                                </TableCell>

                                <TableCell className="px-4 py-3">
                                    {permission.type === 'unique' ? (
                                        <span className="inline-flex items-center gap-1 rounded border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-purple-500">
                                            <Star className="h-3 w-3 opacity-70" />
                                            Unique
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                            <Zap className="h-3 w-3 opacity-70" />
                                            General
                                        </span>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-mono text-sm font-medium text-foreground">
                                            Rp {new Intl.NumberFormat('id-ID', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            }).format(permission.price)}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">per month</span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border">
                                        {permission.guard_name}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(permission.created_at).toLocaleDateString()}
                                    </span>
                                </TableCell>

                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => openEditModal(permission)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={() => handleDelete(permission.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
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
                            <p className="text-[11px] text-muted-foreground">Recommend using kebab-case.</p>
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General (Basic)</SelectItem>
                                    <SelectItem value="unique">Unique (Exclusive)</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.type as string} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Monthly Price (IDR)</Label>
                            <Input 
                                type="number" 
                                value={data.price} 
                                onChange={(e) => setData('price', e.target.value)} 
                                placeholder="e.g. 50000"
                                min="0"
                                step="1000"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                General: Rp 50k - 500k | Unique: Rp 500k+
                            </p>
                            <InputError message={errors.price as string} />
                        </div>
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