import {
    Target,
    Calendar,
    Edit2,
    Activity,
    Users,
    CircleCheck
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from '@inertiajs/react';

export default function TaskGridCard({ task, workspace, project }: any) {
    // Indikator Warna Berdasarkan Status
    const categoryConfigs: any = {
        done: {
            strip: 'bg-emerald-500',
            icon: 'text-emerald-500',
            progress: 'from-emerald-500 to-teal-400',
            border: 'hover:border-emerald-500/40'
        },
        in_progress: {
            strip: 'bg-blue-500',
            icon: 'text-blue-500',
            progress: 'from-blue-500 to-indigo-400',
            border: 'hover:border-blue-500/40'
        },
        todo: {
            strip: 'bg-zinc-400',
            icon: 'text-zinc-400',
            progress: 'from-zinc-500 to-zinc-400',
            border: 'hover:border-zinc-500/30'
        }
    };

    const config = categoryConfigs[task.status] || categoryConfigs.todo;

    const priorityStyles: any = {
        high: 'text-red-500 border-red-500/20 bg-red-500/10',
        medium: 'text-amber-500 border-amber-500/20 bg-amber-500/10',
        low: 'text-zinc-500 border-zinc-500/20 bg-zinc-500/10'
    };

    const operatives = useMemo(() => {
        const completers = task.subtasks?.map((s: any) => s.completer).filter(Boolean) || [];
        return Array.from(new Map(completers.map((u: any) => [u.id, u])).values()).slice(0, 3);
    }, [task.subtasks]);

    // Gunakan workspace/project dari props, atau fallback ke task.project/task.workspace jika ada di objek task
    const wsSlug = workspace?.slug;
    const pjSlug = project?.slug;

    return (
        <div className={`group/card bg-card p-6 rounded-[32px] border border-border ${config.border} transition-all duration-300 relative shadow-sm hover:shadow-xl hover:-translate-y-1.5 flex flex-col h-full overflow-hidden text-left`}>

            <div className={`absolute top-0 left-0 w-1.5 h-full opacity-60 ${config.strip}`} />

            {/* Link Panjang Sesuai Keinginanmu */}
            <Link
                href={`/workspaces/${wsSlug}/projects/${pjSlug}/tasks/${task.slug}`}
                className="flex items-start gap-4 mb-6 group/link no-underline"
            >
                <div className="size-11 shrink-0 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg group-hover/card:scale-110 transition-all duration-300 border border-white/10 relative overflow-hidden">
                    <CircleCheck size={20} strokeWidth={2.5} className={`relative z-10 ${task.status === 'done' ? 'text-emerald-500' : 'text-white'}`} />
                </div>

                <div className="flex flex-col justify-center min-w-0 leading-tight pt-0.5">
                    <span className="font-black text-foreground truncate text-[14px] group-hover/link:text-sada-red transition-colors leading-none mb-1.5 uppercase">
                        {task.title}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-bold line-clamp-2 tracking-wider opacity-60 border-l-2 border-muted pl-2 uppercase italic leading-relaxed">
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
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
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
                <div className="flex -space-x-1.5">
                    {operatives.map((user: any) => (
                        <img key={user.id} src={user.profile_photo_url} className="size-6 rounded-lg border-2 border-card object-cover" />
                    ))}
                </div>
            </div>

            {/* Footer: Priority & Deadline */}
            <div className="flex items-center gap-2 mt-auto">
                <div className={`inline-flex items-center px-3 h-8 rounded-xl border ${priorityStyles[task.priority] || priorityStyles.low} gap-1.5 flex-1`}>
                    <div className="size-1 rounded-full bg-current animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{task.priority || 'NORMAL'}</span>
                </div>

                <div className="flex items-center gap-2 bg-muted/40 h-8 px-3 rounded-xl border border-border/50">
                    <Calendar size={11} className={config.icon} />
                    <span className="text-[9px] font-mono font-bold text-foreground opacity-70">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB').replace(/\//g, '-') : 'TBD'}
                    </span>
                </div>

                <button className="size-8 shrink-0 flex items-center justify-center rounded-xl bg-zinc-900 text-white hover:bg-sada-red transition-all">
                    <Edit2 size={12} />
                </button>
            </div>
        </div>
    );
}