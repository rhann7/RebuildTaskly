import { FolderKanban, Plus, Target, Zap } from 'lucide-react';
import { usePage } from '@inertiajs/react'; // 1. Import usePage

interface ProjectDetailHeaderProps {
    project: any;
    onAddTask: () => void;
}

export const ProjectDetailHeader = ({ project, onAddTask }: ProjectDetailHeaderProps) => {
    // 2. Ambil data auth
    const { auth } = usePage<any>().props;

    // 3. Cek apakah user punya otoritas (Manager ke atas)
    const canAddTask = auth.user.roles?.some((role: any) => {
        const roleName = typeof role === 'string' ? role : role.name;
        return ['company', 'manager', 'super-admin'].includes(roleName);
    });

    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm relative overflow-hidden group">
            
            {/* Decorative Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sada-red/5 blur-[80px] -mr-16 -mt-16 pointer-events-none" />

            <div className="flex items-center gap-6">
                {/* Project Icon */}
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
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active Project</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground font-medium max-w-md line-clamp-1 italic opacity-70">
                            "{project.description || 'No operational brief provided for this project...'}"
                        </p>
                        
                        <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5">
                                <Target size={12} className="text-sada-red" />
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {project.tasks_count || 0} Tasks
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

            {/* ACTION ZONE - 4. Hanya render tombol jika punya akses */}
            {canAddTask && (
                <div className="relative z-10 w-full lg:w-auto">
                    <button 
                        onClick={onAddTask}
                        className="w-full lg:w-auto h-14 px-8 bg-sada-red text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 group/btn"
                    >
                        <Plus size={18} strokeWidth={3} className="transition-transform group-hover/btn:rotate-90" />
                        Add New Task
                    </button>
                </div>
            )}
        </div>
    );
};