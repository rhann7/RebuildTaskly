import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { DASHBOARD_STATS_DUMMY } from '@/data/dashboard';
import { TEAM_MEMBERS_DUMMY } from '@/data/member';
import { QUICK_ACTIONS_DUMMY } from '@/data/quick';
import { WORKSPACE_DUMMY } from '@/data/workspace';
import AppLayout from '@/layouts/app-layout';
import { ActiveWorkspaces } from '@/layouts/dashboard/ActiveWorkspace';
import { HeaderDashboard } from '@/layouts/dashboard/HeaderDashboard';
import { QuickActions } from '@/layouts/dashboard/QuickAction';
import { StatsGrid } from '@/layouts/dashboard/StatGrid';
import { TeamMembers } from '@/layouts/dashboard/TeamMembers';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8 p-6 md:p-10 transition-all">

                {/* 1. Header Section */}
                <HeaderDashboard />

                {/* 2. Stats Grid Section */}
                <StatsGrid stats={DASHBOARD_STATS_DUMMY} />

                {/* 3. Content Grid Section */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* Kolom Kiri: Workspaces (Lebar 2/3 di Desktop) */}
                    <div className="lg:col-span-2 space-y-8">
                        <ActiveWorkspaces workspaces={WORKSPACE_DUMMY} />

                        {/* Kamu bisa aktifkan RecentTasks di sini nanti */}
                        {/* <RecentTasks tasks={RECENT_TASKS_DUMMY} /> */}
                    </div>

                    {/* Kolom Kanan: Actions & Members (Lebar 1/3 di Desktop) */}
                    <div className="lg:col-span-1">
                        {/* Card Putih Besar yang membungkus keduanya */}
                        <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">

                            {/* Bagian Quick Actions */}
                            <div className="p-6">
                                <QuickActions actions={QUICK_ACTIONS_DUMMY} />
                            </div>
                            {/* Garis Pemisah (HR) */}
                            <hr className="border-border mx-6" />
                            {/* Bagian Team Members / Performance Ranking */}
                            <div className="p-6">
                                <TeamMembers members={TEAM_MEMBERS_DUMMY} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
