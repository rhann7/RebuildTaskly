import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem } from '@/types';
import { Plus, Trash2, Search, CheckCircle, Pencil, Eye } from 'lucide-react';

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

interface Task {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    status: 'todo' | 'in_progress' | 'done';
    created_at: string;
}


interface PageProps {
    workspace: { name: string; slug: string };
    project: { id: number; name: string; slug: string };
    tasks: {
        data: Task[];
        links: any[];
        from: number;
        to: number;
        total: number;
    };
    filters: { search?: string };
    pageConfig: PageConfig;
}

export default function TaskIndex({ workspace, project, tasks, filters, pageConfig }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Workspaces', href: '/workspaces' },
        { title: workspace.name, href: `/workspaces/${workspace.slug}` },
        { title: project.name, href: `/workspaces/${workspace.slug}/projects/${project.slug}` },
        { title: 'Tasks', href: '#' },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTaskSlug, setCurrentTaskSlug] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        description: '',
        status: 'todo' as 'todo' | 'in_progress' | 'done',
        project_id: project.id,
    });

    const handleFilterChange = () => {
        router.get(`/workspaces/${workspace.slug}/projects/${project.slug}/tasks`,
            { search: searchQuery },
            { preserveState: true, replace: true }
        );
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentTaskSlug(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const openEditModal = (task: Task) => {
        setIsEditing(true);
        setCurrentTaskSlug(task.slug);
        setData({
            title: task.title,
            description: task.description || '',
            status: task.status,
            project_id: project.id,
        });
        clearErrors();
        setIsOpen(true);
    };


    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const baseUrl = `/workspaces/${workspace.slug}/projects/${project.slug}/tasks`;
        if (isEditing && currentTaskSlug) {
            put(`${baseUrl}/${currentTaskSlug}`, {
                onSuccess: () => setIsOpen(false),
            });
        } else {
            post(baseUrl, {
                onSuccess: () => setIsOpen(false),
            });
        }
    };


    const handleDelete = (taskSlug: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(
                `/workspaces/${workspace.slug}/projects/${project.slug}/tasks/${taskSlug}`
            );
        }
    };


    const FilterWidget = (
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search tasks..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
            />
        </div>
    );

    return (
        <>
            <ResourceListLayout
                title={`Tasks`}
                // description="Manage and track progress of project activities."
                breadcrumbs={breadcrumbs}
                filterWidget={FilterWidget}
                headerActions={<Button onClick={openCreateModal} size="sm"><Plus className="h-4 w-4 mr-2" />Add Task</Button>}
                pagination={tasks}
                isEmpty={tasks.data.length === 0}
                config={{
                    showFilter: true,
                    showPagination: true,
                    showHeaderActions: true,
                    emptyStateIcon: <CheckCircle className="h-6 w-6 text-muted-foreground/60" />
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Task Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.data.map((task, i) => (
                            <TableRow key={task.id} className="group hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground tabular-nums">{tasks.from + i}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{task.title}</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">{task.description || 'No description'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={task.status === 'done' ? 'outline' : task.status === 'in_progress' ? 'secondary' : 'default'} className="capitalize">
                                        {task.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(task.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(task)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit Task</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"   onClick={() => handleDelete(task.slug)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Delete Task</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResourceListLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Task' : 'New Task'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Task Title</Label>
                            <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="What needs to be done?" />
                            <InputError message={errors.title} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Add more details..." />
                            <InputError message={errors.description} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={data.status} onValueChange={(val: any) => setData('status', val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{isEditing ? 'Save Changes' : 'Create Task'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}