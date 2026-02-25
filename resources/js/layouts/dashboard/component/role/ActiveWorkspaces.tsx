import { CheckCircle, Users, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";

interface WorkspaceProps {
    name: string;
    slug: string;
    tasks: number;
    completed: number;
    members: number;
    progress: number;
    color: string; 
    manager?: string;
}

export const ActiveWorkspaces = ({ workspaces }: { workspaces: WorkspaceProps[] }) => (
    <div className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-xl font-black text-foreground tracking-tight uppercase ">
                    Active Workspaces
                </h2>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
                    Real-time operational overview
                </p>
            </div>
            <Link href="/workspaces">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px] font-black uppercase tracking-widest text-sada-red hover:bg-sada-red/10 rounded-xl gap-2 transition-all"
                >
                    Expand Vault <ExternalLink size={12} />
                </Button>
            </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border">
            {workspaces.length > 0 ? (
                workspaces.map((workspace, index) => (
                    <div 
                        key={workspace.slug} 
                        className="group relative p-6 rounded-[24px] bg-muted/20 hover:bg-muted/40 transition-all duration-500 border border-transparent hover:border-border/60"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-4">
                                <div className="relative flex">
                                    <div className={`size-3 ${workspace.color} rounded-full`} />
                                    <div className={`absolute inset-0 size-3 ${workspace.color} rounded-full animate-ping opacity-20`} />
                                </div>
                                <div>
                                    <span className="text-sm font-black text-foreground uppercase group-hover:text-sada-red transition-colors">
                                        {workspace.name}
                                    </span>
                                    {workspace.manager && (
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                            Lead: {workspace.manager}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <Link href={`/workspaces/${workspace.slug}`}>
                                <button className="size-8 flex items-center justify-center bg-background rounded-xl text-muted-foreground hover:text-sada-red border border-border shadow-sm group-hover:scale-110 transition-all">
                                    <ArrowRight size={14} />
                                </button>
                            </Link>
                        </div>

                        <div className="flex items-center gap-5 mb-5">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-xl border border-border/50">
                                <CheckCircle className="size-3 text-emerald-500" /> 
                                <span className="text-[10px] font-black">
                                    {workspace.completed}/{workspace.tasks} <span className="text-muted-foreground opacity-50 ml-1">TASKS</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-xl border border-border/50">
                                <Users className="size-3 text-blue-500" /> 
                                <span className="text-[10px] font-black">
                                    {workspace.members} <span className="text-muted-foreground opacity-50 ml-1">MEMBERS</span>
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Execution</span>
                                <span className="text-sm font-black ">{workspace.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${workspace.color} transition-all duration-1000 ease-out`} 
                                    style={{ width: `${workspace.progress}%` }} 
                                />
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-20 text-center border-2 border-dashed border-border rounded-[32px] opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-widest">No active deployment detected</p>
                </div>
            )}
        </div>
    </div>
);