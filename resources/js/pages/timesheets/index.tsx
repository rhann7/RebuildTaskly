import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Clock, Calendar as CalendarIcon, ListChecks,
    BarChart3, History, Search, User
} from 'lucide-react';
import { TimesheetHeader } from '@/layouts/timesheets/partials/timesheetsHeader';
import { ViewRenderer } from '@/layouts/timesheets/parts/ViewRender';

export default function TimesheetIndex({ timesheets, auth, projects, stats, currentDateProp }: any) {
    const [currentView, setCurrentView] = useState<'audit' | 'calendar' | 'review' | 'analytics' | 'member'>('member'); // Default ke member biar langsung kelihatan routine-nya

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
        // Kita tambahkan pengecekan string untuk start_at dan end_at
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Work Registry" />
            <div className="mx-auto w-full max-w-[1400px] p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
                {/* 1. Header Section */}
                <TimesheetHeader
                    isManager={isManager}
                />

                {/* 2. Navigation & Content Container (Dibungkus satu kesatuan biar gak jauh-jauh) */}
                <div className="flex flex-col gap-6">
                    {/* --- TABS SYSTEM --- */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                        <div className="flex bg-muted/40 p-1 rounded-2xl gap-1 border border-border/50">
                            {/* Tab yang bisa dilihat semua orang */}
                            <button onClick={() => setCurrentView('member')} className={tabStyle('member')}>
                                <User size={14} strokeWidth={3} /> My Routine
                            </button>

                            <button onClick={() => setCurrentView('calendar')} className={tabStyle('calendar')}>
                                <CalendarIcon size={14} strokeWidth={3} /> Calendar
                            </button>

                            <button onClick={() => setCurrentView('audit')} className={tabStyle('audit')}>
                                <ListChecks size={14} strokeWidth={3} /> Audit
                            </button>

                            {/* Tab Terlarang buat Member */}
                            {isManager && (
                                <>
                                    <div className="w-[1px] h-4 bg-border mx-1 self-center" /> {/* Divider kecil */}
                                    <button onClick={() => setCurrentView('review')} className={tabStyle('review')}>
                                        <History size={14} strokeWidth={3} /> Team Review
                                    </button>
                                    <button onClick={() => setCurrentView('analytics')} className={tabStyle('analytics')}>
                                        <BarChart3 size={14} strokeWidth={3} /> Analytics
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Search Bar - Hidden on mobile biar gak sumpek */}
                        {/* <div className="hidden lg:flex relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                placeholder="Search logs..."
                                className="h-10 pl-10 pr-4 bg-muted/20 border-border rounded-xl text-[10px] font-black uppercase focus:ring-2 focus:ring-sada-red/20 w-48 transition-all focus:w-64"
                            />
                        </div> */}
                    </div>

                    {/* --- RENDERER AREA (Langsung nempel di bawah tab) --- */}
                    <div className="relative min-h-[400px] w-full">
                        <ViewRenderer
                            currentView={currentView}
                            data={{
                                timeEntries: entriesForGrid, // KIRIM ARRAY YANG SUDAH DIFORMAT
                                rawTimesheets: timesheets,   // Tetap simpan yang mentah kalau butuh pagination di view Audit
                                projects: projects,
                                stats: stats,            // Oper stats mingguan
                                currentDateProp: currentDateProp, // Oper tanggal dari server
                                isManager: isManager,
                            }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}