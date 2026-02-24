import { LucideIcon, ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react"; // <-- Tambahan Inertia Link

interface ActionProps {
    icon: LucideIcon;
    label: string;
    description?: string;
    color: string;
    href: string; // <-- Tambahan untuk URL Tujuan
}

export const QuickActions = ({ actions }: { actions: ActionProps[] }) => (
    <div className="">
        <div className="mb-6">
            <h2 className="text-xl font-black text-foreground tracking-tight uppercase ">Quick Actions</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">Shortcut to daily tasks</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
            {actions.map((action, index) => (
                <Link
                    key={index}
                    href={action.href} // <-- Tembak ke URL ini
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all duration-300 border border-transparent hover:border-border/60 group"
                >
                    <div className="flex items-center gap-4">
                        {/* Container Ikon */}
                        <div className={`size-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shrink-0`}>
                            <action.icon className="size-5 text-white" />
                        </div>
                        
                        {/* Label & Deskripsi */}
                        <div className="text-left">
                            <div className="text-sm font-black uppercase tracking-tight text-foreground group-hover:text-sada-red transition-colors">
                                {action.label}
                            </div>
                            {action.description && (
                                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                    {action.description}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ikon Panah Indikator */}
                    <div className="size-8 rounded-full bg-background flex items-center justify-center border border-border group-hover:border-sada-red/30 transition-colors">
                        <ChevronRight className="size-4 text-muted-foreground group-hover:text-sada-red group-hover:translate-x-0.5 transition-all" />
                    </div>
                </Link>
            ))}
        </div>
    </div>
);