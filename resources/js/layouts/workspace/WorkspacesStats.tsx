// src/components/workspace/WorkspacesStats.tsx
import { WORKSPACES_DUMMY } from "@/data/workspace-data";
import { FolderKanban, CheckCircle, Users, TrendingUp } from "lucide-react";

export const WorkspaceStats = () => {
    const workspaces = WORKSPACES_DUMMY;
    
    // Kalkulasi
    const totalWorkspaces = workspaces.length;
    const activeProjects = workspaces.filter(w => w.status === 'active').length;
    const totalMembers = workspaces.reduce((acc, curr) => acc + curr.totalMembers, 0);
    const avgProgress = totalWorkspaces > 0 
        ? Math.round(workspaces.reduce((acc, curr) => acc + curr.progress, 0) / totalWorkspaces)
        : 0;

    const statsData = [
        { label: "Total Workspaces", value: totalWorkspaces, icon: FolderKanban, color: "from-purple-500 to-indigo-600" },
        { label: "Active Projects", value: activeProjects, icon: CheckCircle, color: "from-emerald-500 to-teal-600" },
        { label: "Total Members", value: totalMembers, icon: Users, color: "from-blue-500 to-cyan-600" },
        { label: "Avg. Completion", value: `${avgProgress}%`, icon: TrendingUp, color: "from-sada-red to-orange-600" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {statsData.map((stat, index) => (
                <div key={index} className="bg-card rounded-[24px] p-5 border border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:border-sada-red/20 group">
                    <div className={`size-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                        <stat.icon className="size-6 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5 truncate">{stat.label}</p>
                        <p className="text-xl font-black text-foreground tracking-tight">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};