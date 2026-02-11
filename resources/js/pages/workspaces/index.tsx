import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem } from '@/types';
import { Plus, Trash2, Search, LayoutGrid, ExternalLink, Settings2 } from 'lucide-react';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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
        setIsEditing(false);
        setCurrentSlug(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const openEditModal = (w: Workspace) => {
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
                headerActions={<Button onClick={openCreateModal} size="sm"><Plus className="h-4 w-4 mr-2" />Add Workspace</Button>}
                pagination={workspaces}
                isEmpty={workspaces.data.length === 0}
                config={{ showFilter: true, showPagination: true, showHeaderActions: true, emptyStateIcon: <LayoutGrid className="h-6 w-6 text-muted-foreground/60" /> }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            {isSuperAdmin && <TableHead>Company</TableHead>}
                            <TableHead>Workspace Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workspaces.data.map((workspace, i) => (
                            <TableRow key={workspace.id} className="group hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground tabular-nums">{workspaces.from + i}</TableCell>

                                {isSuperAdmin && (
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium">
                                            {workspace.company?.name}
                                        </div>
                                    </TableCell>
                                )}

                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">{workspace.name}</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">{workspace.description || 'No description'}</span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge variant={workspace.status === 'active' ? 'outline' : 'destructive'} className="capitalize text-[10px] h-5">
                                        {workspace.status}
                                    </Badge>
                                </TableCell>

                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" asChild>
                                                        <Link href={`/workspaces/${workspace.slug}`}>
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Manage Workspace</TooltipContent>
                                            </Tooltip>

                                            {
                                                <>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => openEditModal(workspace)}
                                                            >
                                                                <Settings2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit Workspace</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 hover:text-red-600"
                                                                onClick={() => handleDelete(workspace.slug)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-red-600 text-white border-red-600">
                                                            Delete Workspace
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </>
                                            }
                                        </TooltipProvider>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResourceListLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Workspace' : 'Create New Workspace'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Perbarui informasi workspace dan pengaturan akses.' : 'Tambahkan workspace baru untuk departemen atau tim.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                        <div className="space-y-4">
                            {isSuperAdmin && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Assign to Company</Label>
                                    <Select value={data.company_id} onValueChange={(val) => setData('company_id', val)}>
                                        <SelectTrigger className="h-10">
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
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Workspace Name</Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Marketing Team" className="h-10" />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description</Label>
                                <Textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="What is this workspace for?" className="min-h-[100px] resize-none" />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</Label>
                                <Select value={data.status} onValueChange={(val: any) => setData('status', val)}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing} className="px-8">
                                {isEditing ? 'Save Changes' : 'Create Workspace'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
