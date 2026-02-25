import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Search, Plus, Activity, LayoutGrid, Building2, CalendarDays, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import dayjs from 'dayjs';

export default function GlobalTaskIndex({ tasks, projects, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // 1. UPDATE LOGIC SEARCH UNTUK GLOBAL
    useEffect(() => {
        const delay = setTimeout(() => {
            if (search !== (filters.search || '')) {
                // Di halaman Global, URL-nya adalah /tasks
                router.get('/tasks', { search }, {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true
                });
            }
        }, 400);
        return () => clearTimeout(delay);
    }, [search]);

    // 2. UPDATE FORM STATE
    const { data, setData, post, processing, reset } = useForm({
        title: '',
        project_id: '',
        priority: 'medium',
        status: 'todo'
    });

    // 3. UPDATE SUBMIT ACTION UNTUK GLOBAL
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.project_id) return;

        post('/tasks/quick-store', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            },
            onError: () => {
                console.error("OPERATIONAL FAILURE: Database rejected the deployment.");
            }
        });
    };

    // Helpers for Styling
    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'in_progress': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case 'completed':
            case 'done': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case 'overdue': return "bg-sada-red/10 text-sada-red border-sada-red/20";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    const getPriorityInfo = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return { label: 'HIGH', class: 'bg-red-50 border-red-100 text-red-600' };
            case 'medium': return { label: 'MEDIUM', class: 'bg-amber-50 border-amber-100 text-amber-600' };
            default: return { label: 'LOW', class: 'bg-zinc-50 border-zinc-100 text-zinc-400' };
        }
    };

    return (
        <AppLayout>
            <Head title="GLOBAL TASK ANALYTICS" />

            <div className="p-10 space-y-8 w-full mx-auto">
                {/* Header Tactical */}
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sada-red font-black tracking-[0.3em] text-xs">
                            <Activity size={14} />
                            <span>OPERATIONAL DATA STREAM</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">Global Tasks</h1>
                    </div>

                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-zinc-900 dark:bg-white hover:bg-sada-red dark:hover:bg-sada-red text-white dark:text-zinc-900 h-16 px-10 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-zinc-200 dark:shadow-none"
                    >
                        <Plus className="mr-2" size={20} /> Deploy Quick Task
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-sada-red transition-colors" size={22} />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="SEARCH ALL PROJECT TASKS OBJECTIVES..."
                        className="pl-14 h-16 bg-white dark:bg-zinc-900 border-none rounded-2xl font-bold uppercase text-xs tracking-widest shadow-sm focus:ring-2 focus:ring-sada-red/20 transition-all dark:text-white"
                    />
                </div>

                {/* Tactical Table */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-none w-full">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 w-[30%]">TASK NAME</th>
                                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 w-[20%] hidden md:table-cell">SECTOR & UNIT</th>
                                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 w-[15%]">OPERATIVE</th>
                                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 text-center w-[15%]">PRIORITY</th>
                                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 w-[15%] hidden xl:table-cell">DEADLINE</th>
                                <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 w-[5%]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {tasks?.data?.length > 0 ? (
                                tasks.data.map((task: any) => {

                                    const priorityInfo = getPriorityInfo(task.priority);

                                    // Ambil data user yang diassign
                                    const assignee = task.assignee ? task.assignee : null;
                                    const assigneeName = assignee ? assignee.name : 'Unassigned';
                                    const assigneeAvatar = assignee?.profile_photo_url || `https://ui-avatars.com/api/?name=${assigneeName}&background=1a1a1a&color=ef4444&bold=true`;

                                    return (
                                        <tr key={task.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all group">

                                            {/* KOLOM 1: TASK NAME (Bisa di-klik) */}
                                            <td className="p-6 align-middle">
                                                {/* --- LINK SUDAH DIGANTI SESUAI REQUEST --- */}
                                                <Link
                                                    href={`/workspaces/${task.project?.workspace?.slug}/projects/${task.project?.slug}/tasks/${task.slug}`}
                                                    className="flex items-center gap-4 cursor-pointer group/link no-underline"
                                                >
                                                    <div className="size-12 rounded-2xl bg-gradient-to-br from-sada-red to-red-900 flex items-center justify-center shadow-lg shadow-sada-red/20 group-hover/link:scale-105 transition-all duration-300 shrink-0 border border-white/5 ring-1 ring-white/10">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                                                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                                        </svg>
                                                    </div>

                                                    <div className="flex flex-col gap-1.5 min-w-0">
                                                        <span className="font-black text-foreground text-[13px] group-hover/link:text-sada-red transition-colors uppercase tracking-tight leading-none truncate">
                                                            {task.title}
                                                        </span>

                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border tracking-[0.15em] uppercase ${getStatusStyle(task.status)}`}>
                                                                {task.status?.replace('_', ' ')}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-muted-foreground/40 tracking-tighter uppercase">
                                                                ID-{task.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </td>

                                            {/* KOLOM 2: SECTOR & UNIT */}
                                            <td className="p-6 align-middle hidden md:table-cell">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <LayoutGrid size={11} className="text-sada-red/70" />
                                                        <span className="text-[10px] font-black text-foreground uppercase tracking-tight truncate max-w-[160px] ">
                                                            {task.project?.name || 'Unassigned'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-0.5">
                                                        <Building2 size={10} className="text-muted-foreground/40" />
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] truncate max-w-[160px]">
                                                            {task.project?.workspace?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* KOLOM 3: OPERATIVE (Assignee) */}
                                            <td className="p-6 align-middle">
                                                <div className="flex items-center gap-3 group/member cursor-pointer w-fit">
                                                    <div className="size-9 rounded-full border-2 border-background bg-muted overflow-hidden shadow-lg group-hover/member:border-sada-red/50 transition-all shrink-0">
                                                        <img src={assigneeAvatar} className="size-full object-cover" alt="avatar" />
                                                    </div>
                                                    <div className="flex flex-col truncate">
                                                        <span className="text-[11px] font-black text-foreground leading-tight uppercase group-hover/member:text-sada-red transition-colors truncate">{assigneeName}</span>
                                                        <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Operative</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* KOLOM 4: PRIORITY */}
                                            <td className="p-6 align-middle text-center">
                                                <div className="flex justify-center">
                                                    <span className={`px-3 py-1 rounded border font-black text-[9px] uppercase tracking-[0.2em] ${priorityInfo.class}`}>
                                                        {priorityInfo.label}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* KOLOM 5: DEADLINE */}
                                            <td className="p-6 align-middle hidden xl:table-cell">
                                                {task.due_date ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <CalendarDays size={10} className="text-sada-red/50" />
                                                            <span className="text-[10px] font-black text-foreground uppercase tracking-wider">
                                                                {dayjs(task.due_date).format('DD MMM YYYY')}
                                                            </span>
                                                        </div>
                                                        <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest ml-4">Expiration</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase ml-4">No Date</span>
                                                )}
                                            </td>

                                            {/* KOLOM 6: MORE ACTION */}
                                            <td className="p-6 align-middle text-right">
                                                <div className="flex justify-end transform hover:scale-110">
                                                    <MoreVertical className="size-4 text-muted-foreground cursor-pointer hover:text-sada-red transition-all" />
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.4em] text-sm">
                                        No Operational Data Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Quick Deploy Task */}
            <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                setIsAddModalOpen(open);
                if (!open) reset();
            }}>
                <DialogContent className="sm:max-w-[550px] bg-white rounded-[40px] p-10 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic text-zinc-900">
                            Quick Deployment
                        </DialogTitle>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Assign new objective to active projects</p>
                    </DialogHeader>

                    <form onSubmit={handleAddTask} className="space-y-8 mt-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Target Project</label>
                            <select
                                required
                                value={data.project_id}
                                onChange={e => setData('project_id', e.target.value)}
                                className="w-full h-16 bg-zinc-100 border-none rounded-2xl px-5 font-bold text-sm uppercase outline-none focus:ring-2 focus:ring-sada-red/20 transition-all appearance-none"
                            >
                                <option value="">Select Operational Project</option>
                                {projects?.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Objective Title</label>
                            <Input
                                required
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                placeholder="E.G. CORE SYSTEM REFACTOR..."
                                className="h-16 bg-zinc-100 border-none rounded-2xl px-5 font-bold text-sm uppercase focus:ring-2 focus:ring-sada-red/20 transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Priority Level</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['low', 'medium', 'high'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setData('priority', p)}
                                        className={`h-14 rounded-2xl text-[11px] font-black uppercase transition-all border-2 ${data.priority === p
                                            ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl scale-[1.02]'
                                            : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="submit"
                                disabled={processing || !data.project_id || !data.title}
                                className="w-full h-16 bg-sada-red hover:bg-red-700 text-white rounded-[20px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 disabled:opacity-30 transition-all active:scale-[0.98]"
                            >
                                {processing ? 'INITIATING...' : 'Confirm Deployment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}