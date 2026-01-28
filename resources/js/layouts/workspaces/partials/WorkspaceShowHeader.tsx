// resources/js/pages/workspaces/partials/workspace-header.tsx
import { Building2, Users2, LayoutGrid, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface HeaderProps {
    workspace: any;
    projectCount: number;
}

export const WorkspaceHeader = ({ workspace, projectCount }: HeaderProps) => (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-muted/10 p-8 rounded-[32px] border border-white/5 shadow-inner">
        {/* Background Accent Decor - Biar gak terlalu polos */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sada-red/5 blur-[80px] -mr-16 -mt-16 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Logo Workspace dengan Gradient Sada Red */}
            <div className="size-20 flex items-center justify-center rounded-xl bg-gradient-to-br from-sada-red to-red-950 shadow-xl shadow-sada-red/20 border border-white/10 ring-1 ring-white/5 shrink-0 transition-transform group-hover:scale-105 duration-500">
                <Building2 className="size-10 text-white" />
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">
                        {workspace.name}
                    </h1>
                    {/* Status Badge Custom */}
                    <div className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                        workspace.status === 'active' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                        : 'bg-sada-red/10 border-sada-red/20 text-sada-red'
                    }`}>
                        {workspace.status}
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    {/* Member Stats */}
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Users2 size={14} className="text-sada-red" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {workspace.members?.length || 0} Members
                        </span>
                    </div>
                    {/* Project Stats */}
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <LayoutGrid size={14} className="text-sada-red" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {/* PAKAI PROP projectCount DI SINI, JANGAN workspace.projects */}
                            {projectCount || 0} Projects 
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
            {/* Progress Stability Section */}
            <div className="flex flex-col items-end gap-3 min-w-[240px] w-full sm:w-auto">
                <div className="flex justify-between w-full items-end">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Operational Stability</span>
                    <span className="text-2xl font-black text-foreground tabular-nums">
                        {workspace.progress || 0}%
                    </span>
                </div>
                <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden border border-border p-[1px]">
                    <div
                        className="h-full bg-gradient-to-r from-sada-red to-red-600 rounded-full shadow-[0_0_15px_rgba(227,6,19,0.3)] transition-all duration-1000"
                        style={{ width: `${workspace.progress || 0}%` }}
                    />
                </div>
            </div>
        </div>
    </div>
);