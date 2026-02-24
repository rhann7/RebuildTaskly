import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useCompanyPermission } from '@/hooks/use-company-permission';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { 
    Briefcase, Users, CheckCircle, Plus, Activity, 
    Building2, ShieldAlert, ShieldCheck, Zap, 
    ArrowUpRight, Clock, LayoutDashboard
} from 'lucide-react';

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8 p-6 animate-in fade-in duration-700">
                
                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-1 w-8 bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                                System Status: Active
                            </span>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                            {isSuperAdmin ? 'Command Center' : 'Operations Dashboard'}
                        </h2>
                        <p className="text-sm text-muted-foreground font-medium tracking-tight">
                            {isSuperAdmin 
                                ? 'Monitoring global infrastructure and corporate data.' 
                                : `Sector analysis for ${auth.user.name}. Deployment status confirmed.`}
                        </p>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="flex items-center gap-3">
                        {!isSuperAdmin && (
                            <Button className="rounded-none bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-tighter italic px-6 transition-all hover:translate-x-1">
                                <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> New Project
                            </Button>
                        )}
                        <Button variant="outline" className="rounded-none border-2 border-border font-black uppercase tracking-tighter italic px-6 hover:bg-muted">
                            <Zap className="mr-2 h-4 w-4" /> Reports
                        </Button>
                    </div>
                </div>

                {/* --- STATS GRID --- */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat, index) => {
                        const IconComponent = getIcon(stat.icon);
                        return (
                            <div key={index} className="group relative overflow-hidden border-2 border-border bg-card p-8 transition-all hover:border-primary/50">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                            {stat.title}
                                        </p>
                                        <h3 className="text-4xl font-black tracking-tighter italic">
                                            {stat.value}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-muted group-hover:bg-primary/10 transition-colors">
                                        <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground tracking-tight">
                                    <Activity size={12} className="text-primary" />
                                    {stat.desc}
                                </div>
                                {/* Industrial Line Decor */}
                                <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                            </div>
                        );
                    })}
                </div>

                {/* --- ACTIVITY & SIDEBAR SECTION --- */}
                <div className="grid gap-8 lg:grid-cols-4">
                    
                    {/* Activity Logs (75%) */}
                    <div className="lg:col-span-3 border-2 border-border bg-card/30 backdrop-blur-sm overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between border-b-2 border-border bg-muted/50 px-6 py-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                <LayoutDashboard size={16} className="text-primary" />
                                Operational Logs
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Live Feed</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 divide-y-2 divide-border">
                            {activities.length > 0 ? (
                                activities.map((activity, i) => (
                                    <div key={i} className="group flex items-center justify-between p-6 hover:bg-primary/[0.03] transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="h-10 w-10 shrink-0 border-2 border-border flex items-center justify-center bg-background group-hover:border-primary/50 transition-all">
                                                <Activity className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black uppercase italic tracking-tighter leading-none group-hover:text-primary transition-colors">
                                                    {activity.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground font-medium tracking-tight line-clamp-1 max-w-md">
                                                    {activity.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase font-mono">
                                                <Clock size={12} />
                                                {activity.time}
                                            </div>
                                            <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-40">
                                    <Zap size={40} className="mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Data Transmission Detected</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Security Info (25%) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-primary p-6 text-white space-y-4">
                            <ShieldCheck size={32} className="stroke-[2.5px]" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Security Protocol</h4>
                            <p className="text-[11px] leading-relaxed font-bold italic opacity-90 uppercase tracking-tighter">
                                System integrity is verified. Your session is encrypted and all operations are recorded for audit.
                            </p>
                            <div className="pt-2">
                                <div className="h-1 w-full bg-white/20">
                                    <div className="h-full w-2/3 bg-white" />
                                </div>
                                <span className="text-[9px] font-black uppercase mt-2 block opacity-70">Internal Security Rating: 88%</span>
                            </div>
                        </div>

                        <div className="border-2 border-border p-6 bg-card space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Resource Monitor</h4>
                            <div className="space-y-3">
                                {[
                                    { label: 'Network', val: 'Optimum' },
                                    { label: 'Database', val: 'Stable' },
                                    { label: 'Sync', val: '12ms' }
                                ].map((item, id) => (
                                    <div key={id} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                                        <span className="text-[9px] font-bold uppercase">{item.label}</span>
                                        <span className="text-[9px] font-black font-mono text-primary">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}