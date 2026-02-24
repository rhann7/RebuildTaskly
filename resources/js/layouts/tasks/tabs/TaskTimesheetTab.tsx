import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import {
    Clock, Plus, Activity, Calendar as CalendarIcon,
    CheckCircle2, Timer, AlertCircle, Shield,
    Eye, FileText, CornerDownRight, UploadCloud, Trash2, CheckSquare,
    Paperclip, ExternalLink, Pencil // Tambahan Icon Pencil
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Props {
    task: any;
    isManager?: boolean;
    auth?: any; // Disarankan pass data user login untuk mengecek kepemilikan log
}

export const TaskTimesheetTab = ({ task, isManager, auth }: Props) => {
    // State UI
    const [isLogging, setIsLogging] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(false); // Mode Edit
    const [editingLogId, setEditingLogId] = useState<number | null>(null); // ID log yang lagi diedit

    // Form Khusus untuk Task Ini
    const { data: logData, setData: setLogData, post, processing, errors, reset } = useForm({
        project_id: task.project_id,
        task_id: task.id,
        sub_task_id: null,
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        description: '',
        attachments: [] as File[],          // Untuk file baru (jika support multiple)
        existing_attachments: [] as string[], // Untuk file lama
        attachment: null as any             // Buat kompatibilitas single file jika diperlukan
    });

    // State untuk panel geser (Sheet Manager)
    const [selectedLog, setSelectedLog] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
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

    // --- FUNGSI MENGISI FORM SAAT TOMBOL EDIT DIKLIK ---
    const handleEditLog = (entry: any) => {
        // Parse data file dengan aman
        let parsedAttachments: string[] = [];
        if (entry.attachment) {
            try {
                const parsed = JSON.parse(entry.attachment);
                parsedAttachments = Array.isArray(parsed) ? parsed : [entry.attachment];
            } catch (e) {
                parsedAttachments = [entry.attachment];
            }
        }

        setLogData({
            project_id: entry.project_id || task.project_id,
            task_id: entry.task_id || task.id,
            sub_task_id: entry.sub_task_id || null,
            date: entry.date,
            start_time: entry.start_at?.substring(0, 5) || '09:00',
            end_time: entry.end_at?.substring(0, 5) || '10:00',
            description: entry.description || '',
            attachments: [], 
            existing_attachments: parsedAttachments, 
            attachment: null
        } as any);

        setEditingLogId(entry.id);
        setIsEditingMode(true);
        setIsLogging(true);
        
        // Tutup inspect panel kalau lagi kebuka
        setIsSheetOpen(false); 
    };

   const handleLogWorkSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditingMode && editingLogId) {
            // JALUR UPDATE: Gunakan router.post agar kita bisa memodifikasi data (menambah _method)
            router.post(`/timesheets/${editingLogId}`, {
                ...logData,
                _method: 'patch', // Data tambahan
            }, {
                forceFormData: true, // Options ditaruh di parameter ke-3
                preserveScroll: true,
                onSuccess: () => {
                    setIsLogging(false);
                    setIsEditingMode(false);
                    setEditingLogId(null);
                    reset();
                },
            });
        } else {
            // JALUR CREATE BARU: Bisa pakai post bawaan useForm karena datanya nggak perlu dimodif
            post('/timesheets', {
                preserveScroll: true,
                forceFormData: true, // Options ditaruh di parameter ke-2
                onSuccess: () => {
                    setIsLogging(false);
                    reset();
                },
            });
        }
    };

    // Buka panel detail (Manager/Inspect)
    const openLogDetails = (log: any) => {
        setSelectedLog(log);
        setIsRejecting(false);
        setRejectReason("");
        setIsSheetOpen(true);
    };

    // Aksi Manager
    const handleApproveEntry = (id: number) => {
        router.patch(`/timesheets/entries/${id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => setIsSheetOpen(false)
        });
    };

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

    // Batal ngisi log
    const cancelLogging = () => {
        setIsLogging(false);
        setIsEditingMode(false);
        setEditingLogId(null);
        reset();
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
            {/* --- KIRI: LIST LOGS & FORM --- */}
            <div className="lg:col-span-2 flex flex-col gap-8">
                <div className="flex justify-between items-center px-2">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                            <Activity size={16} className="text-sada-red" />
                            Operation Logs
                        </h3>
                    </div>

                    {!isManager && !isLogging && (
                        <button
                            onClick={() => {
                                reset(); // Pastikan form bersih saat mau nambah baru
                                setIsEditingMode(false);
                                setEditingLogId(null);
                                setIsLogging(true);
                            }}
                            className="h-10 px-6 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-sada-red dark:hover:bg-sada-red dark:hover:text-white transition-all shadow-lg"
                        >
                            <Plus size={14} strokeWidth={3} /> Log My Work
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-8">
                    {/* --- INLINE FORM (CREATE / EDIT) --- */}
                    {isLogging && (
                        <form onSubmit={handleLogWorkSubmit} className={`bg-muted/10 border p-6 sm:p-8 rounded-[32px] flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden ${isEditingMode ? 'border-amber-500/50' : 'border-sada-red/30'}`}>
                            {/* Dekorasi Background */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <Clock size={150} />
                            </div>

                            <div className="flex items-start justify-between border-b border-border/50 pb-5 relative z-10">
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                                        {isEditingMode ? <Pencil size={16} className="text-amber-500" /> : <Plus size={16} className="text-sada-red" />} 
                                        {isEditingMode ? 'Modify Operational Log' : 'Log Operational Time'}
                                    </h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                        Target: <span className={isEditingMode ? "text-amber-500" : "text-sada-red"}>{task.title}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</label>
                                    <input
                                        type="date"
                                        value={logData.date}
                                        onChange={e => setLogData('date', e.target.value)}
                                        className="w-full bg-background border border-border p-3 rounded-xl text-xs font-bold outline-none focus:border-sada-red transition-colors"
                                    />
                                    {errors.date && <p className="text-[9px] text-sada-red uppercase">{errors.date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Time</label>
                                    <input
                                        type="time"
                                        value={logData.start_time}
                                        onChange={e => setLogData('start_time', e.target.value)}
                                        className="w-full bg-background border border-border p-3 rounded-xl text-xs font-bold outline-none focus:border-sada-red transition-colors"
                                    />
                                    {errors.start_time && <p className="text-[9px] text-sada-red uppercase">{errors.start_time}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End Time</label>
                                    <input
                                        type="time"
                                        value={logData.end_time}
                                        onChange={e => setLogData('end_time', e.target.value)}
                                        className="w-full bg-background border border-border p-3 rounded-xl text-xs font-bold outline-none focus:border-sada-red transition-colors"
                                    />
                                    {errors.end_time && <p className="text-[9px] text-sada-red uppercase">{errors.end_time}</p>}
                                </div>
                            </div>

                            <div className="space-y-2 relative z-10">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Activity Notes</label>
                                <textarea
                                    value={logData.description}
                                    onChange={e => setLogData('description', e.target.value)}
                                    placeholder="Detail what you accomplished..."
                                    className="w-full bg-background border border-border p-4 rounded-xl text-xs font-medium outline-none focus:border-sada-red min-h-[100px] resize-none transition-colors"
                                />
                                {errors.description && <p className="text-[9px] text-sada-red uppercase">{errors.description}</p>}
                            </div>

                            {/* --- UPLOAD ASSET / EVIDENCE DI INLINE FORM --- */}
                            <div className="space-y-4 relative z-10">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Proof of Work (Optional)</label>

                                <div className="group relative border-2 border-dashed border-border rounded-2xl p-6 hover:border-sada-red/50 transition-all flex flex-col items-center justify-center cursor-pointer bg-background hover:bg-sada-red/5">
                                    <input
                                        type="file"
                                        multiple
                                        accept=".jpg,.jpeg,.png,.pdf,.zip"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                const newFiles = Array.from(e.target.files);
                                                const existing = logData.attachments || [];
                                                setLogData('attachments', [...existing, ...newFiles] as any);
                                            }
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <UploadCloud size={20} className="text-muted-foreground group-hover:text-sada-red transition-colors mb-2" />
                                    <p className="text-[10px] font-black uppercase text-foreground tracking-widest">Attach Files</p>
                                </div>

                                {/* LIST FILE LAMA (Saat Edit) */}
                                {isEditingMode && logData.existing_attachments && logData.existing_attachments.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Saved in Vault</span>
                                        {logData.existing_attachments.map((path: string, idx: number) => (
                                            <div key={`old-${idx}`} className="p-3 border border-border bg-card rounded-xl flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="size-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-[10px] font-black text-foreground uppercase tracking-widest truncate">{path.split('/').pop()}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newExisting = [...logData.existing_attachments];
                                                        newExisting.splice(idx, 1);
                                                        setLogData('existing_attachments', newExisting);
                                                    }}
                                                    className="p-1.5 bg-muted hover:bg-red-500 hover:text-white text-muted-foreground rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* LIST FILE BARU */}
                                {logData.attachments && logData.attachments.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">New Uploads</span>
                                        {logData.attachments.map((file: any, idx: number) => (
                                            <div key={`new-${idx}`} className="p-3 border border-sada-red/30 bg-sada-red/5 rounded-xl flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="size-8 rounded-lg bg-sada-red/10 flex items-center justify-center text-sada-red border border-sada-red/20 shrink-0">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-[10px] font-black text-foreground uppercase tracking-widest truncate">{file.name}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newArr = [...logData.attachments];
                                                        newArr.splice(idx, 1);
                                                        setLogData('attachments', newArr as any);
                                                    }}
                                                    className="p-1.5 bg-background hover:bg-red-500 hover:text-white border border-border text-muted-foreground rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border/50 relative z-10">
                                <button type="button" onClick={cancelLogging} className="px-6 py-3 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className={`px-8 py-3 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center gap-2 ${isEditingMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-zinc-900 hover:bg-sada-red'}`}>
                                    {processing ? 'Transmitting...' : (isEditingMode ? 'Save Changes' : 'Submit Log')}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* --- HISTORY LOGS --- */}
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

                                                        {/* Icon penanda kalau dia nge-attach file */}
                                                        {entry.attachment && entry.attachment !== "[]" && (
                                                            <Paperclip size={10} className="text-sada-red" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* TOMBOL EDIT KHUSUS MEMBER (Kalau statusnya DRAFT/REVISION) */}
                                                {!isManager && (entry.status === 'draft' || entry.status === 'revision') && (
                                                    <button
                                                        onClick={() => handleEditLog(entry)}
                                                        className="size-8 flex items-center justify-center bg-muted hover:bg-amber-500 hover:text-white text-muted-foreground rounded-lg transition-all"
                                                        title="Edit Log"
                                                    >
                                                        <Pencil size={12} />
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => openLogDetails(entry)}
                                                    className="h-8 px-4 bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-800 text-foreground rounded-lg flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    <Eye size={12} /> Inspect
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        !isLogging && (
                            <div className="py-10 text-center opacity-40 border-2 border-dashed border-border rounded-3xl">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No activity detected</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* --- KANAN: SUMMARY --- */}
            <div className="lg:col-span-1 flex flex-col gap-6 sticky top-6">
                <div className="bg-zinc-900 text-white rounded-[32px] p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Clock size={120} />
                    </div>

                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-sada-red uppercase tracking-[0.2em] italic mb-1 block">Total Consumed</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black italic tracking-tighter">
                                {logs.reduce((sum: number, e: any) => sum + parseFloat(e.hours), 0).toFixed(1)}
                            </span>
                            <span className="text-sm font-bold uppercase opacity-50">Hours</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex flex-col gap-4 relative z-10">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Operatives Active</span>
                            <span className="text-xs font-black">{new Set(logs.map((e: any) => e.user_id)).size} Pax</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Avg. Daily Output</span>
                            <span className="text-xs font-black">
                                {logs.length > 0 ? (logs.reduce((sum: number, e: any) => sum + parseFloat(e.hours), 0) / sortedDates.length).toFixed(1) : 0} H/Day
                            </span>
                        </div>
                    </div>
                </div>
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

                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Operational Notes</label>
                                    <p className="text-xs text-foreground bg-muted/20 p-4 rounded-xl border border-border/50 italic leading-relaxed whitespace-pre-wrap">
                                        {selectedLog.description}
                                    </p>
                                </div>

                                {/* NAMPILIN ATTACHMENT DI DETAIL */}
                                {selectedLog.attachment && selectedLog.attachment !== "[]" && (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Attached Evidence</label>
                                        <div className="flex flex-col gap-2">
                                            {(Array.isArray(JSON.parse(selectedLog.attachment || '[]')) 
                                                ? JSON.parse(selectedLog.attachment) 
                                                : [selectedLog.attachment]
                                            ).map((path: string, idx: number) => (
                                                <a 
                                                    key={idx}
                                                    href={`/storage/${path}`} 
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-sada-red/30 hover:bg-muted/50 transition-colors group bg-card"
                                                >
                                                    <div className="size-10 bg-muted border border-border rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-sada-red transition-colors">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div className="flex flex-col flex-1 overflow-hidden">
                                                        <span className="text-[11px] font-bold text-foreground truncate">
                                                            {path.split('/').pop()}
                                                        </span>
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase group-hover:text-sada-red transition-colors">
                                                            Click to open
                                                        </span>
                                                    </div>
                                                    <ExternalLink size={14} className="text-muted-foreground group-hover:text-sada-red mr-2 transition-colors" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                                <button onClick={() => setIsRejecting(false)} className="flex-1 py-2 text-[10px] font-black uppercase text-muted-foreground bg-muted rounded-xl hover:bg-zinc-200 transition-colors">
                                                    Cancel
                                                </button>
                                                <button onClick={() => handleRejectEntry(selectedLog.id)} className="flex-1 py-2 text-[10px] font-black uppercase bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors">
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
                                                className="flex-1 py-3 text-[10px] font-black uppercase bg-emerald-500 text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all flex justify-center items-center gap-2"
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