import { router, Link } from '@inertiajs/react';
import { CheckCircle2, User, Activity, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

export const SubTaskItem = ({ sub, workspace, project, task }: any) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = () => {
        // Jangan jalankan kalau lagi loading
        if (isUpdating) return;

        setIsUpdating(true);

        // Gunakan Template Literals agar path-nya jelas dan tidak error
        const url = `/workspaces/${workspace.slug}/projects/${project.slug}/tasks/${task.slug}/subtasks/${sub.id}/toggle`;

        router.patch(url, {}, {
            preserveScroll: true, // Biar gak balik ke atas pas diklik
            onFinish: () => setIsUpdating(false),
        });
    };

    return (
        <div className="group relative bg-white dark:bg-zinc-900/40 border border-border rounded-[24px] p-5 flex items-center justify-between hover:border-sada-red/40 hover:shadow-2xl hover:shadow-sada-red/5 transition-all duration-300 overflow-hidden">
            
            {/* Indikator Status Samping (Industrial Feel) */}
            <div className={`absolute left-0 top-0 h-full w-1.5 transition-all duration-500 ${sub.is_completed ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-sada-red/20'}`} />

            <div className="flex items-center gap-6 pl-2">
                {/* CHECKLIST BUTTON: Area aksi utama */}
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

                    {/* Metadata: Siapa yang ngerjain & ID */}
                    <div className="flex items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5">
                            <User size={10} className="text-sada-red" />
                            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                                {sub.completer ? `Fixed by: ${sub.completer.name}` : `Assigned to: ${sub.assigned_to || 'Unassigned'}`}
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

            {/* Tombol Detail: Pakai Link gak apa-apa di sini */}
            <Link
                href={`/workspaces/${workspace.slug}/projects/${project.slug}/tasks/${task.slug}/subtasks/${sub.id}`}
                className="flex items-center gap-2 h-11 px-5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-sm group/btn"
            >
                Log Detail <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
};