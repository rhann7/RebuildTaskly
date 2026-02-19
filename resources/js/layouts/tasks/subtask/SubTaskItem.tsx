import { router, Link } from '@inertiajs/react';
import { CheckCircle2, User, Activity, ArrowRight, Loader2, Trash2, Clock, Calendar } from 'lucide-react';
import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"; // Sesuaikan path-nya

export const SubTaskItem = ({ sub, workspace, project, task }: any) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = () => {
        if (isUpdating) return;
        setIsUpdating(true);
        const url = `/workspaces/${workspace.slug}/projects/${project.slug}/tasks/${task.slug}/subtasks/${sub.id}/toggle`;

        router.patch(url, {}, {
            preserveScroll: true,
            onFinish: () => setIsUpdating(false),
        });
    };

    return (
        <div className="group relative bg-white dark:bg-zinc-900/40 border border-border rounded-[24px] p-5 flex items-center justify-between hover:border-sada-red/40 hover:shadow-2xl hover:shadow-sada-red/5 transition-all duration-300 overflow-hidden">
            
            <div className={`absolute left-0 top-0 h-full w-1.5 transition-all duration-500 ${sub.is_completed ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-sada-red/20'}`} />

            <div className="flex items-center gap-6 pl-2">
                <button
                    onClick={handleToggle}
                    disabled={isUpdating}
                    className={`relative size-10 rounded-xl border-2 flex items-center justify-center transition-all duration-500 active:scale-90
                        ${sub.is_completed 
                            ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/40' 
                            : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 hover:border-sada-red/50'}
                        ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {isUpdating ? (
                        <Loader2 size={18} className="text-zinc-400 animate-spin" />
                    ) : sub.is_completed ? (
                        <CheckCircle2 size={20} className="text-white animate-in zoom-in duration-300" />
                    ) : (
                        <div className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-sada-red group-hover:scale-125 transition-all" />
                    )}
                </button>

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className={`text-[15px] font-black uppercase tracking-tight transition-all duration-500 
                            ${sub.is_completed ? 'text-zinc-400 line-through italic opacity-50' : 'text-zinc-900 dark:text-white'}`}>
                            {sub.title}
                        </span>
                        {!sub.is_completed && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sada-red/5 border border-sada-red/10 animate-pulse">
                                <span className="size-1 rounded-full bg-sada-red" />
                                <span className="text-[8px] font-black text-sada-red uppercase tracking-widest">Active</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5">
                            <User size={10} className="text-sada-red" />
                            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                                {sub.completer ? `Fixed by: ${sub.completer.name}` : `Owner: ${workspace.manager?.name || 'Manager'}`}
                            </span>
                        </div>
                        <div className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-800" />
                        <div className="flex items-center gap-1.5">
                            <Activity size={10} className="text-zinc-400" />
                            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase italic">
                                UID: {sub.id.toString().padStart(3, '0')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link
                    href={`/workspaces/${workspace.slug}/projects/${project.slug}/tasks/${task.slug}/subtasks/${sub.id}`}
                    method="delete"
                    as="button"
                    preserveScroll
                    onBefore={() => confirm('Terminate this objective permanently?')}
                    className="size-11 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-400 hover:bg-sada-red hover:text-white hover:border-sada-red transition-all duration-300"
                >
                    <Trash2 size={16} />
                </Link>

                {/* LOG DETAIL: Sekarang pake Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="flex items-center gap-2 h-11 px-5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-sm group/btn">
                            Log Detail <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px] border-l-border bg-white dark:bg-zinc-950 p-10">
                        <SheetHeader className="mb-10">
                            <SheetTitle className="text-2xl font-black uppercase tracking-tighter italic">Objective Audit Log</SheetTitle>
                            <div className="h-1 w-20 bg-sada-red" />
                        </SheetHeader>

                        <div className="flex flex-col gap-8">
                            {/* Created Log */}
                            <div className="flex gap-6 relative">
                                <div className="absolute left-[15px] top-10 bottom-[-30px] w-[2px] bg-zinc-100 dark:bg-zinc-800" />
                                <div className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-border z-10">
                                    <Calendar size={14} className="text-zinc-500" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-sada-red uppercase tracking-widest mb-1">Initiated</h4>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{sub.title}</p>
                                    <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
                                        <Clock size={10} /> {new Date(sub.created_at).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>

                            {/* Completed Log */}
                            <div className="flex gap-6">
                                <div className={`size-8 rounded-full flex items-center justify-center border z-10 transition-colors ${sub.is_completed ? 'bg-emerald-500/10 border-emerald-500' : 'bg-zinc-50 dark:bg-zinc-900 border-border'}`}>
                                    <CheckCircle2 size={14} className={sub.is_completed ? 'text-emerald-500' : 'text-zinc-300'} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status: {sub.is_completed ? 'Completed' : 'Awaiting Action'}</h4>
                                    {sub.is_completed ? (
                                        <>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Validated by {sub.completer?.name || 'Authorized Personnel'}</p>
                                            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
                                                <Clock size={10} /> {new Date(sub.updated_at).toLocaleString('id-ID')}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm font-medium text-zinc-400 italic">No completion data found in system.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
};