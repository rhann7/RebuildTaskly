import { FolderKanban, Plus, Target, Zap } from 'lucide-react';

interface ProjectDetailHeaderProps {
    project: any;
    onAddTask: () => void; // Fungsi untuk membuka modal/form task baru
}

export const ProjectDetailHeader = ({ project, onAddTask }: ProjectDetailHeaderProps) => (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm relative overflow-hidden group">
        
        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sada-red/5 blur-[80px] -mr-16 -mt-16 pointer-events-none" />

        <div className="flex items-center gap-6">
            {/* Project Icon dengan Dynamic Color Gradient */}
            <div className={`size-16 flex items-center justify-center rounded-xl bg-gradient-to-br ${project.color || 'from-sada-red to-red-950'} shadow-xl shadow-sada-red/10 border border-white/10 ring-1 ring-white/5 shrink-0 transition-transform group-hover:scale-105 duration-500`}>
                <FolderKanban className="size-8 text-white drop-shadow-md" />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none">
                        {project.name}
                    </h1>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active Sector</span>
                    </div>
                </div>
                
                <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground font-medium max-w-md line-clamp-1 italic opacity-70">
                        "{project.description || 'No operational brief provided for this sector...'}"
                    </p>
                    
                    {/* Stats Singkat: Task Progress */}
                    <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5">
                            <Target size={12} className="text-sada-red" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                {project.tasks_count || 0} Objectives
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Zap size={12} className="text-sada-red" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                {project.progress || 0}% Completion
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);