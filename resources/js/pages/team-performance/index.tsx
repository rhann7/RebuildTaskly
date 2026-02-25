import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import {
    Activity, Users, Target, TrendingUp, TrendingDown, Minus,
    CheckCircle2, Clock, AlertTriangle, AlertCircle, Award,
    BarChart3, Trophy, Medal, Search, Filter, RotateCcw,
    ChevronDown, ChevronUp, ExternalLink, Zap, Eye
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar
} from 'recharts';

// ─── Types ─────────────────────────────────────────────────────────────────
interface TaskOverview { total: number; todo: number; in_progress: number; review: number; revision: number; done: number; overdue: number; completionRate: number }
interface TeamSummary { totalMembers: number; managers: number; activeMembers: number; unassigned: number; avgUtilization: number }
interface ProductivityMetrics { completedCurrent: number; completedPrevious: number; hoursCurrent: number; hoursPrevious: number; taskChange: number; hoursChange: number; trend: 'up' | 'down' | 'stable'; mode: string }
interface WorkloadMember { id: number; name: string; taskCount: number; totalScore: number; percentage: number; status: 'normal' | 'overloaded' | 'underutilized' }
interface WorkloadDistribution { members: WorkloadMember[]; overloadedCount: number; underutilizedCount: number; needsRebalancing: boolean }
interface LeaderboardMember { id: number; name: string; rank: number; tasksCompleted: number; points: number; onTimeRate: number }
interface Alert { type: string; message: string; count?: number }
interface CriticalAlerts { urgent: Alert[]; warnings: Alert[] }
interface MemberDetail { id: number; name: string; email: string; role: string; taskSummary: any; performance: any; timeTracking: any; alerts: any[] }
interface DashboardData { teamSummary: TeamSummary; taskOverviewStats: TaskOverview; productivityMetrics: ProductivityMetrics; workloadDistribution: WorkloadDistribution; teamLeaderboard: LeaderboardMember[]; criticalAlerts: CriticalAlerts; memberDetails: MemberDetail[]; productivityTrends: any[] }

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">{label}</p>
            <p className={`text-4xl font-black tracking-tighter ${accent ?? 'text-zinc-900 dark:text-white'}`}>{value}</p>
            {sub && <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">{sub}</p>}
        </div>
    );
}

// ─── Section Header ────────────────────────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
    return (
        <div className="mb-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-800 dark:text-zinc-200">{title}</h2>
            {sub && <p className="text-[10px] font-bold text-zinc-400 mt-0.5">{sub}</p>}
        </div>
    );
}

// ─── Filters ───────────────────────────────────────────────────────────────
function Filters({ projects = [], filters = {}, workspaceSlug }: { projects: any[]; filters: any; workspaceSlug: string }) {
    const [local, setLocal] = useState({ period: 'week', project_id: 'all', ...filters });
    const [showCustom, setShowCustom] = useState(filters.period === 'custom');

    const set = (k: string, v: string) => {
        const next = { ...local, [k]: v };
        if (k === 'period') {
            setShowCustom(v === 'custom');
            if (v !== 'custom') { delete next.date_from; delete next.date_to; }
        }
        setLocal(next);
    };

    const apply = () => {
        const clean: Record<string, string> = {};
        if (local.project_id && local.project_id !== 'all') clean.project_id = local.project_id;
        if (local.period) clean.period = local.period;
        if (local.date_from) clean.date_from = local.date_from;
        if (local.date_to) clean.date_to = local.date_to;
        router.get(`/workspaces/${workspaceSlug}/team-performance`, clean, { preserveState: true, preserveScroll: true });
    };

    const reset = () => {
        setLocal({ project_id: 'all', period: 'week' });
        setShowCustom(false);
        router.get(`/workspaces/${workspaceSlug}/team-performance`, { period: 'week' }, { preserveState: true, preserveScroll: true });
    };

    const hasActive = local.project_id !== 'all' || local.period !== 'week' || local.date_from || local.date_to;

    const selectCls = "h-10 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-3 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-sada-red/20 w-full appearance-none dark:text-white";

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Filter size={14} className="text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 dark:text-zinc-300">Filters</span>
                {hasActive && <span className="ml-1 bg-sada-red text-white rounded-full px-2 py-0.5 text-[9px] font-black">ACTIVE</span>}
            </div>
            <div className={`grid gap-4 ${showCustom ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Project</p>
                    <select className={selectCls} value={local.project_id ?? 'all'} onChange={e => set('project_id', e.target.value)}>
                        <option value="all">All Projects</option>
                        {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Period</p>
                    <select className={selectCls} value={local.period ?? 'week'} onChange={e => set('period', e.target.value)}>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                {showCustom && <>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">From</p>
                        <input type="date" className={selectCls} value={local.date_from ?? ''} onChange={e => set('date_from', e.target.value)} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">To</p>
                        <input type="date" className={selectCls} value={local.date_to ?? ''} onChange={e => set('date_to', e.target.value)} />
                    </div>
                </>}
            </div>
            <div className="flex gap-2 mt-4">
                <button onClick={apply} className="h-9 px-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sada-red dark:hover:bg-sada-red dark:hover:text-white transition-all">
                    Apply
                </button>
                {hasActive && (
                    <button onClick={reset} className="h-9 px-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-200 transition-all">
                        <RotateCcw size={11} /> Reset
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Alerts Section ────────────────────────────────────────────────────────
function AlertsSection({ data }: { data: CriticalAlerts }) {
    // Safety check in case data is undefined
    const urgentAlerts = data?.urgent || [];
    const warningAlerts = data?.warnings || [];
    const hasAlerts = urgentAlerts.length > 0 || warningAlerts.length > 0;

    if (!hasAlerts) {
        return (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-[24px] p-5 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">All Clear — No critical alerts</p>
            </div>
        );
    }
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <SectionHeader title="Critical Alerts" />
            <div className="space-y-2.5">
                {urgentAlerts.map((a: any, i: number) => (
                    <div key={`u-${i}`} className="flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={15} className="text-red-600 shrink-0" />
                            <div>
                                <p className="text-xs font-black text-zinc-900 dark:text-white">{a.message}</p>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase mt-0.5">{a.type?.replace(/_/g, ' ')}</p>
                            </div>
                        </div>
                        <span className="text-[9px] font-black px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 uppercase tracking-wider">Urgent</span>
                    </div>
                ))}
                {warningAlerts.map((a: any, i: number) => (
                    <div key={`w-${i}`} className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={15} className="text-amber-600 shrink-0" />
                            <div>
                                <p className="text-xs font-black text-zinc-900 dark:text-white">{a.message}</p>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase mt-0.5">{a.type?.replace(/_/g, ' ')}</p>
                            </div>
                        </div>
                        <span className="text-[9px] font-black px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 uppercase tracking-wider">Warning</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Workload Chart ────────────────────────────────────────────────────────
function WorkloadChart({ data }: { data: WorkloadDistribution }) {
    const barColor = (s: string) => s === 'overloaded' ? '#ef4444' : s === 'underutilized' ? '#f59e0b' : '#10b981';
    const members = data?.members || [];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col h-full">
            <div className="flex items-start justify-between mb-5">
                <SectionHeader title="Workload Distribution" sub={data?.needsRebalancing ? '⚠ Rebalancing recommended' : 'Balanced'} />
                <div className="text-right text-[10px] font-black">
                    <p className="text-red-500">{data?.overloadedCount || 0} overloaded</p>
                    <p className="text-amber-500">{data?.underutilizedCount || 0} underutilized</p>
                </div>
            </div>

            {members.length > 0 ? (
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    {members.map((m: any) => (
                        <div key={m.id}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">{m.name}</span>
                                <div className="flex items-center gap-3 text-[9px] font-black text-zinc-400">
                                    <span>{m.taskCount} tasks</span>
                                    <span>{m.percentage}%</span>
                                </div>
                            </div>
                            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(m.percentage || 0, 100)}%`, background: barColor(m.status) }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    No active members
                </div>
            )}
        </div>
    );
}

// ─── Leaderboard ───────────────────────────────────────────────────────────
function Leaderboard({ data = [], workspaceSlug }: { data: LeaderboardMember[]; workspaceSlug: string }) {
    const rankBadge = (rank: number) => {
        if (rank === 1) return <span className="text-lg">🥇</span>;
        if (rank === 2) return <span className="text-lg">🥈</span>;
        if (rank === 3) return <span className="text-lg">🥉</span>;
        return <span className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-black text-zinc-500">{rank}</span>;
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm h-full">
            <div className="flex items-center justify-between mb-5">
                <SectionHeader title="Top Performers" />
                <Trophy size={16} className="text-amber-500" />
            </div>
            {data.length > 0 ? (
                <div className="space-y-3 overflow-y-auto pr-1">
                    {data.map((m: any) => (
                        <Link key={m.id} href={`/workspaces/${workspaceSlug}/team-performance/member/${m.id}`}
                            className="flex items-center justify-between p-3 rounded-2xl border border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition group">
                            <div className="flex items-center gap-3">
                                {rankBadge(m.rank)}
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white text-xs font-black">
                                    {m.name[0]}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-zinc-900 dark:text-white group-hover:text-sada-red transition">{m.name}</p>
                                    <p className="text-[9px] font-bold text-zinc-400">{m.tasksCompleted} tasks · {m.onTimeRate}% on-time</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-black text-blue-600">{m.points}</p>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">pts</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-10 flex flex-col items-center justify-center text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">
                    <Award size={24} className="mb-2 opacity-50" />
                    No leaderboard data
                </div>
            )}
        </div>
    );
}

// ─── Trends Chart ──────────────────────────────────────────────────────────
function TrendsChart({ data = [] }: { data: any[] }) {
    const [mode, setMode] = useState<'tasks' | 'points'>('tasks');
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm h-full">
            <div className="flex items-center justify-between mb-5">
                <SectionHeader title="Productivity Trends" sub="Completed tasks over time" />
                <div className="flex gap-1">
                    {(['tasks', 'points'] as const).map(m => (
                        <button key={m} onClick={() => setMode(m)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${mode === m ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>
                            {m}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="week" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number | undefined) => [`${v ?? 0} ${mode === 'tasks' ? 'tasks' : 'pts'}`, mode === 'tasks' ? 'Tasks' : 'Points']} />
                        <Bar dataKey={mode === 'tasks' ? 'tasksCompleted' : 'pointsEarned'} fill={mode === 'tasks' ? '#18181b' : '#2563eb'} radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Task Overview Grid ────────────────────────────────────────────────────
function TaskOverviewGrid({ data }: { data: TaskOverview }) {
    const items = [
        { label: 'To-Do', value: data?.todo || 0, color: 'text-zinc-600', bg: 'bg-zinc-50 dark:bg-zinc-800' },
        { label: 'In Progress', value: data?.in_progress || 0, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Under Review', value: data?.review || 0, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Needs Revision', value: data?.revision || 0, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { label: 'Completed', value: data?.done || 0, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Overdue', value: data?.overdue || 0, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    ];
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-5">
                <SectionHeader title="Task Overview" sub={`${data?.completionRate || 0}% completion rate`} />
                <div className="text-right">
                    <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">{data?.total || 0}</p>
                    <p className="text-[9px] font-black text-zinc-400 uppercase">total</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 flex-1">
                {items.map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-2xl p-3 flex flex-col justify-center`}>
                        <p className={`text-xl font-black ${color}`}>{value}</p>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5 leading-tight">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Productivity Metrics Card ─────────────────────────────────────────────
function ProductivityCard({ data }: { data: ProductivityMetrics }) {
    const trend = data?.trend || 'stable';
    const TIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const tColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-zinc-400';
    const modeLabel = ({ today: 'Today', week: 'This Week', month: 'This Month', custom: 'Selected Period' } as any)[data?.mode || 'week'] ?? 'Current Period';
    const prevLabel = ({ today: 'Yesterday', week: 'Last Week', month: 'Last Month', custom: 'Prev Period' } as any)[data?.mode || 'week'] ?? 'Prev';

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col h-full">
            <SectionHeader title="Productivity Metrics" sub={modeLabel} />
            <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="flex flex-col justify-center">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tasks {modeLabel}</p>
                    <p className="text-3xl font-black text-zinc-900 dark:text-white">{data?.completedCurrent || 0}</p>
                    <div className={`flex items-center gap-1 mt-1 ${tColor}`}>
                        <TIcon size={11} />
                        <span className="text-[9px] font-black">{data?.taskChange > 0 ? '+' : ''}{data?.taskChange || 0}% vs {prevLabel}</span>
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Hours {modeLabel}</p>
                    <p className="text-3xl font-black text-zinc-900 dark:text-white">{data?.hoursCurrent || 0}<span className="text-base text-zinc-400">h</span></p>
                    <p className="text-[9px] font-black text-zinc-400 mt-1">{data?.hoursPrevious || 0}h {prevLabel}</p>
                </div>
            </div>
        </div>
    );
}

// ─── Member Card ───────────────────────────────────────────────────────────
function MemberCard({ member, workspaceSlug }: { member: MemberDetail; workspaceSlug: string }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {member.name[0]}
                    </div>
                    <div>
                        <p className="text-sm font-black text-zinc-900 dark:text-white uppercase">{member.name}</p>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{member.role}</p>
                    </div>
                    {member.alerts?.length > 0 && (
                        <span className="text-[9px] font-black px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full">{member.alerts.length} alert{member.alerts.length > 1 ? 's' : ''}</span>
                    )}
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-center hidden sm:block">
                        <p className="text-xl font-black text-blue-600">{member.taskSummary?.total || 0}</p>
                        <p className="text-[9px] font-black text-zinc-400 uppercase">Active</p>
                    </div>
                    <div className="text-center hidden sm:block">
                        <p className="text-xl font-black text-emerald-600">{member.performance?.completionRate || 0}%</p>
                        <p className="text-[9px] font-black text-zinc-400 uppercase">Completion</p>
                    </div>
                    <div className="text-center hidden sm:block">
                        <p className="text-xl font-black text-purple-600">{member.performance?.pointsEarned || 0}</p>
                        <p className="text-[9px] font-black text-zinc-400 uppercase">Points</p>
                    </div>
                    <Link href={`/workspaces/${workspaceSlug}/team-performance/member/${member.id}`}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 h-9 px-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 hover:bg-sada-red hover:text-white transition">
                        <ExternalLink size={11} /> Details
                    </Link>
                    {expanded ? <ChevronUp size={16} className="text-zinc-400 shrink-0" /> : <ChevronDown size={16} className="text-zinc-400 shrink-0" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-zinc-50 dark:border-zinc-800 p-5 bg-zinc-50/50 dark:bg-zinc-800/20">
                    {member.alerts?.map((a: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-3 mb-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl">
                            <AlertTriangle size={12} className="text-red-600 shrink-0" />
                            <p className="text-xs font-bold text-red-700 dark:text-red-400">{a.message}</p>
                        </div>
                    ))}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Done This Week', val: member.taskSummary?.doneThisWeek || 0, color: 'text-emerald-600' },
                            { label: 'In Progress', val: member.taskSummary?.in_progress || 0, color: 'text-blue-600' },
                            { label: 'In Review', val: member.taskSummary?.review || 0, color: 'text-purple-600' },
                            { label: 'Overdue', val: member.taskSummary?.overdue || 0, color: 'text-red-600' },
                        ].map(({ label, val, color }) => (
                            <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">{label}</p>
                                <p className={`text-2xl font-black ${color}`}>{val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function TeamPerformanceIndex({ workspace, dashboardData, projects = [], filters = {}, isManager }: any) {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'tasks' | 'points'>('points');

    // Mencegah error jika dashboardData undefined
    const safeData = dashboardData || {};
    const {
        teamSummary = { totalMembers: 0, activeMembers: 0 },
        taskOverviewStats = { total: 0, completionRate: 0, overdue: 0 },
        productivityMetrics = { completedCurrent: 0, hoursCurrent: 0, taskChange: 0, hoursChange: 0, trend: 'stable', mode: 'week' },
        workloadDistribution = { members: [], overloadedCount: 0, underutilizedCount: 0, needsRebalancing: false },
        teamLeaderboard = [],
        criticalAlerts = { urgent: [], warnings: [] },
        memberDetails = [],
        productivityTrends = [],
        recentActivities = []
    } = safeData;

    const filteredMembers = useMemo(() => {
        return (memberDetails || [])
            .filter((m: any) =>
                m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.email.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a: any, b: any) => {
                if (sortBy === 'name') return a.name.localeCompare(b.name);
                if (sortBy === 'tasks') return (b.taskSummary?.total || 0) - (a.taskSummary?.total || 0);
                return (b.performance?.pointsEarned || 0) - (a.performance?.pointsEarned || 0);
            });
    }, [memberDetails, search, sortBy]);

    const periodLabel = ({ today: 'Today', week: 'This Week', month: 'This Month', custom: 'Custom' } as any)[filters?.period || 'week'] ?? 'This Week';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: workspace?.name || 'Workspace', href: `/workspaces/${workspace?.slug}` },
        { title: 'Team Performance', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Team Performance — ${workspace?.name || 'Workspace'}`} />

            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sada-red font-black tracking-[0.3em] text-[10px] mb-2">
                            <Activity size={12} /> <span>OPERATIONAL INTELLIGENCE</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">Team Performance</h1>
                        <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-wider">{workspace?.name} · {periodLabel}</p>
                    </div>
                </div>

                {/* ── Filters ── */}
                <Filters projects={projects} filters={filters} workspaceSlug={workspace?.slug} />

                {/* ── Top Stats ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Members" value={teamSummary.totalMembers} sub={`${teamSummary.activeMembers} assigned`} />
                    <StatCard label="Total Tasks" value={taskOverviewStats.total} sub={`${taskOverviewStats.completionRate}% done`} />
                    <StatCard label="Completed" value={productivityMetrics.completedCurrent} sub={periodLabel} accent="text-emerald-600" />
                    <StatCard label="Overdue" value={taskOverviewStats.overdue} sub="Needs attention" accent={taskOverviewStats.overdue > 0 ? 'text-red-600' : 'text-zinc-900 dark:text-white'} />
                </div>

                {/* ── Alerts ── */}
                <AlertsSection data={criticalAlerts} />

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    <TaskOverviewGrid data={taskOverviewStats} />
                    <WorkloadChart data={workloadDistribution} />
                    <ProductivityCard data={productivityMetrics} />
                </div>

                {/* ── Trends + Leaderboard ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
                    <div className="lg:col-span-3">
                        <TrendsChart data={productivityTrends} />
                    </div>
                    <div className="lg:col-span-2">
                        <Leaderboard data={teamLeaderboard} workspaceSlug={workspace?.slug} />
                    </div>
                </div>

                {/* ── Member List ── */}
                <div>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
                        <SectionHeader title={`Team Members (${filteredMembers.length})`} sub={workspace?.name} />
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search members..."
                                    className="pl-9 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sada-red/20 w-48 dark:text-white"
                                />
                            </div>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                                className="h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 text-xs font-bold focus:outline-none dark:text-white">
                                <option value="points">Sort: Points</option>
                                <option value="tasks">Sort: Tasks</option>
                                <option value="name">Sort: Name</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {filteredMembers.length > 0
                            ? filteredMembers.map((m: any) => <MemberCard key={m.id} member={m} workspaceSlug={workspace?.slug} />)
                            : (
                                <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-100 dark:border-zinc-800">
                                    <Users size={28} className="mx-auto text-zinc-200 mb-3" />
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-300">No members found</p>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}