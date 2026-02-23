import {
    Target,
    Calendar,
    Edit2,
    Activity,
    CircleCheck,
    Clock
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from '@inertiajs/react';

export default function TaskGridCard({ task, workspace, project }: any) {
    // Indikator Warna Berdasarkan Status yang support Light & Dark mode
    const categoryConfigs: any = {
        done: {
            strip: 'bg-emerald-500',
            icon: 'text-emerald-500',
            iconBox: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            progress: 'from-emerald-500 to-teal-400',
            border: 'hover:border-emerald-500/40'
        },
        in_progress: {
            strip: 'bg-blue-500',
            icon: 'text-blue-500',
            iconBox: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            progress: 'from-blue-500 to-indigo-400',
            border: 'hover:border-blue-500/40'
        },
        todo: {
            strip: 'bg-zinc-400',
            icon: 'text-zinc-500 dark:text-zinc-400',
            iconBox: 'bg-muted text-muted-foreground border-border',
            progress: 'from-zinc-400 to-zinc-300 dark:from-zinc-600 dark:to-zinc-500',
            border: 'hover:border-zinc-500/30'
        }
    };

    const config = categoryConfigs[task.status] || categoryConfigs.todo;

    const priorityStyles: any = {
        high: 'text-red-600 dark:text-red-400 border-red-500/20 bg-red-500/10',
        medium: 'text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/10',
        low: 'text-zinc-600 dark:text-zinc-400 border-zinc-500/20 bg-zinc-500/10'
    };

    const operatives = useMemo(() => {
        const completers = task.subtasks?.map((s: any) => s.completer).filter(Boolean) || [];
        return Array.from(new Map(completers.map((u: any) => [u.id, u])).values()).slice(0, 3);
    }, [task.subtasks]);

    const wsSlug = workspace?.slug;
    const pjSlug = project?.slug;

    return (
        <div className={`group/card bg-card p-6 rounded-[32px] border border-border ${config.border} transition-all duration-300 relative shadow-sm hover:shadow-xl hover:-translate-y-1.5 flex flex-col h-full overflow-hidden text-left`}>

            <div className={`absolute top-0 left-0 w-1.5 h-full opacity-80 ${config.strip}`} />

            <Link
                href={`/workspaces/${wsSlug}/projects/${pjSlug}/tasks/${task.slug}`}
                className="flex items-start gap-4 mb-6 group/link no-underline"
            >
                <div className={`size-11 shrink-0 rounded-xl flex items-center justify-center shadow-sm group-hover/card:scale-110 transition-all duration-300 border ${config.iconBox}`}>
                    <CircleCheck size={20} strokeWidth={2.5} />
                </div>

                <div className="flex flex-col justify-center min-w-0 leading-tight pt-0.5">
                    <span className="font-black text-foreground truncate text-[14px] group-hover/link:text-sada-red transition-colors leading-none mb-1.5 uppercase">
                        {task.title}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-bold line-clamp-2 tracking-wider opacity-80 border-l-2 border-border pl-2 uppercase italic leading-relaxed">
                        {task.description || 'No description provided.'}
                    </p>
                </div>
            </Link>

            {/* Progress / Integrity */}
            <div className="space-y-2 mb-6 px-1">
                <div className="flex justify-between items-end">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        <Activity size={10} className={config.icon} /> Integrity
                    </span>
                    <span className={`text-[9px] font-black italic ${config.icon}`}>{task.progress || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
                    <div
                        className={`h-full bg-gradient-to-r ${config.progress} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${task.progress || 0}%` }}
                    />
                </div>
            </div>

            {/* Objectives & Users */}
            <div className="flex items-center justify-between pt-4 border-t border-dashed border-border mb-5">
                <div className="flex items-center gap-2">
                    <Target size={12} className={config.icon} />
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">
                        {task.subtasks?.length || 0} Objectives
                    </span>
                </div>
                <div className="flex -space-x-2">
                    {operatives.map((user: any) => (
                        <img key={user.id} src={user.profile_photo_url} className="size-6 rounded-full border-2 border-card object-cover bg-muted" alt={user.name} />
                    ))}
                    {operatives.length === 0 && (
                        <div className="size-6 rounded-full border-2 border-dashed border-border bg-muted/30" />
                    )}
                </div>
            </div>

            {/* --- UPDATE: FOOTER DENGAN DEADLINE YANG JELAS --- */}
            <div className="flex items-center gap-2 mt-auto">
                {/* Priority */}
                <div className={`inline-flex items-center justify-center px-3 h-9 rounded-xl border ${priorityStyles[task.priority] || priorityStyles.low} gap-1.5 flex-1`}>
                    <div className="size-1.5 rounded-full bg-current animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest truncate">{task.priority || 'NORMAL'}</span>
                </div>

                {/* Deadline Box */}
                <div className="flex flex-col justify-center bg-muted/40 h-9 px-3 rounded-xl border border-border flex-[1.5]">
                    <span className="text-[6px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-0.5">
                        Deadline
                    </span>
                    <div className="flex items-center gap-1.5">
                        <Clock size={10} className={task.due_date ? config.icon : 'text-muted-foreground opacity-50'} />
                        <span className={`text-[10px] font-mono font-bold truncate leading-none ${task.due_date ? 'text-foreground' : 'text-muted-foreground italic opacity-60'}`}>
                            {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB').replace(/\//g, '-') : 'NOT SET'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}