import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router, usePage } from '@inertiajs/react'; // Tambah usePage
import { PageConfig, type BreadcrumbItem } from '@/types';
import { Plus, LayoutGrid, Search } from 'lucide-react';

import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { WorkspaceTable } from '@/layouts/workspaces/parts/workspace-table';

interface Workspace {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
    company_id: number;
    company?: { id: number; name: string };
}

interface PageProps {
    workspaces: {
        data: Workspace[];
        links: any[];
        from: number;
        to: number;
        total: number;  
    };
    companies: { id: number; name: string }[];
    filters: { search?: string };
    pageConfig: PageConfig;
    isSuperAdmin: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Workspaces', href: '/workspaces' },
];

export default function WorkspaceIndex({ workspaces, companies, filters, pageConfig, isSuperAdmin }: PageProps) {
    // 1. Ambil data auth dari Inertia Global Props
    const { auth } = usePage<any>().props;

    // 2. Tentukan Logic Akses: Hanya SuperAdmin atau Owner/Company yang bisa Create/Edit/Delete
    // Sesuaikan string 'company' atau 'owner' dengan nama role di database lo
    const canManageWorkspace = isSuperAdmin || auth.user.role === 'company' || auth.user.role === 'owner';

    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        company_id: '',
        status: 'active' as 'active' | 'inactive',
    });

    const handleFilterChange = () => {
        router.get('/workspaces', { search: searchQuery }, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        if (!canManageWorkspace) return;
        setIsEditing(false);
        setCurrentSlug(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const openEditModal = (w: Workspace) => {
        if (!canManageWorkspace) return;
        setIsEditing(true);
        setCurrentSlug(w.slug);
        setData({
            name: w.name,
            description: w.description || '',
            company_id: w.company_id.toString(),
            status: w.status,
        });
        clearErrors();
        setIsOpen(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!canManageWorkspace) return;

        if (isEditing && currentSlug) {
            put(`/workspaces/${currentSlug}`, { onSuccess: () => setIsOpen(false) });
        } else {
            post('/workspaces', { onSuccess: () => setIsOpen(false) });
        }
    };

    const handleDelete = (slug: string) => {
        if (!canManageWorkspace) return;
        if (confirm('Are you sure you want to delete this workspace?')) {
            router.delete(`/workspaces/${slug}`);
        }
    };

    const FilterWidget = (
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search workspaces..."
                className="pl-9 h-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
            />
        </div>
    );

    return (
        <>
            <ResourceListLayout
                title={pageConfig.title}
                description={pageConfig.description}
                breadcrumbs={breadcrumbs}
                filterWidget={FilterWidget}
                // Tombol Add cuma muncul buat role yang diijinkan
                headerActions={
                    (pageConfig.can_manage && canManageWorkspace) && (
                        <Button onClick={openCreateModal} size="sm" className="bg-zinc-900 hover:bg-red-600 transition-all">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Workspace
                        </Button>
                    )
                }
                pagination={workspaces}
                isEmpty={workspaces.data.length === 0}
                config={{ 
                    showFilter: true, 
                    showPagination: true, 
                    showHeaderActions: canManageWorkspace, 
                    emptyStateIcon: <LayoutGrid className="h-6 w-6 text-muted-foreground/60" /> 
                }}
            >
                <WorkspaceTable
                    workspaces={workspaces}
                    isSuperAdmin={isSuperAdmin}
                    // canManage dikontrol oleh role, menentukan munculnya tombol Edit/Delete di baris tabel
                    canManage={pageConfig.can_manage && canManageWorkspace}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                />
            </ResourceListLayout>

            {/* Modal Dialog Form */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px] border-none rounded-[32px] shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">
                            {isEditing ? 'Update Sector' : 'Authorize New Workspace'}
                        </DialogTitle>
                        <DialogDescription className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">
                            {isEditing ? 'Modify workspace parameters and access protocols.' : 'Initialize a new operational sector for your team.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                        <div className="space-y-4">
                            {isSuperAdmin && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Assign to Company</Label>
                                    <Select value={data.company_id} onValueChange={(val) => setData('company_id', val)}>
                                        <SelectTrigger className="h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-red-500">
                                            <SelectValue placeholder="Select a company" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.company_id} />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest ml-1">Workspace Designation</Label>
                                <Input 
                                    id="name" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    placeholder="e.g. ALPHA COMMAND" 
                                    className="h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-red-500" 
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest ml-1">Mission Objective</Label>
                                <Textarea 
                                    id="description" 
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)} 
                                    placeholder="Define the scope of this sector..." 
                                    className="min-h-[100px] bg-muted/30 border-none rounded-2xl resize-none focus:ring-2 focus:ring-red-500" 
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Operational Status</Label>
                                <Select value={data.status} onValueChange={(val: any) => setData('status', val)}>
                                    <SelectTrigger className="h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-red-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">ACTIVE</SelectItem>
                                        <SelectItem value="inactive">INACTIVE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl text-[10px] font-black uppercase tracking-widest">Abort</Button>
                            <Button type="submit" disabled={processing} className="px-8 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all">
                                {isEditing ? 'Synchronize Data' : 'Establish Workspace'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}