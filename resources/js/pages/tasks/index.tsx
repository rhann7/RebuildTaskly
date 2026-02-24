import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeaderBase from '@/components/HeaderBase';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Briefcase, Activity, Search, FolderKanban, Building2, Eye } from 'lucide-react';

export default function GlobalTaskIndex({ tasks, filters }: any) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearch = () => {
        router.get('/tasks', { search: searchQuery }, { preserveState: true });
    };
    interface Task {
        id: number;
        slug: string;
        title: string;
        description: string | null;
        status: 'todo' | 'in_progress' | 'done';
        created_at: string;
        // Tambahkan ini
        project?: {
            name: string;
            slug: string;
            workspace?: {
                name: string;
                slug: string;
            }
        }
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Global Tasks', href: '/tasks' }]}>
            <Head title="Global Tasks Intelligence" />

            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8 p-6 md:p-10 animate-in fade-in duration-700">

                <HeaderBase
                    title="Global"
                    subtitle="Task Intel"
                    stats={[
                        { label: "Total Tasks", value: tasks.total, icon: Briefcase },
                        { label: "Current View", value: tasks.data.length, icon: Activity, color: "text-sada-red" }
                    ]}
                    addButton={{ show: false, label: "Add Task", onClick: () => {} }}
                />
                {/* Filter Bar */}
                <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search task title..."
                            className="pl-10 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                </div>

                <div className="bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-border">
                                <TableHead className="w-[250px] font-black uppercase tracking-widest text-[10px]">Task Objective</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Origin Project</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Workspace</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                                <TableHead className="text-right font-black uppercase tracking-widest text-[10px] px-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.data.map((task: Task) => (
                                <TableRow key={task.id} className="group hover:bg-muted/30 transition-colors border-b border-border/50">
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-sm uppercase tracking-tight group-hover:text-sada-red transition-colors">
                                                {task.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">
                                                {task.description || 'No extra parameters'}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FolderKanban size={12} className="text-muted-foreground" />
                                            <span className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                                                {task.project?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Building2 size={12} className="text-sada-red/60" />
                                            <span className="text-[11px] font-black uppercase tracking-tighter italic">
                                                {task.project?.workspace?.name || 'N/A'}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant={task.status === 'done' ? 'outline' : 'secondary'} className="text-[9px] font-black uppercase px-2 py-0">
                                            {task.status}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right px-6">
                                        <Link
                                            href={`/workspaces/${task.project?.workspace?.slug}/projects/${task.project?.slug}/tasks/${task.slug}`}
                                            className="inline-flex items-center justify-center size-8 rounded-lg bg-zinc-900 text-white hover:bg-sada-red transition-all shadow-lg shadow-black/10"
                                        >
                                            <Eye size={14} />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between items-center px-4 font-black uppercase italic text-[9px] text-muted-foreground tracking-[0.2em]">
                    <span>Range: {tasks.from || 0} — {tasks.to || 0}</span>
                    <span>Total Tasks Logged: {tasks.total || 0}</span>
                </div>
            </div>
        </AppLayout>
    );
}