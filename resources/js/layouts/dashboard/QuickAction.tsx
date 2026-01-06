import { LucideIcon, ChevronRight } from "lucide-react";

interface ActionProps {
    icon: LucideIcon;
    label: string;
    description?: string; // Tambahan agar lebih informatif
    color: string;
}

export const QuickActions = ({ actions }: { actions: ActionProps[] }) => (
    <div className="">
        <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Quick Actions</h2>
            <p className="text-xs text-muted-foreground mt-1">Shortcut to your daily tasks</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
            {actions.map((action, index) => (
                <button
                    key={index}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all duration-200 border border-transparent hover:border-border group"
                >
                    <div className="flex items-center gap-4">
                        {/* Container Ikon */}
                        <div className={`size-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg shadow-black/5 group-hover:rotate-6 transition-transform shrink-0`}>
                            <action.icon className="size-5 text-white" />
                        </div>
                        
                        {/* Label & Deskripsi */}
                        <div className="text-left">
                            <div className="text-sm font-bold text-foreground group-hover:text-sada-red transition-colors">
                                {action.label}
                            </div>
                            {action.description && (
                                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                    {action.description}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ikon Panah Indikator */}
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </button>
            ))}
        </div>
    </div>
);