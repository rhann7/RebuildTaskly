import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Search, Plus, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function GlobalTaskIndex({ tasks, projects, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Real-time search logic dengan pencegahan request berlebih
    useEffect(() => {
        const delay = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/tasks', { search }, { 
                    preserveState: true, 
                    replace: true,
                    preserveScroll: true 
                });
            }
        }, 400);
        return () => clearTimeout(delay);
    }, [search]);

    const { data, setData, post, processing, reset } = useForm({
        title: '',
        project_id: '',
        priority: 'medium',
        status: 'todo'
    });

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
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-zinc-900">Global Tasks</h1>
                    </div>
                    
                    <Button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-zinc-900 hover:bg-sada-red text-white h-16 px-10 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-zinc-200"
                    >
                        <Plus className="mr-2" size={20} /> Deploy Quick Task
                    </Button>
                </div>

                {/* Search Bar - Dibuat Lebih Luas */}
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-sada-red transition-colors" size={22} />
                    <Input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="SEARCH ALL PROJECT TASKS OBJECTIVES..."
                        className="pl-14 h-16 bg-white border-none rounded-2xl font-bold uppercase text-xs tracking-widest shadow-sm focus:ring-2 focus:ring-sada-red/20 transition-all"
                    />
                </div>

                {/* Tactical Table - Full Width Gahar */}
                <div className="bg-white border border-zinc-200 rounded-[40px] overflow-hidden shadow-2xl shadow-zinc-200/50 w-full">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="bg-zinc-50/80 border-b border-zinc-100">
                                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 w-[25%]">Project / Sector</th>
                                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 w-[45%]">Task Objective</th>
                                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center w-[15%]">Priority</th>
                                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 w-[15%]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {tasks?.data?.length > 0 ? (
                                tasks.data.map((task: any) => (
                                    <tr key={task.id} className="hover:bg-zinc-50/50 transition-all group">
                                        <td className="p-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-black text-sada-red uppercase leading-none tracking-tighter">
                                                    {task.project?.workspace?.name || 'Sector Unknown'}
                                                </span>
                                                <span className="text-sm font-bold text-zinc-900 uppercase tracking-tight truncate">
                                                    {task.project?.name || 'Unassigned Project'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className="text-base font-black text-zinc-800 uppercase group-hover:text-sada-red transition-colors cursor-pointer block truncate">
                                                {task.title}
                                            </span>
                                        </td>
                                        <td className="p-8 text-center">
                                            <span className={`text-[10px] font-black px-5 py-1.5 rounded-full border shadow-sm ${
                                                task.priority === 'high' ? 'bg-red-50 border-red-100 text-red-600' : 
                                                task.priority === 'medium' ? 'bg-zinc-100 border-zinc-200 text-zinc-600' :
                                                'bg-zinc-50 border-zinc-100 text-zinc-400'
                                            }`}>
                                                {task.priority?.toUpperCase() || 'MEDIUM'}
                                            </span>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-2.5 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
                                                <span className="text-[11px] font-black uppercase text-zinc-600 tracking-widest">
                                                    {task.status?.replace('_', ' ') || 'TODO'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center font-black text-zinc-300 uppercase tracking-[0.4em] text-sm">
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
                                        className={`h-14 rounded-2xl text-[11px] font-black uppercase transition-all border-2 ${
                                            data.priority === p 
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