import {
    ArrowUpRight, Building2, ShieldCheck, ShieldAlert,
    Briefcase, Users, CheckCircle, Zap, Clock, Activity,
    Layers, CheckSquare, AlertCircle, Timer, Target, Calendar,
    TrendingDown, Minus
} from "lucide-react";

// Update Mapping Icon agar mencakup metrik baru (Target, Calendar, dll)
const ICON_MAP: Record<string, any> = {
    Building2, ShieldCheck, ShieldAlert, Briefcase, Users,
    CheckCircle, Zap, Clock, Activity, Layers,
    CheckSquare, AlertCircle, Timer, Target, Calendar
};

interface StatData {
    title: string;
    value: string | number;
    change: string;
    icon: string;
    color: string;
}

export const StatsGrid = ({ stats }: { stats: StatData[] }) => {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, index) => {
                const IconComponent = ICON_MAP[stat.icon] || Activity;

                // Logic Sederhana: Jika title mengandung 'Revision' atau 'Alert', 
                // kita asumsikan 'change' bernilai kritikal (merah/kuning)
                const isCritical = stat.title.toLowerCase().includes('revision') ||
                    stat.title.toLowerCase().includes('pending');

                return (
                    <div
                        key={index}
                        className="group relative overflow-hidden bg-card rounded-[32px] p-7 border border-border/60 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-sada-red/5 hover:-translate-y-1.5"
                    >
                        {/* Dynamic Glow Effect based on stat color */}
                        <div className={`absolute -right-6 -top-6 size-32 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.12] blur-3xl transition-opacity duration-700`} />

                        <div className="flex items-start justify-between mb-6 relative z-10">
                            {/* Icon Box */}
                            <div className={`w-14 h-14 rounded-[22px] bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                                <IconComponent className="w-7 h-7 text-white" />
                            </div>

                            {/* Badge Indikator Tren */}
                            <div className={`flex items-center gap-1 rounded-xl px-2.5 py-1 border ${isCritical
                                    ? "bg-sada-red/10 border-sada-red/20 text-sada-red"
                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                }`}>
                                {isCritical ? (
                                    <TrendingDown className="w-3.5 h-3.5" />
                                ) : (
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                )}
                            </div>
                        </div>

                        <div className="relative z-10">
                            {/* Label */}
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">
                                {stat.title}
                            </p>

                            {/* Value */}
                            <h3 className="text-4xl font-black text-foreground mb-1 tracking-tighter">
                                {stat.value}
                            </h3>

                            {/* Subtitle/Change */}
                            <p className={`text-[10px] font-black uppercase tracking-widest ${isCritical ? "text-sada-red/80" : "text-emerald-600 dark:text-emerald-400"
                                }`}>
                                {stat.change}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};