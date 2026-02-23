import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Send, Eye, Clock, CheckCircle2, AlertCircle, FileEdit, CalendarDays, Layers, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function MemberLogsTab({ history }: { history: any }) {
    const [selectedTimesheet, setSelectedTimesheet] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleSubmit = (id: number) => {
        if (confirm("Are you sure you want to submit this timesheet for review? You won't be able to edit it unless rejected.")) {
            router.patch(`/timesheets/${id}/submit`, {}, { preserveScroll: true });
        }
    };

    const openDetails = (timesheet: any) => {
        setSelectedTimesheet(timesheet);
        setIsSheetOpen(true);
    };

    const getStatusUI = (status: string) => {
        switch (status) {
            case 'draft': return { color: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:border-white/10', icon: FileEdit, label: 'DRAFT' };
            case 'submitted': return { color: 'text-amber-600 bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'PENDING REVIEW' };
            case 'approved': return { color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'APPROVED' };
            case 'revision': return { color: 'text-red-600 bg-red-500/10 border-red-500/20', icon: AlertCircle, label: 'REVISION REQUIRED' };
            default: return { color: 'text-zinc-500 bg-zinc-100', icon: Clock, label: status };
        }
    };

    // Fungsi Grouping per Hari
    const groupedEntries = selectedTimesheet?.entries?.reduce((acc: any, entry: any) => {
        const date = entry.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
    }, {});

    const sortedDates = groupedEntries ? Object.keys(groupedEntries).sort() : [];

    // --- FUNGSI BARU: DETEKSI OVERLAP (MULTITASKING) ---
    const checkOverlap = (dayEntries: any[]) => {
        if (!dayEntries || dayEntries.length < 2) return false;
        // Urutkan berdasarkan jam mulai
        const sorted = [...dayEntries].sort((a, b) => a.start_at.substring(0, 5).localeCompare(b.start_at.substring(0, 5)));
        for (let i = 0; i < sorted.length - 1; i++) {
            // Jika jam selesai tugas ke-1 LEBIH BESAR dari jam mulai tugas ke-2, berarti tabrakan!
            if (sorted[i].end_at.substring(0, 5) > sorted[i + 1].start_at.substring(0, 5)) {
                return true;
            }
        }
        return false;
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {history?.data?.length > 0 ? (
                    history.data.map((timesheet: any, i: number) => {
                        const statusUI = getStatusUI(timesheet.status);
                        const StatusIcon = statusUI.icon;

                        return (
                            <div key={timesheet.id}
                                className="p-6 border border-border rounded-[24px] bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-sada-red/30 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm hover:shadow-md"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="size-14 shrink-0 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-sada-red transition-colors border border-border">
                                        <CalendarDays size={24} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-foreground">
                                            {new Date(timesheet.start_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — {new Date(timesheet.end_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-muted-foreground">
                                            <span>Total Logged: <span className="text-foreground">{timesheet.total_hours} hrs</span></span>
                                            <span className="hidden sm:block w-1 h-1 bg-border rounded-full" />
                                            <div className={`px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-widest flex items-center gap-1 border ${statusUI.color}`}>
                                                <StatusIcon size={10} /> {statusUI.label}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Button variant="outline" className="flex-1 sm:flex-none rounded-xl h-10 text-[10px] font-black uppercase tracking-widest" onClick={() => openDetails(timesheet)}>
                                        <Eye size={14} className="mr-2" /> Details
                                    </Button>

                                    {(timesheet.status === 'draft' || timesheet.status === 'revision') && (
                                        <Button
                                            onClick={() => handleSubmit(timesheet.id)}
                                            className="flex-1 sm:flex-none rounded-xl h-10 bg-zinc-900 dark:bg-white dark:text-black text-white hover:bg-sada-red dark:hover:bg-sada-red dark:hover:text-white shadow-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            <Send size={14} className="mr-2" /> Submit
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[32px] bg-muted/10 opacity-60">
                        <Clock size={48} className="mb-4 text-muted-foreground" />
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">No Logs Found</p>
                    </div>
                )}
            </div>

            {/* SHEET DETAILS PER HARI */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto border-l-border bg-card p-0 flex flex-col">
                    {selectedTimesheet && (
                        <>
                            <div className="p-8 border-b border-border bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
                                <SheetHeader>
                                    <SheetTitle className="text-2xl font-black uppercase tracking-tighter text-foreground flex items-center gap-3">
                                        Operational Details
                                    </SheetTitle>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        PERIOD: <span className="text-foreground">{selectedTimesheet.start_at} — {selectedTimesheet.end_at}</span>
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

                                        // Panggil fungsi cek overlap
                                        const isOverlapping = checkOverlap(dayEntries);

                                        return (
                                            <div key={date} className="relative animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                                {/* Header Hari */}
                                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <div className="size-8 rounded-full bg-sada-red/10 text-sada-red flex items-center justify-center border border-sada-red/20">
                                                            <CalendarIcon size={14} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">{dayName}</h4>
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formattedDate}</span>
                                                        </div>
                                                        {/* --- BADGE MULTITASKING --- */}
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

                                                {/* Daftar Task Hari Tersebut */}
                                                <div className="space-y-3 pl-4 border-l-2 border-muted ml-4">
                                                    {dayEntries.map((entry: any) => (
                                                        <div key={entry.id} className={`p-4 border rounded-2xl transition-colors ${entry.status === 'revision' ? 'bg-red-500/5 border-red-500/30' : 'bg-background border-border hover:border-sada-red/30'}`}>
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex-1 pr-4">
                                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sada-red mb-1">
                                                                        {entry.project?.name || 'Unassigned Project'}
                                                                    </p>
                                                                    <h5 className="text-[13px] font-bold text-foreground leading-tight">
                                                                        {entry.task?.title || 'General Task'}
                                                                    </h5>
                                                                </div>
                                                                <div className="shrink-0 px-2 py-1 bg-muted rounded text-[10px] font-bold flex items-center gap-1.5 border border-border">
                                                                    <Clock size={10} className="text-muted-foreground" />
                                                                    <span>{entry.start_at.substring(0, 5)} - {entry.end_at.substring(0, 5)}</span>
                                                                </div>
                                                            </div>

                                                            <p className="text-xs text-muted-foreground italic leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                                                                "{entry.description || 'No operational notes provided.'}"
                                                            </p>

                                                            {/* INFO JIKA DI-REJECT MANAGER */}
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
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em]">No Detailed Logs Recorded</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}