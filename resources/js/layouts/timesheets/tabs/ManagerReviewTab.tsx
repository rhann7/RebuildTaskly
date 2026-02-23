import { useState } from "react";
import { router } from "@inertiajs/react";
import { Layers, CheckCircle2, XCircle, Clock, Search, Eye, Calendar as CalendarIcon, Flag, AlertCircle, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function ManagerReviewTab({ pendingLogs }: { pendingLogs: any[] }) {
    const [selectedSheet, setSelectedSheet] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const openReview = (log: any) => {
        setSelectedSheet(log);
        setIsSheetOpen(true);
    };

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

    const handleReject = () => {
        if (!selectedSheet) return;
        const reason = prompt("Enter overall revision instructions / reason for rejection:");
        if (!reason) return;

        setIsProcessing(true);
        router.patch(`/timesheets/${selectedSheet.id}/reject`, { reason }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSheetOpen(false);
                setIsProcessing(false);
            },
        });
    };

    const handleRejectEntry = (entryId: number) => {
        const reason = prompt("Enter reason for rejecting this specific entry:");
        if (!reason) return;

        setIsProcessing(true);
        router.patch(`/timesheet-entries/${entryId}/reject`, { reason }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsProcessing(false);
                setSelectedSheet((prev: any) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        entries: prev.entries.map((e: any) => 
                            e.id === entryId ? { ...e, status: 'revision', reject_reason: reason } : e
                        )
                    };
                });
            },
            onError: () => setIsProcessing(false)
        });
    };

    const filteredLogs = pendingLogs.filter(log => {
        const query = searchQuery.toLowerCase();
        return log.user?.name?.toLowerCase().includes(query) || log.user?.id?.toString().includes(query);
    });

    const groupedEntries = selectedSheet?.entries?.reduce((acc: any, entry: any) => {
        const date = entry.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
    }, {});
    const sortedDates = groupedEntries ? Object.keys(groupedEntries).sort() : [];

    const checkOverlap = (dayEntries: any[]) => {
        if (!dayEntries || dayEntries.length < 2) return false;
        const sorted = [...dayEntries].sort((a, b) => a.start_at.substring(0,5).localeCompare(b.start_at.substring(0,5)));
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].end_at.substring(0,5) > sorted[i + 1].start_at.substring(0,5)) return true;
        }
        return false;
    };

    // --- LOGIKA BARU: Cek apakah ada entry yang di-flag merah ---
    const hasFlaggedEntries = selectedSheet?.entries?.some((e: any) => e.status === 'revision');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 p-2 pl-4 border border-border rounded-2xl bg-card shadow-sm focus-within:border-sada-red/50 transition-colors">
                <Search size={16} className="text-muted-foreground" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search personnel by name or ID..." 
                    className="bg-transparent border-none outline-none flex-1 text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/50 h-10"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredLogs.length > 0 ? (
                    filteredLogs.map((log: any, i: number) => (
                        <div key={log.id}
                            className="p-6 border border-border rounded-[32px] bg-card flex flex-col justify-between group hover:border-sada-red/30 hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-2xl bg-muted flex items-center justify-center font-black text-lg text-muted-foreground group-hover:text-sada-red transition-colors border border-border">
                                        {log.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black uppercase tracking-tight text-foreground">{log.user?.name || 'Unknown User'}</span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">ID: {log.user?.id || '---'}</span>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                    <Clock size={10} /> Pending
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-6 p-4 bg-muted/30 rounded-2xl border border-border">
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-1">Period</span>
                                    <span className="text-[10px] font-bold text-foreground">
                                        {new Date(log.start_at).toLocaleDateString('en-GB', { month:'short', day:'numeric' })} - {new Date(log.end_at).toLocaleDateString('en-GB', { month:'short', day:'numeric' })}
                                    </span>
                                </div>
                                <div className="flex flex-col border-l border-border pl-2">
                                    <span className="text-[8px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-1">Total Logged</span>
                                    <span className="text-xs font-black text-foreground">{log.total_hours} Hrs</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => openReview(log)}
                                className="w-full h-12 rounded-xl bg-muted text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center gap-2 border border-border"
                            >
                                <Eye size={14} /> Review Timesheet
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[32px] bg-muted/10 opacity-60">
                        <CheckCircle2 size={48} className="mb-4 text-emerald-500/50" />
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">All Clear. No Pending Reviews.</p>
                    </div>
                )}
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl overflow-hidden border-l-border bg-card p-0 flex flex-col">
                    {selectedSheet && (
                        <>
                            <div className="p-8 border-b border-border bg-muted/30 shrink-0">
                                <SheetHeader>
                                    <SheetTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-foreground">
                                        Review Timesheet
                                    </SheetTitle>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        OPERATIVE: <span className="text-foreground">{selectedSheet.user?.name}</span> | PERIOD: <span className="text-foreground">{selectedSheet.start_at}</span>
                                    </p>
                                </SheetHeader>
                            </div>

                            <div className="flex-1 p-8 overflow-y-auto space-y-10">
                                {sortedDates.length > 0 ? (
                                    sortedDates.map((date, index) => {
                                        const dayEntries = groupedEntries[date];
                                        const dayTotal = dayEntries.reduce((sum: number, e: any) => sum + parseFloat(e.hours), 0);
                                        const dateObj = new Date(date);
                                        const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'long' });
                                        const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                                        const isOverlapping = checkOverlap(dayEntries);

                                        return (
                                            <div key={date} className="relative animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <div className="size-8 rounded-full bg-sada-red/10 text-sada-red flex items-center justify-center border border-sada-red/20">
                                                            <CalendarIcon size={14} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">{dayName}</h4>
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formattedDate}</span>
                                                        </div>
                                                        {isOverlapping && (
                                                            <div className="ml-2 px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                                                <AlertTriangle size={10} /> Multitasking
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="px-3 py-1 bg-muted rounded-lg text-[10px] font-black uppercase tracking-widest text-foreground border border-border">
                                                        {dayTotal} Hrs
                                                    </div>
                                                </div>

                                                <div className="space-y-3 pl-4 border-l-2 border-muted ml-4">
                                                    {dayEntries.map((entry: any) => (
                                                        <div key={entry.id} className={`p-4 border rounded-2xl transition-colors ${entry.status === 'revision' ? 'bg-red-500/5 border-red-500/30' : 'bg-background border-border hover:border-sada-red/30'}`}>
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex-1 pr-4">
                                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sada-red mb-1">
                                                                        {entry.project?.name || 'Unassigned'}
                                                                    </p>
                                                                    <h5 className="text-[13px] font-bold text-foreground leading-tight">
                                                                        {entry.task?.title || 'General Task'}
                                                                    </h5>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="shrink-0 px-2 py-1 bg-muted rounded text-[10px] font-bold flex items-center gap-1.5 border border-border">
                                                                        <Clock size={10} className="text-muted-foreground" /> 
                                                                        <span>{entry.start_at.substring(0,5)} - {entry.end_at.substring(0,5)}</span>
                                                                    </div>
                                                                    
                                                                    {entry.status !== 'revision' ? (
                                                                        <button 
                                                                            onClick={() => handleRejectEntry(entry.id)}
                                                                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all border border-transparent hover:border-red-500/20"
                                                                            title="Flag this entry for revision"
                                                                        >
                                                                            <Flag size={14} />
                                                                        </button>
                                                                    ) : (
                                                                        <div className="px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[9px] font-bold uppercase flex items-center gap-1">
                                                                            <AlertCircle size={10} /> Flagged
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground italic leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                                                                "{entry.description || 'No operational notes.'}"
                                                            </p>

                                                            {entry.status === 'revision' && entry.reject_reason && (
                                                                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2">
                                                                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block mb-1">Manager Note</span>
                                                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
                                                                            {entry.reject_reason}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-20 text-center text-muted-foreground flex flex-col items-center opacity-50">
                                        <Layers size={48} className="mb-4" />
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em]">No Log Data Found</p>
                                    </div>
                                )}
                            </div>

                            {/* --- PERBAIKAN FOOTER ACTION --- */}
                            <div className="p-6 border-t border-border bg-muted/30 flex items-center justify-between gap-4 shrink-0">
                                {hasFlaggedEntries ? (
                                    <div className="w-full flex flex-col items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                            <AlertTriangle size={12} /> Timesheet Flagged for Revision
                                        </span>
                                        <Button 
                                            className="w-full h-12 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                                            onClick={() => setIsSheetOpen(false)}
                                        >
                                            Return to Employee
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 h-12 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                                            onClick={handleReject}
                                            disabled={isProcessing}
                                        >
                                            <XCircle size={16} className="mr-2" /> Revise All
                                        </Button>
                                        <Button 
                                            className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                                            onClick={handleApprove}
                                            disabled={isProcessing}
                                        >
                                            <CheckCircle2 size={16} className="mr-2" /> Authorize & ACC
                                        </Button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}