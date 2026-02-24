import { Target, Activity, CircleCheck, Clock } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from '@inertiajs/react';

export default function TaskGridCard({ task, workspace, project }: any) {
    
    // LOGIC HYBRID: Cek suntikan server dulu, kalau gagal hitung manual, kalau gagal lagi cek status done
    const progressPercent = useMemo(() => {
        // 1. Prioritas: Pakai data suntikan manual_progress dari PHP
        if (task.manual_progress !== null && task.manual_progress !== undefined) {
            return Number(task.manual_progress);
        }

        // 2. Secondary: Hitung manual dari subtasks jika ada
        const subs = task.subtasks || [];
        if (subs.length > 0) {
            const done = subs.filter((s: any) => s.is_completed == 1 || s.is_completed == true).length;
            return Math.round((done / subs.length) * 100);
        }

        // 3. Fallback: Jika status 'done', paksa 100%
        return task.status === 'done' ? 100 : 0;
    }, [task.manual_progress, task.subtasks, task.status]);

    const totalObjectives = task.total_objectives ?? task.subtasks?.length ?? 0;

    const categoryConfigs: any = {
        done: { strip: 'bg-emerald-500', iconBox: 'bg-emerald-500/10 text-emerald-500', progress: 'from-emerald-500 to-teal-400', border: 'hover:border-emerald-500/40' },
        in_progress: { strip: 'bg-blue-500', iconBox: 'bg-blue-500/10 text-blue-500', progress: 'from-blue-500 to-indigo-400', border: 'hover:border-blue-500/40' },
        todo: { strip: 'bg-zinc-400', iconBox: 'bg-muted text-muted-foreground', progress: 'from-zinc-400 to-zinc-300', border: 'hover:border-zinc-500/30' }
    };

    const config = categoryConfigs[task.status] || categoryConfigs.todo;
    const priorityStyles: any = {
        high: 'text-red-600 border-red-500/20 bg-red-500/10',
        medium: 'text-amber-600 border-amber-500/20 bg-amber-500/10',
        low: 'text-zinc-600 border-zinc-500/20 bg-zinc-500/10'
    };

    const operatives = useMemo(() => {
        const completers = task.subtasks?.map((s: any) => s.completer).filter(Boolean) || [];
        return Array.from(new Map(completers.map((u: any) => [u.id, u])).values()).slice(0, 3);
    }, [task.subtasks]);

    return (
        <div className={`group/card bg-card p-6 rounded-[32px] border border-border ${config.border} transition-all duration-300 relative shadow-sm hover:shadow-xl hover:-translate-y-1.5 flex flex-col h-full overflow-hidden text-left`}>
            
            <div className={`absolute top-0 left-0 w-1.5 h-full opacity-80 ${config.strip}`} />

            {/* DEBUGGER KECIL (Hapus kalau sudah fix) */}
            <div className="absolute top-2 right-6 text-[7px] text-muted-foreground opacity-50 font-mono">
                S:{task.subtasks?.length || 0} | P:{task.manual_progress ?? 'null'}
            </div>

            <Link
                href={`/workspaces/${workspace?.slug}/projects/${project?.slug}/tasks/${task.slug}`}
                className="flex items-start gap-4 mb-6 group/link no-underline"
            >
                <div className={`size-11 shrink-0 rounded-xl flex items-center justify-center border transition-all duration-300 ${config.iconBox}`}>
                    <CircleCheck size={20} strokeWidth={2.5} />
                </div>

                <div className="flex flex-col justify-center min-w-0 leading-tight pt-0.5">
                    <span className="font-black text-foreground truncate text-[14px] uppercase mb-1.5">
                        {task.title}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-bold line-clamp-2 tracking-wider border-l-2 border-border pl-2 uppercase italic">
                        {task.description || 'No description provided.'}
                    </p>
                </div>
            </Link>

            {/* PROGRESS BAR */}
            <div className="space-y-2 mb-6 px-1">
                <div className="flex justify-between items-end">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        <Activity size={10} /> Integrity
                    </span>
                    <span className={`text-[9px] font-black italic`}>{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
                    <div
                        className={`h-full bg-gradient-to-r ${config.progress} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* OBJECTIVES */}
            <div className="flex items-center justify-between pt-4 border-t border-dashed border-border mb-5">
                <div className="flex items-center gap-2">
                    <Target size={12} />
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">
                        {totalObjectives} Objectives
                    </span>
                </div>
                <div className="flex -space-x-2">
                    {operatives.map((user: any) => (
                        <img key={user.id} src={user.profile_photo_url} className="size-6 rounded-full border-2 border-card object-cover" title={user?.name} />
                    ))}
                </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center gap-2 mt-auto">
                <div className={`inline-flex items-center justify-center px-3 h-9 rounded-xl border ${priorityStyles[task.priority] || priorityStyles.low} gap-1.5 flex-1`}>
                    <div className="size-1.5 rounded-full bg-current animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest truncate">{task.priority || 'NORMAL'}</span>
                </div>
                <div className="flex flex-col justify-center bg-muted/40 h-9 px-3 rounded-xl border border-border flex-[1.5]">
                    <span className="text-[6px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-0.5">Deadline</span>
                    <span className="text-[10px] font-mono font-bold truncate">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB').replace(/\//g, '-') : 'NOT SET'}
                    </span>
                </div>
            </div>
        </div>
    );
}