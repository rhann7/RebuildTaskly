import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useCompanyPermission } from '@/hooks/use-company-permission';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { Briefcase, Users, CheckCircle, Plus, Activity, Building2, ShieldAlert, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';

interface DashboardStat {
    title: string;
    value: number | string;
    icon: string;
    desc: string;
}

interface ActivityLog {
    title: string;
    desc: string;
    time: string;
}

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
            roles: string[];
        };
    };
    stats: DashboardStat[];
    activities: ActivityLog[];
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
        Building2, ShieldCheck, ShieldAlert, Briefcase, Users, CheckCircle, Zap
    };
    return icons[iconName] || Activity;
};

export default function Dashboard({ stats, activities }: PageProps) {
    const { auth } = usePage<PageProps>().props;
    const userRoles = auth.user.roles || [];
    const isSuperAdmin = userRoles.includes('super-admin');
    const { can } = useCompanyPermission();
    const { flash } = usePage().props as any || {};

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {flash?.success && !isSuperAdmin && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 animate-in slide-in-from-right duration-500 rounded-r-lg shadow-sm">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">Akun Aktif Kembali</p>
                            <p className="text-xs opacity-90">{flash.success}</p>
                        </div>
                    </div>
                </div>
            )}

            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            {isSuperAdmin ? 'System Overview' : `Welcome back, ${auth.user.name}`}
                        </h2>
                        
                        <p className="text-sm text-muted-foreground">
                            {isSuperAdmin 
                                ? 'Monitoring application health and metrics.'
                                : "Here's what's happening with your company today."
                            }
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat, index) => (
                        <StatCard 
                            key={index}
                            title={stat.title} 
                            value={String(stat.value)} 
                            icon={getIcon(stat.icon)} 
                            description={stat.desc}
                        />
                    ))}
                </div>

                <div className="flex flex-1 flex-col gap-4 overflow-hidden rounded-xl border border-sidebar-border/70 bg-background shadow-sm">
                    <div className="border-b border-sidebar-border/70 p-6">
                        <h3 className="font-semibold text-foreground">
                            {isSuperAdmin ? 'Recent Company Registrations' : 'Your Workspace Activity'}
                        </h3>
                    </div>
                    
                    <div className="flex flex-1 flex-col p-0">
                        {activities.length > 0 ? (
                            <div className="divide-y divide-border">
                                {activities.map((activity, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                                <Activity className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{activity.title}</p>
                                                <p className="text-sm text-muted-foreground">{activity.desc}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-muted-foreground">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                                    <Activity className="h-6 w-6 opacity-50" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">No recent activity</h3>
                                <p className="max-w-sm text-sm mb-4">
                                    {isSuperAdmin 
                                        ? "No new companies have registered recently."
                                        : "You haven't performed any major actions yet."
                                    }
                                </p>
                                
                                {!isSuperAdmin && can('create-workspace') && (
                                    <Button variant="outline" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create New Workspace
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}