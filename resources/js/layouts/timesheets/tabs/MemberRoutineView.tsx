import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';
import { TimeGrid } from '@/components/timesheet/timegrid';
import { TimeEntryModal } from '@/components/timesheet/TimeEntryModals';
import { TimesheetMetrics } from '@/components/timesheet/TimesheetMetrics';
import { RoutineHeader } from '@/components/timesheet/RoutineHeader';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle } from 'lucide-react';

export default function MemberRoutineView({ timeEntries, projects, stats, currentDateProp }: any) {
    const [currentDate, setCurrentDate] = useState(dayjs(currentDateProp));
    const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
    
    // --- STATE UNTUK MODAL FULL (CREATE/EDIT DETAIL) ---
    const [isFullModalOpen, setIsFullModalOpen] = useState(false);
    
    // --- STATE UNTUK MODAL QUICK KONFIRMASI (DRAG & DROP) ---
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<any>(null);

    const { data, setData, post, patch, processing, reset, errors } = useForm({
        id: null as number | null, // Simpan ID kalau lagi edit
        project_id: '', 
        task_id: '',
        sub_task_id: '',
        date: '',
        start_time: '',
        end_time: '',
        description: '',
    });

    // --- NAVIGASI TANGGAL ---
    const navigateDate = (newDate: Date) => {
        const formattedDate = dayjs(newDate).format('YYYY-MM-DD');
        setCurrentDate(dayjs(newDate));

        router.get('/timesheets', 
            { date: formattedDate }, 
            { preserveState: true, preserveScroll: true }
        );
    };

    // --- 1. KLIK SLOT KOSONG DI GRID (BUAT BARU) ---
    const handleTimeSlotClick = (date: string, hour: number) => {
        reset(); // Bersihkan form
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

        setData({
            ...data,
            id: null, // Pastikan ID null karena ini data baru
            date: date,
            start_time: startTime,
            end_time: endTime,
        });
        setIsFullModalOpen(true);
    };

    // --- 2. KLIK KOTAK TUGAS DI GRID (EDIT FULL) ---
    const handleEntryClick = (entry: any) => {
        // Ambil data entry yang diklik dan masukkan ke form
        setData({
            id: entry.id,
            project_id: entry.project_id?.toString() || '',
            task_id: entry.task_id?.toString() || '',
            sub_task_id: entry.sub_task_id?.toString() || '',
            date: entry.date,
            start_time: entry.startTime,
            end_time: entry.endTime,
            description: entry.description || '',
        });
        setIsFullModalOpen(true);
    };

    // --- 3. SELESAI DRAG & DROP (TAMPILKAN KONFIRMASI) ---
    const handleEntryUpdate = (updatedEntry: any) => {
        setPendingUpdate(updatedEntry);
        setIsConfirmModalOpen(true); // Buka modal kecil, BUKAN modal full
    };

    // --- EKSEKUSI FORM FULL (CREATE ATAU UPDATE DETAIL) ---
    const submitFullEntry = () => {
        if (data.id) {
            // Jika ada ID, berarti mode UPDATE
            patch(`/timesheets/${data.id}`, {
                onSuccess: () => {
                    setIsFullModalOpen(false);
                    reset();
                },
                preserveScroll: true
            });
        } else {
            // Jika tidak ada ID, berarti mode CREATE
            post('/timesheets', {
                onSuccess: () => {
                    setIsFullModalOpen(false);
                    reset();
                },
                preserveScroll: true
            });
        }
    };

    // --- EKSEKUSI KONFIRMASI QUICK EDIT (HANYA JAM) ---
    const confirmTimeUpdate = () => {
        if (!pendingUpdate) return;
        
        router.patch(`/timesheets/${pendingUpdate.id}/time`, {
            start_time: pendingUpdate.startTime,
            end_time: pendingUpdate.endTime,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsConfirmModalOpen(false);
                setPendingUpdate(null);
            }
        });
    };

    return (
        <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
            <RoutineHeader
                viewMode={viewMode}
                setViewMode={setViewMode}
                currentDate={currentDate.toDate()}
                onPreviousWeek={() => navigateDate(currentDate.subtract(viewMode === "daily" ? 1 : 7, 'day').toDate())}
                onNextWeek={() => navigateDate(currentDate.add(viewMode === "daily" ? 1 : 7, 'day').toDate())}
                onToday={() => navigateDate(new Date())}
            />

            <TimesheetMetrics {...stats} />

            {/* --- GRID UTAMA --- */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border overflow-hidden shadow-xl">
                <TimeGrid
                    viewMode={viewMode} 
                    currentDate={new Date(currentDateProp)}
                    entries={timeEntries || []}
                    onTimeSlotClick={handleTimeSlotClick} // Memicu Modal Full (New)
                    onEntryClick={handleEntryClick}       // Memicu Modal Full (Edit)
                    onEntryUpdate={handleEntryUpdate}     // Memicu Modal Konfirmasi (Quick)
                />
            </div>

            {/* --- MODAL 1: FULL ENTRY (CREATE / EDIT) --- */}
            {/* Dipanggil HANYA SATU KALI di sini */}
            <TimeEntryModal
                isOpen={isFullModalOpen}
                setIsOpen={(open: boolean) => {
                    setIsFullModalOpen(open);
                    if (!open) reset(); // Reset form saat ditutup
                }}
                data={data}
                setData={setData}
                submitEntry={submitFullEntry} // Bisa Create, bisa Update
                projects={projects}
                errors={errors}
                processing={processing}
                isEditing={!!data.id} // Lempar props biar modal tau ini lagi edit atau buat baru
            />

            {/* --- MODAL 2: QUICK CONFIRMATION (DRAG & DROP) --- */}
            <Dialog open={isConfirmModalOpen} onOpenChange={(open) => {
                setIsConfirmModalOpen(open);
                if (!open) setPendingUpdate(null); 
            }}>
                <DialogContent className="sm:max-w-[420px] bg-card border border-border rounded-2xl p-0 shadow-2xl overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/20">
                        <DialogTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
                            <AlertTriangle size={18} className="text-amber-500" /> Modify Schedule?
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            You are about to modify the operational time for <strong className="text-foreground">"{pendingUpdate?.taskName}"</strong>.
                        </p>
                        
                        <div className="bg-muted/40 border border-border rounded-xl p-4 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">New Time Block</span>
                                <div className="flex items-center gap-2 text-foreground">
                                    <Clock size={14} className="text-sada-red" />
                                    <span className="font-mono font-bold text-lg">
                                        {pendingUpdate?.startTime} <span className="text-muted-foreground mx-1">-</span> {pendingUpdate?.endTime}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-4 border-t border-border bg-muted/10 gap-3">
                        <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)} className="rounded-lg text-xs font-bold">
                            Cancel
                        </Button>
                        <Button onClick={confirmTimeUpdate} className="rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-sada-red dark:hover:bg-sada-red text-xs font-bold transition-all shadow-lg">
                            Confirm Modification
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}