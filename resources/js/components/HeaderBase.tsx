import { LucideIcon, Plus } from 'lucide-react';

interface Stat {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
}

interface HeaderBaseProps {
    title: string;
    subtitle?: string;
    stats?: Stat[];
    addButton?: {
        label: string;
        onClick: () => void;
        show?: boolean;
    };
}

export default function HeaderBase({ title, subtitle, stats, addButton }: HeaderBaseProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            <div className="flex flex-col gap-1">
                <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
                    {title} <span className="text-muted-foreground/20">{subtitle}</span>
                </h1>
                {/* Optional: Bisa ditambah breadcrumb kecil di sini kalau mau */}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Stat Boxes */}
                {stats && (
                    <div className="grid grid-cols-2 gap-4 md:flex items-center">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-muted/30 border border-border p-4 rounded-2xl min-w-[140px]">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                        {stat.label}
                                    </span>
                                    <stat.icon size={12} className={stat.color || "text-muted-foreground"} />
                                </div>
                                <div className="text-2xl font-black italic tracking-tighter leading-none">
                                    {stat.value || 0}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Conditional Add Button */}
                {addButton?.show && (
                    <button 
                        onClick={addButton.onClick}
                        className="w-full md:w-auto h-14 px-8 bg-sada-red text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 group/btn"
                    >
                        <Plus size={18} strokeWidth={3} className="transition-transform group-hover/btn:rotate-90" />
                        {addButton.label}
                    </button>
                )}
            </div>
        </div>
    );
}