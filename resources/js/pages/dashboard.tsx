import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Page } from '@inertiajs/core';

// --- Komponen Header & Stats ---
import { HeaderDashboard } from '@/layouts/dashboard/component/HeaderDashboard';
import { StatsGrid } from '@/layouts/dashboard/component/StatGrid';

// --- Komponen Kolom Kiri (Dinamis per Role) ---
import { ActiveWorkspaces } from '@/layouts/dashboard/component/role/ActiveWorkspaces';
import { ProductivityChart } from '@/layouts/dashboard/component/ProductivityChart';

// --- Komponen Kolom Kanan (Sidebar) ---
import { QuickActions } from '@/layouts/dashboard/component/QuickAction';
import { RecentActivities } from '@/layouts/dashboard/component/RecentActivities';

// --- Ikon ---
import { Building2, Briefcase, Clock, FileText, CheckSquare, PlusCircle, Settings } from 'lucide-react';
import { ManagerProjects } from '@/layouts/dashboard/component/role/ManagerProjects';
import { MemberTasks } from '@/layouts/dashboard/component/role/MemberTasks';

interface DashboardProps extends Page {
    auth: {
        user: {
            name: string;
            email: string;
            company?: { name: string };
            roles?: string[];
            chartData?: number[];
        };
    };
    stats: any[];
    activities: any[];
    workspaces?: any[];
    projects?: any[];
    myTasks?: any[];
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

export default function Dashboard() {
    const { props } = usePage<DashboardProps>();
    const { auth, stats, workspaces, projects, myTasks, activities, chartData } = props;

    // Ambil Role (Fallback ke 'member')
    const role = auth.user.roles?.[0] || 'member';

    // ==========================================
    // LOGIKA DINAMIS QUICK ACTIONS PER ROLE
    // ==========================================
    const getQuickActions = () => {
        if (role === 'super-admin') {
            return [
                { label: 'Add Company', description: 'Register new client', icon: Building2, color: 'from-purple-500 to-indigo-600', href: '/companies/create' },
                { label: 'Manage Roles', description: 'System permissions', icon: Settings, color: 'from-zinc-500 to-zinc-700', href: '/permissions' },
            ];
        }

        if (role === 'owner' || role === 'company') {
            return [
                { label: 'New Workspace', description: 'Create deployment area', icon: PlusCircle, color: 'from-sada-red to-red-700', href: '/workspaces' },
                { label: 'All Projects', description: 'View active contracts', icon: Briefcase, color: 'from-blue-500 to-indigo-600', href: '/projects' },
                { label: 'Audit Logs', description: 'Review company timesheets', icon: FileText, color: 'from-emerald-500 to-teal-600', href: '/timesheets' },
            ];
        }

        if (role === 'manager') {
            return [
                { label: 'Review Timesheets', description: 'Approve or revise logs', icon: CheckSquare, color: 'from-amber-500 to-orange-600', href: '/timesheets' },
                { label: 'Manage Projects', description: 'Supervise deployments', icon: Briefcase, color: 'from-blue-500 to-indigo-600', href: '/projects' },
                { label: 'My Routine', description: 'Log your own work', icon: Clock, color: 'from-emerald-500 to-teal-600', href: '/timesheets?view=routine' },
            ];
        }

        // Default (Member)
        return [
            { label: 'Log Timesheet', description: 'Record daily activity', icon: Clock, color: 'from-emerald-500 to-teal-600', href: '/timesheets?view=routine' },
            { label: 'My Tasks', description: 'View assigned objectives', icon: CheckSquare, color: 'from-indigo-500 to-blue-600', href: '/tasks' },
        ];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8 p-6 md:p-10 transition-all animate-in fade-in duration-700">

                {/* 1. Header Section */}
                <HeaderDashboard />

                {/* 2. Stats Grid Section */}
                <StatsGrid stats={stats} />

                {/* 3. Content Grid Section */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* ========================================== */}
                    {/* KOLOM KIRI: Tampilan Utama (Lebar 2/3)       */}
                    {/* ========================================== */}
                    <div className="lg:col-span-2 space-y-8 flex flex-col">

                        {/* 1. TAMPILAN OWNER / COMPANY */}
                        {(role === 'owner' || role === 'company') && workspaces && (
                            <ActiveWorkspaces workspaces={workspaces} />
                        )}

                        {/* 2. TAMPILAN MANAGER */}
                        {role === 'manager' && projects && (
                            <ManagerProjects projects={projects} />
                        )}

                        {/* 3. TAMPILAN MEMBER */}
                        {(!['super-admin', 'company', 'owner', 'manager'].includes(role)) && myTasks && (
                            <MemberTasks tasks={myTasks} />
                        )}

                        {/* Chart Produktivitas (Dilihat oleh semua role) */}
                        <ProductivityChart data={chartData} />

                    </div>

                    {/* ========================================== */}
                    {/* KOLOM KANAN: Actions & Feed (Lebar 1/3)      */}
                    {/* ========================================== */}
                    <div className="lg:col-span-1">
                        {/* Bungkus dengan sticky agar saat di-scroll, kolom kanan tetap mengikuti layar */}
                        <div className="sticky top-8 flex flex-col gap-8">

                            {/* KOTAK 1: Quick Actions */}
                            <div className="bg-card rounded-[32px] border border-border/60 shadow-sm p-6 md:p-8">
                                <QuickActions actions={getQuickActions()} />
                            </div>

                            {/* KOTAK 2: Recent Activities */}
                            <div className="bg-card rounded-[32px] border border-border/60 shadow-sm p-6 md:p-8">
                                <RecentActivities activities={activities} />
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}