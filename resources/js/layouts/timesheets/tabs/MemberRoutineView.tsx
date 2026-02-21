import React, { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import dayjs from 'dayjs'; //npm install dayjs
import { TimeGrid } from '@/components/timesheet/timegrid';
import { TimeEntryModal } from '@/components/timesheet/TimeEntryModals';
import { TimesheetMetrics } from '@/components/timesheet/TimesheetMetrics';
import { RoutineHeader } from '@/components/timesheet/RoutineHeader';

// resources/js/pages/timesheets/index.tsx
export default function MemberRoutineView({ timeEntries, tasks, workspace, stats, currentDateProp }: any) {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [viewMode, setViewMode] = useState<"daily" | "weekly">("weekly");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors  } = useForm({
        task_id: '',
        sub_task_id: '',
        date: '',
        start_time: '',
        end_time: '',
        description: '',
        workspace_id: workspace?.id,
    });

    const navigateDate = (newDate: Date) => {
        setCurrentDate(dayjs(newDate));
        router.get(('timesheets.index'),
            { date: dayjs(newDate).format('YYYY-MM-DD') },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handlePrevious = () => {
        const offset = viewMode === "daily" ? 1 : 7;
        const newDate = dayjs(currentDate).subtract(offset, 'day').toDate();
        navigateDate(newDate);
    };

    const handleNext = () => {
        const offset = viewMode === "daily" ? 1 : 7;
        const newDate = dayjs(currentDate).add(offset, 'day').toDate();
        navigateDate(newDate);
    };

    const handleToday = () => {
        navigateDate(new Date());
    };
    const handleTimeSlotClick = (date: string, hour: number) => {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

        setData({
            ...data,
            date: date, // YYYY-MM-DD
            start_time: startTime,
            end_time: endTime,
            workspace_id: workspace?.id // Pastikan workspace_id terisi
        });
        setIsModalOpen(true);
    };

    const submitEntry = () => {
        // Perbaikan: gunakan helper route() dan pastikan sintaks post benar
        post(('timesheets.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset('task_id', 'sub_task_id',); // Reset field input saja
            },
        });
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header, Grid, dll sama seperti sebelumnya */}

            <RoutineHeader
                viewMode={viewMode}
                setViewMode={setViewMode}
                currentDate={currentDate.toDate()}
                onPreviousWeek={handlePrevious}
                onNextWeek={handleNext}
                onToday={handleToday}
            />
            {/* 2. STATS SECTION (KOMPONEN BARU KAMU) */}
            <TimesheetMetrics
                totalHoursWeek={timeEntries?.total_hours_week || 0}
                approvedHours={timeEntries?.approved_hours || 0}
                pendingHours={timeEntries?.pending_hours || 0}
                draftHours={timeEntries?.draft_hours || 0}
            />

            <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border overflow-hidden shadow-xl">
                <TimeGrid
                    viewMode={viewMode}
                    currentDate={currentDate.toDate()}
                    entries={timeEntries?.data || []} // Sesuaikan dengan format data dari controller
                    onTimeSlotClick={handleTimeSlotClick}
                    onEntryClick={(entry: any) => console.log(entry)}
                />
            </div>

            <TimeEntryModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                data={data}
                setData={setData}
                submitEntry={submitEntry}
                tasks={tasks} // Lempar list tasks ke modal
            />
        </div>
    );
}   