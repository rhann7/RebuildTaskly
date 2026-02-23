import { useState } from "react";
import { router } from "@inertiajs/react";
import { 
    Layers, CheckCircle2, XCircle, Clock, Search, Eye 
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function ManagerReviewTab({ pendingLogs }: { pendingLogs: any[] }) {
    const [selectedSheet, setSelectedSheet] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fungsi untuk membuka detail
    const openReview = (log: any) => {
        setSelectedSheet(log);
        setIsSheetOpen(true);
    };

    // Fungsi untuk ACC (Approve)
    const handleApprove = () => {
        if (!selectedSheet) return;
        setIsProcessing(true);
        router.patch(`/timesheets/${selectedSheet.id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSheetOpen(false);
                setIsProcessing(false);
            },
        });
    };

    // Fungsi untuk REJECT / REVISI
    const handleReject = () => {
        if (!selectedSheet) return;
        const reason = prompt("Silakan masukkan alasan penolakan/revisi:");
        if (!reason) return; // Batal jika kosong

        setIsProcessing(true);
        router.patch(`/timesheets/${selectedSheet.id}/reject`, { reason: reason }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSheetOpen(false);
                setIsProcessing(false);
            },
        });
    };

    return (
        <div className="space-y-4">
            {/* SEARCH / FILTER BAR (Opsional) */}
            <div className="flex items-center gap-4 p-4 border border-border rounded-[24px] bg-card mb-6 shadow-sm">
                <Search size={16} className="text-muted-foreground ml-2" />
                <input 
                    type="text" 
                    placeholder="Search by Employee ID or Name..." 
                    className="bg-transparent border-none outline-none flex-1 text-sm font-medium"
                />
            </div>

            {/* LIST DAFTAR PENDING */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pendingLogs.map((log: any, i: number) => (
                    <div 
                        key={log.id || i}
                        className="p-6 border border-border rounded-[32px] bg-white dark:bg-zinc-900/40 flex flex-col justify-between group hover:border-sada-red/30 hover:shadow-xl transition-all animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both"
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-lg text-zinc-400 group-hover:text-sada-red transition-colors border border-border">
                                    {log.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black uppercase tracking-tight text-foreground">{log.user?.name || 'Unknown User'}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">ID: {log.user?.id || '---'}</span>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                <Clock size={10} /> Pending
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-6 p-3 bg-muted/20 rounded-2xl border border-border/50">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Period</span>
                                <span className="text-xs font-bold">{new Date(log.start_at).toLocaleDateString()} - {new Date(log.end_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Logged</span>
                                <span className="text-xs font-bold">{log.total_hours} Hours</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => openReview(log)}
                            className="w-full h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-foreground text-[11px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center gap-2"
                        >
                            <Eye size={14} /> Review Timesheet
                        </button>
                    </div>
                ))}
            </div>

            {/* SLIDE-OUT PANEL (SHEET) UNTUK DETAIL REVIEW */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-3xl overflow-y-auto border-l-border bg-white dark:bg-zinc-950 p-0 flex flex-col">
                    {selectedSheet && (
                        <>
                            <div className="p-8 border-b border-border bg-muted/10">
                                <SheetHeader>
                                    <SheetTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                        Timesheet Review
                                    </SheetTitle>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        EMPLOYEE: <span className="text-foreground">{selectedSheet.user?.name}</span>
                                    </p>
                                </SheetHeader>
                            </div>

                            <div className="flex-1 p-8 overflow-y-auto bg-grid-slate-100 dark:bg-grid-slate-900">
                                {/* DI SINI KAMU BISA MERENDER COMPONENT TIMEGRID */}
                                <div className="p-10 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center opacity-50">
                                    <Layers size={40} className="mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">
                                        Data Grid {selectedSheet.start_at}
                                    </p>
                                    <p className="text-xs mt-2">
                                        (Panggil komponen TimeGrid di sini dengan property view-only / non-clickable)
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 border-t border-border bg-card flex items-center justify-between gap-4 mt-auto">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 h-12 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest"
                                    onClick={handleReject}
                                    disabled={isProcessing}
                                >
                                    <XCircle size={16} className="mr-2" /> Request Revision
                                </Button>
                                <Button 
                                    className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                >
                                    <CheckCircle2 size={16} className="mr-2" /> Authorize & ACC
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}