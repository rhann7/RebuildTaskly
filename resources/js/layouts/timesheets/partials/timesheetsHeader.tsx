import { Plus, FileSpreadsheet, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimesheetHeaderProps {
    title?: string;
    isManager: boolean; 
}

export const TimesheetHeader = ({
    title,
    isManager
}: TimesheetHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 transition-all">
            {/* Judul dan Deskripsi dengan Aksen Sada Red */}
            <div className="relative pl-6">
                <div className="absolute left-0 top-1 bottom-1 w-1.5 bg-sada-red rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)]" />

                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        {isManager ? (
                            <ShieldCheck size={14} className="text-sada-red animate-pulse" />
                        ) : (
                            <User size={14} className="text-sada-red" />
                        )}
                        <span className="text-[9px] font-black text-sada-red uppercase tracking-[0.3em]">
                            {isManager ? "Administrative Access" : "Standard Operator"}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase leading-none tracking-tighter">
                        {title || (isManager ? "Registry Control" : "Work Registry")}
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-70">
                        {isManager
                            ? "Monitor and manage team timesheets, review logs, and oversee project timelines."
                            : "Track your work hours and submit timesheets."}
                    </p>
                </div>
            </div>
        </div>
    );
};