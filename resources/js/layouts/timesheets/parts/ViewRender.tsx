import React from 'react';
import {
    BarChart3, Loader2, ShieldCheck, Activity,
    Calendar as CalendarIcon, Database, Terminal,
    AlertCircle, Layers
} from 'lucide-react';
import MemberRoutineView from '../tabs/MemberRoutineView';
import { ManagerReviewTab } from '../tabs/ManagerReviewTab';
import { MemberLogsTab } from '../tabs/MemberLogsTab';

// 1. Shared Layout: Container untuk setiap view agar tingginya seragam dan rapi
const ViewContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both ${className}`}>
        {children}
    </div>
);

// 2. Shared Component: Section Header yang lebih bold
const SectionHeader = ({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string | number }) => (
    <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-black uppercase text-foreground leading-none">
                {title}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-80">
                {subtitle}
            </p>
        </div>
        {badge !== undefined && (
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/50 border border-border px-4 py-2 rounded-xl animate-in zoom-in duration-500">
                <Terminal size={12} className="text-sada-red" />
                <span className="text-[10px] font-black  text-muted-foreground">
                    {badge} LOGS DETECTED
                </span>
            </div>
        )}
    </div>
);

// 3. Shared Component: Placeholder/Standby State
const StandbyState = ({ icon: Icon, title, description }: any) => (
    <div className="min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[40px] bg-muted/5 opacity-40 group hover:opacity-100 transition-opacity duration-500">
        <Icon size={48} className="text-muted-foreground mb-4 group-hover:scale-110 group-hover:text-sada-red transition-all duration-500" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">{title}</h4>
        <p className="text-[9px] font-bold uppercase mt-2  opacity-60">{description}</p>
    </div>
);

export const ViewRenderer = ({ currentView, data }: any) => {
    // PROTEKSI: Jika bukan manager tapi mencoba akses view rahasia
    const restrictedViews = ['review', 'analytics'];
    if (!data.isManager && restrictedViews.includes(currentView)) {
        return (
            <ViewContainer className="min-h-[400px] flex flex-col items-center justify-center bg-red-500/5 border border-red-500/20 rounded-[40px]">
                <ShieldCheck size={48} className="text-red-500 mb-4 opacity-50" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Access Denied</h4>
                <p className="text-[9px] font-bold uppercase mt-2 opacity-60">Insufficient clearance level for Sector: {currentView}</p>
            </ViewContainer>
        );
    }
    switch (currentView) {

        case 'member':
            return (
                <ViewContainer>
                    <div>
                        <MemberRoutineView
                            timeEntries={data.timeEntries}
                            projects={data.projects}
                            stats={data.stats}
                            currentDateProp={data.currentDate}
                        />
                    </div>
                </ViewContainer>
            );
        case 'calendar':
            return (
                <ViewContainer>
                    <SectionHeader title="Fleet Schedule" subtitle="Time-Based Asset Tracking" />
                    <div className="bg-card border border-border rounded-[40px] p-8 md:p-10 shadow-2xl shadow-black/5">
                        <StandbyState
                            icon={CalendarIcon}
                            title="Calendar Grid Offline"
                            description="Initializing temporal mapping interface..."
                        />
                    </div>
                </ViewContainer>
            );
        case 'audit':
            return (
                <ViewContainer>
                    <SectionHeader title="Operational Logs" subtitle="Your Weekly Timesheet Submissions" />
                    <div className="bg-white dark:bg-zinc-900/40 border border-border rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 p-8">

                        {/* UBAH BARIS INI: Cukup panggil data.history */}
                        <MemberLogsTab history={data.history} />

                    </div>
                </ViewContainer>
            );

        case 'review':
            return (
                <ViewContainer>
                    <SectionHeader
                        title="Verification Center"
                        subtitle="Pending Authorization Protocol"
                        badge={data.pendingLogs?.length || 0}
                    />

                    {/* PASTIKAN BARIS INI SEPERTI INI */}
                    <ManagerReviewTab pendingLogs={data.pendingLogs || []} />

                </ViewContainer>
            );

        case 'analytics':
            return (
                <ViewContainer>
                    <SectionHeader title="Analytics Engine" subtitle="Data Warehouse Sector 07" />
                    <div className="min-h-[450px] flex flex-col items-center justify-center bg-muted/10 rounded-[40px] border-2 border-dashed border-border/50 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                            <Activity size={500} />
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative mb-6">
                                <BarChart3 className="size-20 text-muted-foreground/20 animate-pulse" />
                                <Loader2 className="size-8 text-sada-red animate-spin absolute -top-2 -right-2" />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground text-center">Initializing Neural Analytics</h3>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold mt-3 animate-bounce">Awaiting Sync...</p>
                        </div>
                    </div>
                </ViewContainer>
            );

        default:
            return (
                <div className="min-h-[400px] flex items-center justify-center border-2 border-border rounded-[40px] opacity-20">
                    <AlertCircle size={24} className="mr-3" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sector Undefined</span>
                </div>
            );
    }
};