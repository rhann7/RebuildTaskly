import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Send, Eye, Clock, CheckCircle2, AlertCircle, FileEdit, CalendarDays, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function MemberLogsTab({ history }: { history: any }) {
    const [selectedTimesheet, setSelectedTimesheet] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleSubmit = (id: number) => {
        if (confirm("Are you sure you want to submit this timesheet for review? You won't be able to edit it unless rejected.")) {
            router.patch(`/timesheets/${id}/submit`, {}, {
                preserveScroll: true
            });
        }
    };

    const openDetails = (timesheet: any) => {
        setSelectedTimesheet(timesheet);
        setIsSheetOpen(true);
    };

    const getStatusUI = (status: string) => {
        switch (status) {
            case 'draft': return { color: 'text-zinc-500 bg-zinc-100', icon: FileEdit, label: 'DRAFT' };
            case 'submitted': return { color: 'text-amber-600 bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'PENDING REVIEW' };
            case 'approved': return { color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'APPROVED' };
            case 'revision': return { color: 'text-red-600 bg-red-500/10 border-red-500/20', icon: AlertCircle, label: 'REVISION REQUIRED' };
            default: return { color: 'text-zinc-500 bg-zinc-100', icon: Clock, label: status };
        }
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
                                className="p-6 border border-border rounded-[24px] bg-white dark:bg-zinc-900/40 flex items-center justify-between group hover:border-sada-red/30 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="size-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-sada-red transition-colors">
                                        <CalendarDays size={24} />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-foreground">
                                            Week of {new Date(timesheet.start_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </h4>
                                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                                            <span>Total Hours: <span className="text-foreground">{timesheet.total_hours} hrs</span></span>
                                            <span className="w-1 h-1 bg-border rounded-full" />
                                            <div className={`px-2.5 py-0.5 rounded-md text-[9px] uppercase tracking-widest flex items-center gap-1 border ${statusUI.color}`}>
                                                <StatusIcon size={10} /> {statusUI.label}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        className="rounded-xl h-10 text-xs font-bold"
                                        onClick={() => openDetails(timesheet)}
                                    >
                                        <Eye size={14} className="mr-2" /> Details
                                    </Button>

                                    {(timesheet.status === 'draft' || timesheet.status === 'revision') && (
                                        <Button
                                            onClick={() => handleSubmit(timesheet.id)}
                                            className="rounded-xl h-10 bg-zinc-900 text-white hover:bg-sada-red shadow-lg text-xs font-black uppercase tracking-widest"
                                        >
                                            <Send size={14} className="mr-2" /> Submit Entry
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[32px] opacity-50">
                        <Clock size={48} className="mb-4 text-muted-foreground" />
                        <p className="text-sm font-black uppercase tracking-widest">No Logs Found</p>
                    </div>
                )}
            </div>

            {/* SLIDE-OUT PANEL UNTUK MELIHAT DETAIL TIMESHEET */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto border-l-border bg-white dark:bg-zinc-950 p-0 flex flex-col">
                    {selectedTimesheet && (
                        <>
                            <div className="p-8 border-b border-border bg-muted/10">
                                <SheetHeader>
                                    <SheetTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                        Timesheet Log Details
                                    </SheetTitle>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        PERIOD: <span className="text-foreground">{selectedTimesheet.start_at} - {selectedTimesheet.end_at}</span>
                                    </p>
                                </SheetHeader>
                            </div>

                            <div className="flex-1 p-8 overflow-y-auto space-y-4">
                                {selectedTimesheet.entries && selectedTimesheet.entries.length > 0 ? (
                                    selectedTimesheet.entries.map((entry: any, i: number) => (
                                        <div key={entry.id} className="p-5 border border-border rounded-2xl bg-card">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-sada-red mb-1">
                                                        {entry.project?.name || 'Unknown Project'}
                                                    </p>
                                                    <h5 className="text-sm font-bold text-foreground">
                                                        {entry.task?.title || entry.description}
                                                    </h5>
                                                </div>
                                                <div className="px-3 py-1 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                    <Clock size={12} /> {entry.hours}h
                                                </div>
                                            </div>

                                            <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/50">
                                                <span className="font-bold text-foreground">Time:</span> {entry.start_at} - {entry.end_at} <br />
                                                <span className="font-bold text-foreground mt-1 inline-block">Note:</span> {entry.description}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center text-muted-foreground flex flex-col items-center">
                                        <Layers size={32} className="mb-3 opacity-30" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No detailed logs recorded</p>
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