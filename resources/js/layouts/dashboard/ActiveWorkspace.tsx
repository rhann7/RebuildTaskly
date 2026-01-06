import { MoreVertical, CheckCircle, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceProps {
    name: string;
    tasks: number;
    completed: number;
    members: number;
    progress: number;
    color: string; // Misal: "bg-sada-red" atau "bg-blue-500"
}

export const ActiveWorkspaces = ({ workspaces }: { workspaces: WorkspaceProps[] }) => (
    <div className="lg:col-span-2 bg-card rounded-[24px] p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Active Workspaces</h2>
                <p className="text-xs text-muted-foreground mt-1">Ongoing projects and team progress</p>
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-sada-red hover:text-sada-red/80 hover:bg-sada-red/5 font-bold flex items-center gap-2"
            >
                View All <ExternalLink size={14} />
            </Button>
        </div>

        <div className="space-y-3">
            {workspaces.map((workspace, index) => (
                <div 
                    key={index} 
                    className="group p-5 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 border border-transparent hover:border-border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`size-3.5 ${workspace.color} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] ring-2 ring-background`} />
                            <span className="font-bold text-foreground group-hover:text-sada-red transition-colors">
                                {workspace.name}
                            </span>
                        </div>
                        <button className="p-1.5 hover:bg-background rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                            <MoreVertical className="size-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-6 mb-4 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="size-4 text-emerald-500" /> 
                            <span className="text-foreground">{workspace.completed}</span>/{workspace.tasks} Tasks
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="size-4 text-blue-500" /> 
                            <span className="text-foreground">{workspace.members}</span> Members
                        </div>
                    </div>

                    {/* Progress Bar Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span>Progress</span>
                            <span className="text-foreground">{workspace.progress}%</span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                                className={`absolute h-full ${workspace.color} transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]`} 
                                style={{ width: `${workspace.progress}%` }} 
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);