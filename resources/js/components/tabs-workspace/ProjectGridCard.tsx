import { FolderKanban, MoreVertical, Calendar, Clock, User } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ProjectGridCard({ project, workspaceSlug }: any) {
    // Logic warna untuk Priority Badge agar sesuai tema Industrial Sada Red
    const priorityStyles: any = {
        high: "text-sada-red bg-sada-red/10 border-sada-red/20",
        medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    };

    // Format tanggal deadline (ID: 20 Jan)
    const formattedDeadline = project.due_date 
        ? new Date(project.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) 
        : 'N/A';

    return (
        <div className="bg-card p-6 rounded-[32px] border border-border hover:border-sada-red/30 transition-all group relative shadow-sm flex flex-col justify-between h-full hover:shadow-2xl hover:shadow-black/5">
            <div>
                {/* 1. Icon & Priority Badge */}
                <div className="flex justify-between items-start mb-6">
                    <div className={`size-12 rounded-2xl bg-gradient-to-br ${project.priority === 'high' ? 'from-sada-red to-red-950' : 'from-zinc-800 to-black'} flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                        <FolderKanban size={22} strokeWidth={2.5} />
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-[0.15em] ${priorityStyles[project.priority] || 'text-muted-foreground border-border'}`}>
                        {project.priority || 'MEDIUM'} PRIORITY
                    </div>
                </div>

                {/* 2. Title & Description */}
                <div className="space-y-3 text-left mb-6">
                    <div className="flex flex-col gap-1">
                        <Link href={`/workspaces/${workspaceSlug}/projects/${project.slug}`} className="font-black text-[16px] uppercase tracking-tight text-foreground hover:text-sada-red transition-colors leading-tight">
                            {project.name}
                        </Link>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 italic opacity-80 border-l-2 border-muted pl-3">
                        {project.description || 'No operational brief...'}
                    </p>
                </div>
            </div>

            {/* 3. Progress & Meta Section (Mengikuti UI image_a8f0ff.jpg) */}
            <div className="space-y-5">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <span>Project Completion</span>
                        <span className="text-foreground italic">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-sada-red transition-all duration-1000 ease-out"
                            style={{ width: `${project.progress || 0}%` }}
                        />
                    </div>
                </div>

                {/* 4. Footer Meta */}
                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="justify-between w-full flex items-center">
                        {/* Member/Manager Info */}
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-muted border border-border overflow-hidden">
                                <img src={project.assignee?.avatar || `https://ui-avatars.com/api/?name=${project.assignee?.name || 'User'}&background=1a1a1a&color=fff`} className="size-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-foreground uppercase tracking-tighter leading-none">{project.assignee?.name || 'Unassigned'}</span>
                                <span className="text-[7px] font-bold text-muted-foreground uppercase">Manager</span>
                            </div>
                        </div>

                        {/* Deadline Info (Google Calendar Reference) */}
                        <div className="flex items-center gap-1.5 text-muted-foreground border-l border-border/50 pl-4">
                            <Calendar size={12} className="text-sada-red" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">
                                {formattedDeadline}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}