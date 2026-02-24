import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react'; // Tambah usePage buat ambil global props
import { useState } from 'react';
import {
    Clock, Calendar as CalendarIcon, ListChecks,
    BarChart3, History, Search, User
} from 'lucide-react';
import { TimesheetHeader } from '@/layouts/timesheets/partials/timesheetsHeader';
import { ViewRenderer } from '@/layouts/timesheets/parts/ViewRender';

export default function TimesheetIndex({ timesheets, projects, stats, currentDateProp, pendingLogs, pageConfig }: any) {
    // 1. Ambil auth dari usePage (Global Props) biar Sidebar dapet data Menu yang bener
    const { auth } = usePage<any>().props;

    const [currentView, setCurrentView] = useState<'audit' | 'calendar' | 'review' | 'analytics' | 'member'>('member');

    const isManager = auth.user.roles?.some((role: any) => {
        const roleName = typeof role === 'string' ? role : role.name;
        return ['company', 'manager', 'super-admin'].includes(roleName);
    }) || false;

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Timesheets', href: '/timesheets' },
    ];

    const tabStyle = (view: string) => `
        flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
        ${currentView === view
            ? 'bg-zinc-900 text-white shadow-lg shadow-black/20'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
    `;

    const entriesForGrid = (timesheets?.current?.entries || []).map((entry: any) => {
        const startAt = entry.start_at || "2026-01-01 00:00:00";
        const endAt = entry.end_at || "2026-01-01 00:00:00";

        return {
            id: entry.id,
            taskName: entry.task?.title || 'Untitled Task',
            date: startAt.split(' ')[0],
            startTime: startAt.includes(' ') ? startAt.split(' ')[1].substring(0, 5) : "00:00",
            endTime: endAt.includes(' ') ? endAt.split(' ')[1].substring(0, 5) : "00:00",
            status: entry.status || 'draft',
        };
    });

    return (
        // PANGGIL APPLAYOUT TANPA OPER AUTH MANUAL AGAR SIDEBAR TIDAK KOSONG
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Work Registry" />

            {/* Wrapper utama disamain lebarnya sama TeamIndex agar Sidebar aman */}
            <div className="mx-auto w-full flex flex-col gap-8 p-6 md:p-10 animate-in fade-in duration-700">

                {/* 1. Header Section */}
                <TimesheetHeader isManager={isManager} />

                {/* 2. Navigation & Content */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                        <div className="flex bg-muted/40 p-1 rounded-2xl gap-1 border border-border/50">
                            <button onClick={() => setCurrentView('member')} className={tabStyle('member')}>
                                <User size={14} strokeWidth={3} /> My Routine
                            </button>

                            <button onClick={() => setCurrentView('calendar')} className={tabStyle('calendar')}>
                                <CalendarIcon size={14} strokeWidth={3} /> Calendar
                            </button>

                            <button onClick={() => setCurrentView('audit')} className={tabStyle('audit')}>
                                <ListChecks size={14} strokeWidth={3} /> Audit
                            </button>

                            {isManager && (
                                <>
                                    <div className="w-[1px] h-4 bg-border mx-1 self-center" />
                                    <button onClick={() => setCurrentView('review')} className={tabStyle('review')}>
                                        <History size={14} strokeWidth={3} /> Team Review
                                    </button>
                                    <button onClick={() => setCurrentView('analytics')} className={tabStyle('analytics')}>
                                        <BarChart3 size={14} strokeWidth={3} /> Analytics
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 3. Renderer Area */}
                    <div className="relative min-h-[400px] w-full">
                        <div className="relative min-h-[400px] w-full">
                            <ViewRenderer
                                currentView={currentView}
                                data={{
                                    task: timesheets?.current || [],
                                    timeEntries: timesheets?.mapped || [],
                                    projects: projects,
                                    stats: stats,
                                    currentDate: currentDateProp,

                                    isManager: isManager,

                                    taskData: timesheets?.current || [],

                                    history: timesheets?.history,
                                    pendingLogs: pendingLogs,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}