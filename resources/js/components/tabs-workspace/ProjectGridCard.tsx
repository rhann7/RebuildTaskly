import { FolderKanban, MoreVertical, Calendar, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ProjectGridCard({ project, workspaceSlug }: any) {
    // Logic warna untuk Priority Badge
    const priorityStyles: any = {
        high: "text-sada-red bg-sada-red/10 border-sada-red/20",
        medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    };

    // Format tanggal deadline
    const formattedDeadline = project.due_date 
        ? new Date(project.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) 
        : 'N/A';

    return (
        <div className="bg-card p-6 rounded-[32px] border border-border hover:border-sada-red/30 transition-all group relative shadow-sm flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-6">
                    <div className={`size-12 rounded-2xl bg-gradient-to-br ${project.priority === 'high' ? 'from-sada-red to-red-950' : 'from-zinc-800 to-black'} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        <FolderKanban size={22} strokeWidth={2.5} />
                    </div>
                    
                    {/* Priority Badge */}
                    <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${priorityStyles[project.priority] || 'text-muted-foreground border-border'}`}>
                        {project.priority || 'MEDIUM'}
                    </div>
                </div>

                <div className="space-y-2 text-left mb-6">
                    <Link href={`/workspaces/${workspaceSlug}/projects/${project.slug}`} className="font-black text-[15px] uppercase tracking-tight text-foreground hover:text-sada-red transition-colors inline-block leading-tight">
                        {project.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 italic opacity-80">
                        {project.description || 'No operational brief...'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Deadline Info */}
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={12} className="shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                        Limit: <span className="text-foreground">{formattedDeadline}</span>
                    </span>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`size-1.5 rounded-full animate-pulse ${project.status === 'inactive' ? 'bg-zinc-500' : 'bg-emerald-500'}`}></div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                            {project.status || 'ACTIVE'}
                        </span>
                    </div>
                    
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}