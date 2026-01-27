// resources/js/pages/workspaces/show.tsx
import { useState, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import WorkspaceLayout from '@/layouts/workspaces/WorkspaceLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { ExternalLink, Plus } from 'lucide-react';

interface Project {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    status: 'active' | 'inactive';
}

interface Props {
    workspace: any;
    projects: Project[];
}

export default function WorkspaceShow({ workspace, projects }: Props) {
    const [activeTab, setActiveTab] = useState<'projects' | 'members' | 'settings'>('projects');
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        status: 'active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(`/workspaces/${workspace.slug}/projects`, {
            onSuccess: () => {
                reset();
                setIsOpen(false);
            },
        });
    };

    return (
        <WorkspaceLayout
            workspace={workspace}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        >
            <Head title={`${workspace.name} - Detail`} />

            {/* ================= PROJECT TAB ================= */}
            {activeTab === 'projects' && (
                <div className="animate-in fade-in duration-500 space-y-4">

                    {/* HEADER */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Projects</h2>

                        <Button onClick={() => setIsOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Project
                        </Button>
                    </div>

                    {/* EMPTY STATE */}
                    {projects.length === 0 ? (
                        <div className="py-10 text-center border rounded-xl border-dashed">
                            <p className="text-muted-foreground">
                                Belum ada project di workspace ini.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">#</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {projects.map((project, i) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="text-center text-muted-foreground">
                                            {i + 1}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">
                                                    {project.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground line-clamp-1">
                                                    {project.description || 'No description'}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant={
                                                    project.status === 'active'
                                                        ? 'outline'
                                                        : 'destructive'
                                                }
                                                className="capitalize text-[10px] h-5"
                                            >
                                                {project.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link
                                                    href={`/workspaces/${workspace.slug}/projects/${project.slug}`}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            )}

            {/* ================= MEMBERS TAB ================= */}
            {activeTab === 'members' && (
                <div className="animate-in fade-in duration-500 py-10 text-center border rounded-xl border-dashed">
                    <p className="text-muted-foreground">
                        Members management coming soon.
                    </p>
                </div>
            )}

            {/* ================= SETTINGS TAB ================= */}
            {activeTab === 'settings' && (
                <div className="animate-in fade-in duration-500">
                    <h2 className="text-xl font-bold mb-4">Settings</h2>
                </div>
            )}

            {/* ================= CREATE PROJECT MODAL ================= */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create Project</DialogTitle>
                        <DialogDescription>
                            Tambahkan project baru ke workspace ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="space-y-4 pt-2">
                        <div>
                            <Label>Project Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Create Project
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </WorkspaceLayout>
    );
}
