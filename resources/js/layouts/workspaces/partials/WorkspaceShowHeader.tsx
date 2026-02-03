// resources/js/pages/workspaces/partials/workspace-header.tsx
import { Building2, Users2, LayoutGrid, Plus } from 'lucide-react';

interface HeaderProps {
    workspace: any;
    projectCount: number;
    onAddProject: () => void; // Prop baru buat buka modal
}

export const WorkspaceHeader = ({ workspace, projectCount, onAddProject }: HeaderProps) => (
    <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-muted/10 p-8 rounded-[32px] border border-white/5 shadow-inner overflow-hidden">
        {/* Background Accent Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sada-red/5 blur-[80px] -mr-16 -mt-16 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 z-10">
            {/* Logo Workspace */}
            <div className="size-20 flex items-center justify-center rounded-xl bg-gradient-to-br from-sada-red to-red-950 shadow-xl shadow-sada-red/20 border border-white/10 ring-1 ring-white/5 shrink-0 transition-transform hover:scale-105 duration-500">
                <Building2 className="size-10 text-white" />
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">
                        {workspace.name}
                    </h1>
                    <div className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                        workspace.status === 'active' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                        : 'bg-sada-red/10 border-sada-red/20 text-sada-red'
                    }`}>
                        {workspace.status}
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Users2 size={14} className="text-sada-red" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {workspace.members?.length || 0} Members
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <LayoutGrid size={14} className="text-sada-red" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {projectCount || 0} Projects 
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Section: Ganti Stability Bar jadi Button */}
        <div className="flex items-center gap-6 w-full lg:w-auto z-10">
            <button 
                onClick={onAddProject} // Panggil fungsi yang dioper dari layout
                className="h-12 px-8 bg-sada-red text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-sada-red/20"
                >
                <Plus size={16} strokeWidth={3} /> Add New Project
            </button>
        </div>
    </div>
);