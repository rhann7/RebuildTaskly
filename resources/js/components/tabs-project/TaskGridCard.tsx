import { Target, Calendar, MoreVertical, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

export default function TaskGridCard({ task }: any) {
    // Sync warna dengan TaskColumns lo
    const priorityStyles: any = {
        high: 'text-red-500 border-red-500/20 bg-red-500/5',
        medium: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
        low: 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5'
    };

    const statusColors: any = {
        done: 'text-emerald-500',
        in_progress: 'text-blue-500',
        pending: 'text-zinc-400'
    };

    return (
        <div className="bg-card p-6 rounded-[32px] border border-border hover:border-sada-red/30 transition-all group relative shadow-sm overflow-hidden">
            {/* Dekorasi Gradient Tipis atas */}
            <div className={`absolute top-0 left-0 w-full h-1 opacity-20 ${task.status === 'done' ? 'bg-emerald-500' : 'bg-sada-red'}`} />

            <div className="flex justify-between items-start mb-6">
                <div className="size-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg border border-white/10 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={22} strokeWidth={2.5} />
                </div>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full border ${priorityStyles[task.priority] || priorityStyles.low} gap-2`}>
                    <div className="size-1 rounded-full bg-current animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{task.priority || 'NORMAL'}</span>
                </div>
            </div>

            <div className="space-y-2 text-left mb-8">
                <h3 className="font-black text-[14px] uppercase tracking-tight text-foreground group-hover:text-sada-red transition-colors line-clamp-1">
                    {task.title}
                </h3>
                <p className="text-[10px] text-muted-foreground font-bold line-clamp-2 italic opacity-60 uppercase tracking-wider leading-relaxed">
                    {task.description || 'NO OPERATIONAL BRIEFING'}
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {/* Deadline & Status Row */}
                <div className="flex justify-between items-center bg-muted/30 p-3 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-sada-red" />
                        <span className="text-[10px] font-mono font-bold text-foreground">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB').replace(/\//g, '-') : '--/--/--'}
                        </span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${statusColors[task.status] || 'text-zinc-400'}`}>
                        {task.status?.replace('_', ' ') || 'PENDING'}
                    </span>
                </div>

                {/* Control Buttons (Grid Version) */}
                <div className="flex gap-2">
                    <button className="flex-1 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-zinc-900 hover:text-white transition-all border border-border text-[10px] font-black uppercase tracking-widest gap-2">
                        <Edit2 size={12} /> Edit
                    </button>
                    <button className="h-10 px-4 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-sada-red hover:text-white transition-all border border-border text-muted-foreground">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}