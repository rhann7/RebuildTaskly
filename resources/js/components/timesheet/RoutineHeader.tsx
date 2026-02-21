import { Clock, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "../ui/button";

interface TimesheetHeaderProps {
    viewMode: "daily" | "weekly";
    setViewMode: (mode: "daily" | "weekly") => void;
    currentDate: Date;
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
}

export function RoutineHeader({
    viewMode,
    setViewMode,
    currentDate,
    onPreviousWeek,
    onNextWeek,
    onToday,
}: TimesheetHeaderProps) {
    const formatDateRange = () => {
        if (viewMode === "daily") {
            return currentDate.toLocaleDateString("id-ID", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } else {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            return `${startOfWeek.toLocaleDateString("id-ID", {
                month: "short",
                day: "numeric",
            })} - ${endOfWeek.toLocaleDateString("id-ID", {
                month: "short",
                day: "numeric",
                year: "numeric",
            })}`;
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-8 mb-4">
            {/* Page Title - Sada Industrial Style */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sada-red to-red-950 flex items-center justify-center text-white shadow-xl shadow-sada-red/20 border border-white/10 shrink-0">
                    <Clock size={28} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black uppercase leading-none">
                        My <span className="text-sada-red">Routine</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                        Time Logs & Activity Records
                    </p>
                </div>
            </div>

            {/* Navigation and View Toggle */}
            <div className="flex flex-wrap items-center gap-3">

                {/* Date Navigation - Compact Command Center */}
                <div className="flex items-center gap-1 bg-muted/30 border border-border rounded-2xl p-1 shadow-inner">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onPreviousWeek}
                        className="h-9 w-9 p-0 rounded-xl hover:bg-sada-red/10 hover:text-sada-red transition-all"
                    >
                        <ChevronLeft size={20} />
                    </Button>

                    <div className="flex items-center gap-3 px-4 border-x border-border/50">
                        <Calendar size={14} className="text-sada-red" />
                        <span className="text-[11px] font-black uppercase tracking-widest  text-foreground whitespace-nowrap">
                            {formatDateRange()}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onNextWeek}
                        className="h-9 w-9 p-0 rounded-xl hover:bg-sada-red/10 hover:text-sada-red transition-all"
                    >
                        <ChevronRight size={20} />
                    </Button>
                </div>

                {/* View Mode Toggle - Integrated Style */}
                <div className="flex bg-muted/30 border border-border rounded-2xl p-1 shadow-inner">
                    <button
                        onClick={() => setViewMode("daily")}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "daily"
                                ? "bg-background text-sada-red shadow-md border border-border scale-100"
                                : "text-muted-foreground hover:text-foreground opacity-70 scale-95"
                            }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setViewMode("weekly")}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "weekly"
                                ? "bg-background text-sada-red shadow-md border border-border scale-100"
                                : "text-muted-foreground hover:text-foreground opacity-70 scale-95"
                            }`}
                    >
                        Weekly
                    </button>
                </div>

                {/* Action Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onToday}
                    className="h-11 px-6 rounded-2xl border-border bg-background text-[10px] font-black uppercase tracking-widest hover:bg-sada-red hover:text-white hover:border-sada-red transition-all active:scale-95 shadow-sm"
                >
                    Go Today
                </Button>
            </div>
        </div>
    );
}