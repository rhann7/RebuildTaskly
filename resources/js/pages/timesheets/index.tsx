import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Clock, Calendar as CalendarIcon, ListChecks, 
    BarChart3, History, LayoutGrid, Search 
} from 'lucide-react';
import { TimesheetHeader } from '@/layouts/timesheets/partials/timesheetsHeader';


export default function TimesheetIndex({ timesheets }: any) {
    // 1. State untuk mengatur view mana yang aktif
    const [currentView, setCurrentView] = useState<'audit' | 'calendar' | 'review' | 'analytics'>('audit');

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Timesheets', href: '/timesheets' },
    ];

    // 2. Siapkan data untuk dikirim ke ViewRenderer
    const renderData = {
        timeEntries: timesheets.data,
        calendarProps: { /* Data untuk kalender nanti */ },
        pendingLogs: timesheets.data.filter((l: any) => !l.is_verified), // Contoh filter
        // ... data lainnya
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Work Registry" />

            <div className="mx-auto w-full max-w-[1400px] p-6 md:p-10 space-y-10">
                
                {/* --- HEADER --- */}
                <TimesheetHeader 
                    title="Timesheet Dashboard" 
                    description="Monitoring your work hours and field performance data."
                    onAddEvent={() => console.log('Open Modal')} 
                    onExport={() => console.log('Exporting...')}
                />

                {/* --- VIEW SWITCHER (Tabs) --- */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex bg-muted/50 p-1.5 rounded-2xl gap-1">
                        <button 
                            onClick={() => setCurrentView('audit')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                            ${currentView === 'audit' ? 'bg-zinc-900 text-white shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            <ListChecks size={14} /> Audit
                        </button>
                        <button 
                            onClick={() => setCurrentView('calendar')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                            ${currentView === 'calendar' ? 'bg-zinc-900 text-white shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            <CalendarIcon size={14} /> Calendar
                        </button>
                        <button 
                            onClick={() => setCurrentView('review')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                            ${currentView === 'review' ? 'bg-zinc-900 text-white shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            <History size={14} /> Review
                        </button>
                        <button 
                            onClick={() => setCurrentView('analytics')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                            ${currentView === 'analytics' ? 'bg-zinc-900 text-white shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            <BarChart3 size={14} /> Analytics
                        </button>
                    </div>

                    {/* Search Bar Kecil */}
                    <div className="hidden md:flex relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input 
                            placeholder="SEARCH LOG..." 
                            className="h-10 pl-10 pr-4 bg-muted/30 border-border rounded-xl text-[10px] font-black uppercase focus:ring-sada-red/20 focus:border-sada-red w-64"
                        />
                    </div>
                </div>

                {/* --- RENDERER --- */}
                <div className="min-h-[600px]">
                    {/* <ViewRenderer currentView={currentView} data={renderData} /> */}
                </div>
            </div>
        </AppLayout>
    );
}