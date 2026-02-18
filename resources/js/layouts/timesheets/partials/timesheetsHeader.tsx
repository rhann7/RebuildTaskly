import { Plus, Download, LayoutGrid, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimesheetHeaderProps {
    title?: string;
    description?: string;
    onAddEvent: () => void;
    onExport?: () => void;
}

export const TimesheetHeader = ({ 
    title = "Operation Registry", 
    description = "Monitoring tactical work hours and field performance data.",
    onAddEvent,
    onExport
}: TimesheetHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 transition-all">
            {/* Judul dan Deskripsi dengan Aksen Sada Red */}
            <div className="relative pl-6">
                {/* Garis Aksen Vertikal Khas Sada */}
                <div className="absolute left-0 top-1 bottom-1 w-1.5 bg-sada-red rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-foreground uppercase italic leading-none">
                        {title}
                    </h1>
                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wide opacity-70 max-w-md">
                        {description}
                    </p>
                </div>
            </div>

            {/* Aksi Utama: Tombol dengan Style yang Lebih Solid */}
            <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-[24px] border border-border/50">
                {/* Tombol Export */}
                <Button 
                    variant="ghost" 
                    onClick={onExport}
                    className="h-11 px-5 rounded-xl font-black transition-all uppercase text-[9px] tracking-[0.15em] text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-zinc-800 shadow-none"
                >
                    <FileSpreadsheet className="size-4 mr-2 text-sada-red/60" /> 
                    Export Data
                </Button>

                {/* Tombol Add Event (Main Tactical Action) */}
                <Button 
                    onClick={onAddEvent}
                    className="h-11 px-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-xl shadow-black/10 font-black flex items-center gap-3 group transition-all active:scale-95 border-none"
                >
                    <Plus size={16} strokeWidth={4} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="uppercase text-[10px] tracking-[0.2em]">Deploy Log</span>
                </Button>
            </div>
        </div>
    );
};