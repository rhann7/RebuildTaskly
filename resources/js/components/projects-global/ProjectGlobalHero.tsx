import { Briefcase, Activity } from 'lucide-react';

interface HeroProps {
    total: number;
    activeCount: number;
}

export const ProjectGlobalHero = ({ total, activeCount }: HeroProps) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <div className="flex items-center gap-2 mb-2">
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
                Global <span className="text-muted-foreground/20">Project</span>
            </h1>
        </div>

        <div className="grid grid-cols-2 gap-4 md:flex items-center">
            <StatBox label="Total Assets" value={total} icon={Briefcase} />
            <StatBox label="Active Ops" value={activeCount} icon={Activity} color="text-sada-red" />
        </div>
    </div>
);

const StatBox = ({ label, value, icon: Icon, color = "text-muted-foreground" }: any) => (
    <div className="bg-muted/30 border border-border p-4 rounded-2xl min-w-[140px]">
        <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
            <Icon size={12} className={color} />
        </div>
        <div className="text-2xl font-black italic tracking-tighter leading-none">{value || 0}</div>
    </div>
);