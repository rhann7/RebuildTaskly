import { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    Clock, Plus, Activity, Calendar as CalendarIcon, 
    CheckCircle2, Timer, AlertCircle, Shield,
    CornerDownRight, X, Send, Eye, FileText
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Props {
    task: any;
    isManager?: boolean;
}

export const TaskTimesheetTab = ({ task, isManager }: Props) => {
    const [isLogging, setIsLogging] = useState(false);
    
    // State untuk panel geser (Sheet)
    const [selectedLog, setSelectedLog] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    // State form revisi di dalam Sheet
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const logs = task.entries || [];

    const groupedEntries = logs.reduce((acc: any, entry: any) => {
        const date = entry.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'revision': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'submitted': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default: return 'text-zinc-500 bg-zinc-100 border-zinc-200';
        }
    };

    // Buka panel detail
    const openLogDetails = (log: any) => {
        setSelectedLog(log);
        setIsRejecting(false);
        setRejectReason("");
        setIsSheetOpen(true);
    };

    // Aksi Manager: Approve spesifik log ini
    const handleApproveEntry = (id: number) => {
        router.patch(`/timesheets/entries/${id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => setIsSheetOpen(false)
        });
    };

    // Aksi Manager: Tolak/Revisi spesifik log ini
    const handleRejectEntry = (id: number) => {
        if (!rejectReason.trim()) return alert("Revision reason is required.");
        router.patch(`/timesheets/entries/${id}/reject`, { reason: rejectReason }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSheetOpen(false);
                setIsRejecting(false);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
            {/* --- KIRI: LIST LOGS --- */}
            <div className="lg:col-span-2 flex flex-col gap-8">
                <div className="flex justify-between items-center px-2">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                            <Activity size={16} className="text-sada-red" />
                            Operation Logs
                        </h3>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {sortedDates.length > 0 ? (
                        sortedDates.map((date) => (
                            <div key={date} className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 border-b border-border pb-2 px-2">
                                    <CalendarIcon size={14} className="text-muted-foreground" />
                                    <span className="text-[11px] font-black uppercase text-foreground">
                                        {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {groupedEntries[date].map((entry: any) => (
                                        <div key={entry.id} className="group bg-card border border-border p-4 rounded-2xl flex items-center justify-between hover:border-sada-red/30 transition-all shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={entry.user?.profile_photo_url || `https://ui-avatars.com/api/?name=${entry.user?.name}&background=random&color=fff`} 
                                                    className="size-10 rounded-xl object-cover border border-border"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black uppercase text-foreground">{entry.user?.name}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-muted-foreground">{entry.start_at?.substring(0, 5)} - {entry.end_at?.substring(0, 5)}</span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(entry.status)}`}>
                                                            {entry.status || 'Draft'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => openLogDetails(entry)}
                                                className="h-8 px-4 bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-800 text-foreground rounded-lg flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all"
                                            >
                                                <Eye size={12} /> Inspect
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center opacity-40">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No activity detected</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- KANAN: SUMMARY TETAP SAMA --- */}
            <div className="lg:col-span-1 ...">
                {/* (Bisa gunakan kode summary kanan yang sama dengan sebelumnya) */}
            </div>

            {/* --- PANEL GESER (SHEET) UNTUK DETAIL & ACTION --- */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md border-l-border bg-card p-0 flex flex-col">
                    {selectedLog && (
                        <>
                            <div className="p-6 border-b border-border bg-muted/30">
                                <SheetHeader>
                                    <SheetTitle className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                                        <FileText size={16} className="text-sada-red" />
                                        Log Report Details
                                    </SheetTitle>
                                </SheetHeader>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
                                {/* Info Utama */}
                                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border">
                                    <img src={selectedLog.user?.profile_photo_url || `https://ui-avatars.com/api/?name=${selectedLog.user?.name}`} className="size-12 rounded-xl object-cover" />
                                    <div>
                                        <h4 className="text-xs font-black uppercase">{selectedLog.user?.name}</h4>
                                        <p className="text-[10px] text-muted-foreground font-bold mt-0.5">{selectedLog.date} • {selectedLog.hours} Hours</p>
                                    </div>
                                    <div className={`ml-auto px-2 py-1 rounded text-[9px] font-black uppercase border ${getStatusStyle(selectedLog.status)}`}>
                                        {selectedLog.status || 'Draft'}
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Operational Notes</label>
                                    <p className="text-xs text-foreground bg-muted/20 p-4 rounded-xl border border-border/50 italic leading-relaxed">
                                        "{selectedLog.description}"
                                    </p>
                                </div>

                                {/* Menampilkan Alasan Revisi Jika Ada */}
                                {selectedLog.reject_reason && (
                                    <div className="flex flex-col gap-2 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                        <label className="text-[9px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1">
                                            <AlertCircle size={10} /> Revision Note
                                        </label>
                                        <p className="text-xs text-red-600 font-medium">{selectedLog.reject_reason}</p>
                                    </div>
                                )}
                            </div>

                            {/* --- MANAGER ACTION DOCK --- */}
                            {isManager && selectedLog.status !== 'approved' && (
                                <div className="p-6 border-t border-border bg-muted/10 flex flex-col gap-3">
                                    {isRejecting ? (
                                        <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                                            <textarea 
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                placeholder="Explain why this needs revision..."
                                                className="bg-background text-xs p-3 rounded-lg border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none h-20"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => setIsRejecting(false)} className="flex-1 py-2 text-[10px] font-black uppercase text-muted-foreground bg-muted rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                                                    Cancel
                                                </button>
                                                <button onClick={() => handleRejectEntry(selectedLog.id)} className="flex-1 py-2 text-[10px] font-black uppercase bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors">
                                                    Submit Revision
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setIsRejecting(true)}
                                                className="flex-1 py-3 text-[10px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                Request Revision
                                            </button>
                                            <button 
                                                onClick={() => handleApproveEntry(selectedLog.id)}
                                                className="flex-1 py-3 text-[10px] font-black uppercase bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex justify-center items-center gap-2"
                                            >
                                                <CheckCircle2 size={14} /> Authorize Log
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};