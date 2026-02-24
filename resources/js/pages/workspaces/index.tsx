import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler, useEffect } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
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
    { title: 'DASHBOARD', href: '/dashboard' },
    { title: 'WORKSPACES', href: '/workspaces' },
];

export default function WorkspaceIndex({ workspaces, companies, filters, pageConfig, isSuperAdmin }: PageProps) {
    const { auth } = usePage<any>().props;

    // Logic Akses
    const canManageWorkspace = isSuperAdmin || auth.user.roles?.some((role: any) =>
        ['company', 'owner', 'super-admin'].includes(typeof role === 'string' ? role : role.name)
    );

    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // REAL-TIME SEARCH LOGIC (DEBOUNCE)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery !== (filters.search || '')) {
                router.get(
                    '/workspaces',
                    { search: searchQuery },
                    { preserveState: true, replace: true, preserveScroll: true }
                );
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        company_id: '',
        status: 'active' as 'active' | 'inactive',
    });

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
        if (isEditing && currentSlug) {
            put(`/workspaces/${currentSlug}`, { onSuccess: () => setIsOpen(false) });
        } else {
            post('/workspaces', { onSuccess: () => setIsOpen(false) });
        }
    };

    const handleDelete = (slug: string) => {
        if (confirm('Are you sure you want to delete this workspace?')) {
            router.delete(`/workspaces/${slug}`);
        }
    };

    const FilterWidget = (
        <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-sada-red transition-colors" />
            <Input
                placeholder="search"
                className="pl-10 h-11 bg-muted/20 border-border/50 rounded-xl text-[10px] font-black tracking-widest focus:ring-2 focus:ring-sada-red/20 focus:border-sada-red w-64 transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    );

    return (
        <>
            <ResourceListLayout
                title={pageConfig.title.toUpperCase()}
                description={pageConfig.description}
                breadcrumbs={breadcrumbs}
                filterWidget={FilterWidget}
                headerActions={
                    (pageConfig.can_manage && canManageWorkspace) && (
                        <Button
                            onClick={openCreateModal}
                            className="h-11 px-6 bg-foreground text-background border border-border/50 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sada-red hover:text-white transition-all shadow-lg active:scale-95"
                        >
                            <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                            Create Workspace
                        </Button>
                    )
                }
                pagination={workspaces}
                isEmpty={workspaces.data.length === 0}
                config={{
                    showFilter: true,
                    showPagination: true,
                    showHeaderActions: canManageWorkspace,
                    emptyStateIcon: <LayoutGrid className="h-12 w-12 text-muted-foreground/20" />
                }}
            >
                <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-[24px] overflow-hidden shadow-2xl transition-all">
                    <WorkspaceTable
                        workspaces={workspaces}
                        isSuperAdmin={isSuperAdmin}
                        canManage={pageConfig.can_manage && canManageWorkspace}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                    />
                </div>
            </ResourceListLayout>

            {/* Tactical Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px] bg-background border border-border/50 rounded-[32px] shadow-2xl p-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sada-red/5 blur-[80px] pointer-events-none" />
                    <DialogHeader className="p-8 pb-4 text-left">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground">
                            {isEditing ? 'Edit Authorization' : 'New Authorization'}
                        </DialogTitle>
                        <DialogDescription className="text-[9px] font-bold uppercase text-muted-foreground tracking-[0.2em]">
                            Configure workspace parameters and mission protocols.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
                        <div className="space-y-5">
                            {isSuperAdmin && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assign Authority</Label>
                                    <Select value={data.company_id} onValueChange={(val) => setData('company_id', val)}>
                                        <SelectTrigger className="h-12 bg-muted/20 border-border/50 rounded-2xl text-xs font-bold text-foreground focus:ring-2 focus:ring-sada-red/50 transition-colors">
                                            <SelectValue placeholder="SELECT COMPANY" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border/50">
                                            {companies.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()} className="text-xs uppercase font-bold text-foreground">{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.company_id} />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Workspace Name</Label>
                                <Input
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="E.G. ALPHA COMMAND"
                                    className="h-12 bg-muted/20 border-border/50 rounded-2xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-sada-red/50 text-foreground placeholder:text-muted-foreground/40 transition-colors"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Describe mission scope..."
                                    className="min-h-[100px] bg-muted/20 border-border/50 rounded-2xl text-xs text-foreground focus:ring-2 focus:ring-sada-red/50 placeholder:text-muted-foreground/40 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Operational Status</Label>
                                <Select value={data.status} onValueChange={(val: any) => setData('status', val)}>
                                    <SelectTrigger className="h-12 bg-muted/20 border-border/50 rounded-2xl text-xs font-bold text-foreground focus:ring-2 focus:ring-sada-red/50 transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border/50">
                                        <SelectItem value="active" className="text-xs font-bold text-foreground">ACTIVE</SelectItem>
                                        <SelectItem value="inactive" className="text-xs font-bold text-foreground">INACTIVE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-3 pt-4 border-t border-border/50">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">Abort</Button>
                            <Button type="submit" disabled={processing} className="h-12 px-10 bg-sada-red text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-lg shadow-sada-red/20">
                                {isEditing ? 'Push Updates' : 'Confirm Protocol'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}