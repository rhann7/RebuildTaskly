import { Briefcase, ArrowRight, Layers } from "lucide-react";
import { Link } from "@inertiajs/react";

export const ManagerProjects = ({ projects }: { projects: any[] }) => (
    <div className="bg-card rounded-[32px] p-8 border border-border/60 shadow-sm flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-xl font-black text-foreground tracking-tight uppercase  flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-500" /> Managed Projects
                </h2>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
                    Active projects under your supervision
                </p>
            </div>
        </div>

        {/* List Content */}
        <div className="flex flex-col gap-4">
            {projects && projects.length > 0 ? (
                projects.map((project, index) => (
                    <div 
                        key={index} 
                        className="group flex items-center justify-between p-5 rounded-[24px] bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/60 transition-all duration-300"
                    >
                        <div className="flex items-center gap-5">
                            <div className="size-12 rounded-[16px] bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shrink-0">
                                <Briefcase size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                                    {project.name}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                    <Layers size={10} /> {project.workspace?.name || 'Unknown Workspace'}
                                </span>
                            </div>
                        </div>

                        {/* Tombol Panah ke Detail Project */}
                        <Link href={`/workspaces/${project.workspace?.slug}/projects/${project.slug}`}>
                            <button className="size-10 flex items-center justify-center bg-background rounded-xl text-muted-foreground hover:text-blue-500 hover:border-blue-500/30 border border-border shadow-sm group-hover:scale-110 group-hover:bg-blue-500/5 transition-all">
                                <ArrowRight size={16} />
                            </button>
                        </Link>
                    </div>
                ))
            ) : (
                <div className="py-12 text-center border-2 border-dashed border-border rounded-[24px] opacity-50 flex flex-col items-center justify-center gap-2">
                    <Briefcase size={24} className="text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No active projects found</p>
                </div>
            )}
        </div>
    </div>
);