import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { type BreadcrumbItem, PageConfig, PaginatedData } from '@/types';
import { Search, Eye, Plus } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Ticket = {
    id: number;
    code: string;
    title: string;
    type: 'feature_request' | 'bug_report';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'review' | 'resolved' | 'closed';
    created_at: string;
    resolved_at: string | null;
    company: { id: number; name: string } | null;
    assignee: { id: number; name: string } | null;
};

type PageProps = {
    tickets: PaginatedData<Ticket>;
    filters: { search?: string; status?: string; type?: string };
    pageConfig: PageConfig;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const StatusBadge = ({ status }: { status: Ticket['status'] }) => {
    const map: Record<Ticket['status'], { label: string; className: string }> = {
        open:        { label: 'Open',        className: 'bg-blue-50 border border-blue-200 text-blue-700' },
        in_progress: { label: 'In Progress', className: 'bg-yellow-50 border border-yellow-200 text-yellow-700' },
        review:      { label: 'Review',      className: 'bg-purple-50 border border-purple-200 text-purple-700' },
        resolved:    { label: 'Resolved',    className: 'bg-green-50 border border-green-200 text-green-700' },
        closed:      { label: 'Closed',      className: 'bg-zinc-50 border border-dashed border-zinc-300 text-zinc-500' },
    };
    const s = map[status] ?? { label: status, className: 'bg-zinc-50 border border-zinc-200 text-zinc-500' };
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${s.className}`}>
            {s.label}
        </span>
    );
};

const PriorityBadge = ({ priority }: { priority: Ticket['priority'] }) => {
    const map: Record<Ticket['priority'], { label: string; className: string }> = {
        low:      { label: 'Low',      className: 'bg-zinc-100 text-zinc-600' },
        medium:   { label: 'Medium',   className: 'bg-blue-100 text-blue-700' },
        high:     { label: 'High',     className: 'bg-orange-100 text-orange-700' },
        critical: { label: 'Critical', className: 'bg-red-100 text-red-700' },
    };
    const p = map[priority];
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${p.className}`}>
            {p.label}
        </span>
    );
};

const TypeBadge = ({ type }: { type: Ticket['type'] }) =>
    type === 'feature_request'
        ? <span className="text-xs text-violet-600 font-medium">Feature Request</span>
        : <span className="text-xs text-rose-600 font-medium">Bug Report</span>;

// ---------------------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------------------

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Tickets', href: route('tickets.index') },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TicketIndex({ tickets, filters, pageConfig }: PageProps) {
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth?.user?.roles?.includes('super-admin');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleFilter = (key: string, value: string) => {
        const params: any = { ...filters, search: searchQuery, [key]: value };
        Object.keys(params).forEach(k => { if (params[k] === 'all' || !params[k]) delete params[k]; });
        router.get(route('tickets.index'), params, { preserveState: true, replace: true });
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2 flex-wrap">
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search code or title..."
                    className="pl-9 bg-background h-9 border-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilter('search', searchQuery)}
                />
            </div>
            <Select value={filters.type || 'all'} onValueChange={(v) => handleFilter('type', v)}>
                <SelectTrigger className="w-[160px] h-9 bg-background">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                </SelectContent>
            </Select>
            <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v)}>
                <SelectTrigger className="w-[140px] h-9 bg-background">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
            </Select>
            {!isSuperAdmin && (
                <Link href={route('tickets.create')}>
                    <Button size="sm" className="h-9 gap-1.5">
                        <Plus className="h-4 w-4" />
                        New Ticket
                    </Button>
                </Link>
            )}
        </div>
    );

    return (
        <ResourceListLayout
            title={pageConfig.title}
            description={pageConfig.description}
            breadcrumbs={breadcrumbs}
            filterWidget={FilterWidget}
            pagination={tickets}
            isEmpty={tickets.data.length === 0}
        >
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableHead className="w-[50px] text-center">#</TableHead>
                        <TableHead>Code</TableHead>
                        {isSuperAdmin && <TableHead>Company</TableHead>}
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right px-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.data.map((ticket, i) => (
                        <TableRow key={ticket.id} className="group hover:bg-muted/30">
                            <TableCell className="text-center text-muted-foreground tabular-nums">{tickets.from + i}</TableCell>
                            <TableCell>
                                <span className="font-mono text-xs font-medium">{ticket.code}</span>
                            </TableCell>
                            {isSuperAdmin && (
                                <TableCell>
                                    <span className="text-sm">{ticket.company?.name ?? '-'}</span>
                                </TableCell>
                            )}
                            <TableCell>
                                <span className="text-sm font-medium line-clamp-1 max-w-[200px]">{ticket.title}</span>
                            </TableCell>
                            <TableCell>
                                <TypeBadge type={ticket.type} />
                            </TableCell>
                            <TableCell>
                                <PriorityBadge priority={ticket.priority} />
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={ticket.status} />
                            </TableCell>
                            <TableCell>
                                <span className="text-xs text-muted-foreground">{ticket.assignee?.name ?? '-'}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs text-muted-foreground">{formatDate(ticket.created_at)}</span>
                            </TableCell>
                            <TableCell className="text-right px-6">
                                <Link href={route('tickets.show', { ticket: ticket.id })}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Detail">
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ResourceListLayout>
    );
}
