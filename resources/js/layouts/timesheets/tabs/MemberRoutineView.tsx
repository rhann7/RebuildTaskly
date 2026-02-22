import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import dayjs from 'dayjs';
import { TimeGrid } from '@/components/timesheet/timegrid';
import { TimeEntryModal } from '@/components/timesheet/TimeEntryModals';
import { TimesheetMetrics } from '@/components/timesheet/TimesheetMetrics';
import { RoutineHeader } from '@/components/timesheet/RoutineHeader';

// Tambahkan prop 'projects' sesuai controller terbaru
export default function MemberRoutineView({ timeEntries, projects, stats, currentDateProp }: any) {
    // Gunakan currentDateProp dari Laravel agar state sinkron saat refresh
    const [currentDate, setCurrentDate] = useState(dayjs(currentDateProp));
    const [viewMode, setViewMode] = useState<"daily" | "weekly">("weekly");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        project_id: '', // Tambahkan ini karena kita pakai project global
        task_id: '',
        sub_task_id: '',
        date: '',
        start_time: '',
        end_time: '',
        description: '',
    });

    const navigateDate = (newDate: Date) => {
        const formattedDate = dayjs(newDate).format('YYYY-MM-DD');
        setCurrentDate(dayjs(newDate));

        // Perbaikan: Gunakan route() helper
        router.get(('timesheets.index'),
            { date: formattedDate },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Handler Navigasi
    const handlePrevious = () => {
        const newDate = currentDate.subtract(viewMode === "daily" ? 1 : 7, 'day').toDate();
        navigateDate(newDate);
    };

    const handleNext = () => {
        const newDate = currentDate.add(viewMode === "daily" ? 1 : 7, 'day').toDate();
        navigateDate(newDate);
    };

    const handleTimeSlotClick = (date: string, hour: number) => {
        reset(); // Bersihkan form lama
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

        setData({
            ...data,
            date: date,
            start_time: startTime,
            end_time: endTime,
        });
        setIsModalOpen(true);
    };

    const submitEntry = () => {
        post(('timesheets.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    return (
        <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
            <RoutineHeader
                viewMode={viewMode}
                setViewMode={setViewMode}
                currentDate={currentDate.toDate()}
                onPreviousWeek={handlePrevious}
                onNextWeek={handleNext}
                onToday={() => navigateDate(new Date())}
            />

            <TimesheetMetrics
                totalHoursWeek={stats.totalHoursWeek}
                approvedHours={stats.approvedHours}
                pendingHours={stats.pendingHours}
                draftHours={stats.draftHours}
            />

            <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border overflow-hidden shadow-xl">
                <TimeGrid
                    viewMode={viewMode}
                    currentDate={currentDate.toDate()}
                    entries={timeEntries?.data || []}
                    onTimeSlotClick={handleTimeSlotClick}
                    onEntryClick={(entry: any) => console.log("Edit Entry:", entry)}
                />
            </div>

            <TimeEntryModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                data={data}
                setData={setData}
                submitEntry={submitEntry}
                projects={projects} // Kirim 'projects' bukan 'tasks'
                errors={errors}
                processing={processing}
            />
        </div>
    );
}