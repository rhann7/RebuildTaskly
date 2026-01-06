import { ArrowUpRight, LucideIcon } from "lucide-react";

interface StatProps {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
    color: string; // Misal: "from-red-500 to-red-600"
}

export const StatsGrid = ({ stats }: { stats: StatProps[] }) => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
            <div 
                key={index} 
                className="group relative overflow-hidden bg-card rounded-[24px] p-6 border border-border shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-sada-red/5 hover:-translate-y-1"
            >
                {/* Decorative Background Glow (Muncul saat hover) */}
                <div className="absolute -right-4 -top-4 size-24 bg-sada-red/5 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />

                <div className="flex items-start justify-between mb-4 relative z-10">
                    {/* Icon Container */}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                        <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Trend Icon */}
                    <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 dark:bg-emerald-500/20">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {/* <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">UP</span> */}
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">
                        {stat.title}
                    </p>
                    <h3 className="text-3xl font-black text-foreground mb-1 tracking-tight">
                        {stat.value}
                    </h3>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        {stat.change}
                        {/* <span className="text-muted-foreground font-normal">vs last month</span> */}
                    </p>
                </div>
            </div>
        ))}
    </div>
);