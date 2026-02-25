import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import {
    Activity, AlertTriangle, Award, CheckCircle2, Clock,
    TrendingDown, TrendingUp, RotateCcw, Filter, ChevronLeft
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- IMPORT RECENT ACTIVITIES COMPONENT ---
import { RecentActivities } from '@/layouts/dashboard/component/RecentActivities';

// ─── Filters ───────────────────────────────────────────────────────────────
function MemberFilters({ projects = [], filters = {}, workspaceSlug, memberId }: any) {
    const [local, setLocal] = useState({ period: 'week', project_id: 'all', ...filters });
    const [showCustom, setShowCustom] = useState(filters.period === 'custom');

    const set = (k: string, v: string) => {
        const next = { ...local, [k]: v };
        if (k === 'period') { setShowCustom(v === 'custom'); if (v !== 'custom') { delete next.date_from; delete next.date_to; } }
        setLocal(next);
    };

    const apply = () => {
        const clean: Record<string, string> = {};
        if (local.project_id && local.project_id !== 'all') clean.project_id = local.project_id;
        if (local.period) clean.period = local.period;
        if (local.date_from) clean.date_from = local.date_from;
        if (local.date_to) clean.date_to = local.date_to;
        router.get(`/workspaces/${workspaceSlug}/team-performance/member/${memberId}`, clean, { preserveState: true, preserveScroll: true });
    };

    const reset = () => {
        setLocal({ project_id: 'all', period: 'week' }); setShowCustom(false);
        router.get(`/workspaces/${workspaceSlug}/team-performance/member/${memberId}`, { period: 'week' }, { preserveState: true, preserveScroll: true });
    };

    const hasActive = local.project_id !== 'all' || local.period !== 'week' || local.date_from || local.date_to;
    const cls = "h-10 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-3 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-sada-red/20 w-full appearance-none dark:text-white";

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-5 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Filter size={13} className="text-zinc-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 dark:text-zinc-300">Filters</span>
            </div>
            <div className={`grid gap-3 ${showCustom ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Project</p>
                    <select className={cls} value={local.project_id ?? 'all'} onChange={e => set('project_id', e.target.value)}>
                        <option value="all">All Projects</option>
                        {projects?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Period</p>
                    <select className={cls} value={local.period ?? 'week'} onChange={e => set('period', e.target.value)}>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                {showCustom && <>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">From</p>
                        <input type="date" className={cls} value={local.date_from ?? ''} onChange={e => set('date_from', e.target.value)} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">To</p>
                        <input type="date" className={cls} value={local.date_to ?? ''} onChange={e => set('date_to', e.target.value)} />
                    </div>
                </>}
            </div>
            <div className="flex gap-2 mt-4">
                <button onClick={apply} className="h-9 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sada-red dark:hover:bg-sada-red dark:hover:text-white transition">Apply</button>
                {hasActive && <button onClick={reset} className="h-9 px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-zinc-200 transition"><RotateCcw size={10} /> Reset</button>}
            </div>
        </div>
    );
}

// ─── Metric Card ───────────────────────────────────────────────────────────
function MetricCard({ label, sub, value, suffix, icon: Icon, color, trend }: any) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-0.5">{label}</p>
                    {sub && <p className="text-[9px] font-bold text-zinc-300 dark:text-zinc-600 mb-2">{sub}</p>}
                    <p className={`text-3xl font-black tracking-tighter ${color ?? 'text-zinc-900 dark:text-white'}`}>
                        {value}{suffix && <span className="text-base font-bold text-zinc-400 ml-0.5">{suffix}</span>}
                    </p>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 mt-2 ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-zinc-400'}`}>
                            {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : null}
                            <span className="text-[9px] font-black">{trend > 0 ? '+' : ''}{trend} vs prev</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-2xl ${color ? color.replace('text-', 'bg-').replace('600', '100').replace('dark:text-white', 'bg-zinc-100') : 'bg-zinc-100'} dark:bg-zinc-800`}>
                    <Icon size={18} className={color ?? 'text-zinc-600'} />
                </div>
            </div>
        </div>
    );
}

// ─── Section Label ─────────────────────────────────────────────────────────
const SL = ({ title, sub }: { title: string; sub?: string }) => (
    <div className="mb-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 dark:text-zinc-300">{title}</h2>
        {sub && <p className="text-[9px] font-bold text-zinc-400 mt-0.5">{sub}</p>}
    </div>
);

// ─── Priority Bar ──────────────────────────────────────────────────────────
function PriorityBar({ label, value, total, color }: any) {
    const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
    return (
        <div className="flex items-center gap-3 mb-2">
            <span className={`text-[9px] font-black uppercase tracking-wider w-14 ${color}`}>{label}</span>
            <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-black text-zinc-900 dark:text-white w-6 text-right">{value}</span>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function MemberPerformanceDetail({ 
    workspace, 
    member = {}, // Default kosong agar tidak crash
    recentTasks = [], 
    performanceHistory = [], 
    projects = [], 
    filters = {}, 
    recentActivities = [] 
}: any) {
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'time' | 'trends'>('overview');

    const periodLabel = useMemo(() => (
        { today: 'Today', week: 'This Week', month: 'This Month', custom: 'Selected Period' } as any
    )[filters?.period || 'week'] ?? 'This Week', [filters?.period]);

    const trendData = performanceHistory ?? [];

    const taskTrend = trendData.length >= 2
        ? trendData[trendData.length - 1].tasksCompleted - trendData[trendData.length - 2].tasksCompleted
        : 0;
    const ptsTrend = trendData.length >= 2
        ? trendData[trendData.length - 1].pointsEarned - trendData[trendData.length - 2].pointsEarned
        : 0;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: workspace?.name || 'Workspace', href: `/workspaces/${workspace?.slug}` },
        { title: 'Team Performance', href: `/workspaces/${workspace?.slug}/team-performance` },
        { title: member?.name || 'Member', href: '#' },
    ];

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'tasks', label: `Tasks (${recentTasks?.length || 0})` },
        { id: 'time', label: 'Time Tracking' },
        { id: 'trends', label: 'Trends' },
    ];

    const statusColors: Record<string, string> = {
        todo: 'bg-zinc-100 text-zinc-600',
        in_progress: 'bg-blue-100 text-blue-700',
        review: 'bg-purple-100 text-purple-700',
        revision: 'bg-orange-100 text-orange-700',
        done: 'bg-emerald-100 text-emerald-700',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${member?.name || 'Loading'} — Performance`} />

            <div className="mx-auto w-full max-w-[1400px] flex flex-col gap-7 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* ── Back ── */}
                <Link href={`/workspaces/${workspace?.slug}/team-performance`}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-sada-red transition w-fit">
                    <ChevronLeft size={14} /> Back to Team Performance
                </Link>

                {/* ── Member Header ── */}
                <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white text-3xl font-black shrink-0 uppercase">
                                {member?.name?.[0] || '?'}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-sada-red font-black tracking-[0.3em] text-[10px] mb-1">
                                    <Activity size={11} /> MEMBER ANALYTICS
                                </div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">{member?.name || 'Unknown User'}</h1>
                                <p className="text-xs font-bold text-zinc-400 mt-1">{member?.email || '-'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[9px] font-black px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full uppercase text-zinc-600 dark:text-zinc-300">{member?.role || 'member'}</span>
                                    <span className="text-[9px] font-black px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full uppercase text-blue-600">📅 {periodLabel}</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { val: member?.taskSummary?.total || 0, label: 'Active Tasks', color: 'text-blue-600' },
                                { val: `${member?.performance?.completionRate || 0}%`, label: 'Completion', color: 'text-emerald-600' },
                                { val: member?.performance?.pointsEarned || 0, label: 'Points', color: 'text-purple-600' },
                            ].map(({ val, label, color }) => (
                                <div key={label} className="text-center">
                                    <p className={`text-3xl font-black ${color}`}>{val}</p>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase mt-1">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Filters ── */}
                <MemberFilters projects={projects} filters={filters} workspaceSlug={workspace?.slug} memberId={member?.id} />

                {/* ── Alerts ── */}
                {member?.alerts && member.alerts.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-[24px] p-5 border border-red-200 dark:border-red-800">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700 dark:text-red-400 mb-3">Active Alerts</p>
                        {member.alerts.map((a: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={12} className="text-red-600 shrink-0" />
                                <p className="text-xs font-bold text-red-700 dark:text-red-400">{a.message}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Metric Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard label="Tasks Completed" sub={periodLabel} value={member?.performance?.tasksCompleted || 0} icon={CheckCircle2} color="text-blue-600" trend={taskTrend} />
                    <MetricCard label="Points Earned" sub={periodLabel} value={member?.performance?.pointsEarned || 0} icon={Award} color="text-purple-600" trend={ptsTrend} />
                    <MetricCard label="Hours Logged" sub={periodLabel} value={member?.timeTracking?.thisWeek || 0} suffix="h" icon={Clock} color="text-emerald-600" />
                    <MetricCard label="Overdue Tasks" sub="Current Status" value={member?.taskSummary?.overdue || 0} icon={AlertTriangle} color={(member?.taskSummary?.overdue || 0) > 0 ? 'text-red-600' : 'text-zinc-600'} />
                </div>

                {/* ── Tabs Menu ── */}
                <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl w-fit border border-zinc-200 dark:border-zinc-700 overflow-x-auto">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                            className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-white dark:bg-zinc-900 text-sada-red shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Overview Tab ── */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
                        {/* Kolom Kiri: Stats & Prioritas */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Task Status */}
                            <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                <SL title="Task Status" sub="Active tasks only" />
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                        { label: 'In Progress', val: member?.taskSummary?.in_progress || 0, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                        { label: 'Todo', val: member?.taskSummary?.todo || 0, color: 'text-zinc-600', bg: 'bg-zinc-50 dark:bg-zinc-800' },
                                        { label: 'In Review', val: member?.taskSummary?.review || 0, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                                        { label: 'Revision', val: member?.taskSummary?.revision || 0, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                                        { label: 'Done This Week', val: member?.taskSummary?.doneThisWeek || 0, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                        { label: 'Overdue', val: member?.taskSummary?.overdue || 0, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
                                    ].map(({ label, val, color, bg }) => (
                                        <div key={label} className={`${bg} rounded-2xl p-4`}>
                                            <p className={`text-2xl font-black ${color}`}>{val}</p>
                                            <p className="text-[9px] font-black text-zinc-400 uppercase mt-0.5">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Priority Breakdown */}
                            <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                <SL title="By Priority" sub="Active tasks" />
                                <PriorityBar label="High" value={member?.taskSummary?.byPriority?.high || 0} total={member?.taskSummary?.total || 0} color="text-red-600" />
                                <PriorityBar label="Medium" value={member?.taskSummary?.byPriority?.medium || 0} total={member?.taskSummary?.total || 0} color="text-amber-500" />
                                <PriorityBar label="Low" value={member?.taskSummary?.byPriority?.low || 0} total={member?.taskSummary?.total || 0} color="text-emerald-500" />

                                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <SL title="Daily Hours" sub="This week" />
                                    {member?.timeTracking?.dailyBreakdown?.map((d: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-zinc-500 w-10">{d.day}</span>
                                            <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mx-3 overflow-hidden">
                                                <div className={`h-full rounded-full ${d.overtime ? 'bg-red-500' : 'bg-zinc-800 dark:bg-zinc-400'}`} style={{ width: `${Math.min((d.hours / 10) * 100, 100)}%` }} />
                                            </div>
                                            <span className={`text-xs font-black w-10 text-right ${d.overtime ? 'text-red-600' : 'text-zinc-900 dark:text-white'}`}>{d.hours}h</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Activity Feed */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 h-full min-h-[400px]">
                                <RecentActivities activities={recentActivities || []} />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Tasks Tab ── */}
                {activeTab === 'tasks' && (
                    <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
                        <div className="px-6 py-5 border-b border-zinc-50 dark:border-zinc-800">
                            <SL title="Recent Tasks" sub={`Updated in ${periodLabel.toLowerCase()}`} />
                        </div>
                        {recentTasks?.length > 0 ? (
                            <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                                {recentTasks.map((task: any) => (
                                    <div key={task.id} className="px-6 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-[9px] font-black text-sada-red uppercase tracking-tighter mb-1">{task?.project?.name || 'Unknown Project'}</p>
                                                <p className="text-sm font-black text-zinc-900 dark:text-white uppercase">{task.title}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${statusColors[task.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                                                        {task.status?.replace('_', ' ')}
                                                    </span>
                                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${task.priority === 'high' ? 'bg-red-50 border-red-100 text-red-600' : task.priority === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                            </div>
                                            {task.due_date && (
                                                <p className="text-[9px] font-bold text-zinc-400 shrink-0">
                                                    Due {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <Activity size={28} className="mx-auto text-zinc-200 mb-3" />
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-300">No tasks in {periodLabel.toLowerCase()}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Time Tab ── */}
                {activeTab === 'time' && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-[24px] p-6">
                                <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Total Hours</p>
                                <p className="text-4xl font-black text-blue-700 dark:text-blue-400">{member?.timeTracking?.totalHours || 0}<span className="text-xl">h</span></p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-[24px] p-6">
                                <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Avg per {member?.timeTracking?.granularity === 'weekly' ? 'Week' : 'Day'}</p>
                                <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400">{member?.timeTracking?.avgPerPeriod || 0}<span className="text-xl">h</span></p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-[24px] p-6">
                                <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Overtime Periods</p>
                                <p className="text-4xl font-black text-purple-700 dark:text-purple-400">{member?.timeTracking?.overtimeCount || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <SL title={`${member?.timeTracking?.granularity === 'weekly' ? 'Weekly' : 'Daily'} Breakdown`} sub={periodLabel} />
                            {member?.timeTracking?.breakdown?.length > 0 ? (
                                <div className="space-y-3">
                                    {member.timeTracking.breakdown.map((entry: any, i: number) => (
                                        <div key={i}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{entry.period}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black ${entry.overtime ? 'text-red-600' : 'text-zinc-900 dark:text-white'}`}>{entry.hours}h</span>
                                                    {entry.overtime && <span className="text-[9px] font-black px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Overtime</span>}
                                                </div>
                                            </div>
                                            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${entry.overtime ? 'bg-red-500' : entry.hours >= (entry.target ?? 8) ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${Math.min(((entry.hours || 0) / (entry.target ?? 8)) * 100, 100)}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Clock size={28} className="mx-auto text-zinc-200 mb-3" />
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-300">No time entries in {periodLabel.toLowerCase()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Trends Tab ── */}
                {activeTab === 'trends' && (
                    <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm animate-in fade-in duration-300">
                        <SL title="Performance Trends" sub={`Based on ${periodLabel.toLowerCase()}`} />
                        {trendData?.length > 0 ? (
                            <div className="space-y-6">
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trendData} barSize={16}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="week" tick={{ fontSize: 9, fontWeight: 700 }} />
                                            <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                                            <Tooltip />
                                            <Bar dataKey="tasksCompleted" name="Tasks" fill="#18181b" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="pointsEarned" name="Points" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                                    {trendData.map((w: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between py-3">
                                            <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">{w.week}</span>
                                            <div className="flex items-center gap-6 text-[10px] font-black text-zinc-500">
                                                <span>{w.tasksCompleted} tasks</span>
                                                <span className="text-blue-600">{w.pointsEarned} pts</span>
                                                <span>{w.hoursTracked}h</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <TrendingUp size={28} className="mx-auto text-zinc-200 mb-3" />
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-300">No trend data available</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}