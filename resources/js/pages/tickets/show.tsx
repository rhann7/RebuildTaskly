import { useState } from 'react';
import { useForm, usePage, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    ChevronLeft, Send, Clock, CheckCircle2, XCircle,
    User, Tag, CalendarDays, Zap, AlertTriangle, CreditCard,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Message = {
    id: number;
    message: string;
    created_at: string;
    user: { id: number; name: string };
};

type History = {
    id: number;
    from_status: string | null;
    to_status: string;
    note: string | null;
    created_at: string;
    changed_by: { id: number; name: string };
};

type Proposal = {
    id: number;
    estimated_price: number;
    estimated_days: number;
    module_id: number;
    status: 'pending' | 'approved' | 'rejected';
    approved_at: string | null;
    invoice_add_on: {
        id: number;
        number: string;
        amount: number;
        status: string;
        snap_token: string | null;
        due_date: string;
    } | null;
};

type Ticket = {
    id: number;
    code: string;
    title: string;
    description: string;
    type: 'feature_request' | 'bug_report';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'review' | 'resolved' | 'closed';
    created_at: string;
    resolved_at: string | null;
    closed_at: string | null;
    company: { id: number; name: string } | null;
    assignee: { id: number; name: string } | null;
    messages: Message[];
    histories: History[];
    proposal: Proposal | null;
};

type AddonModule = {
    id: number;
    name: string;
    price: number;
    price_fmt: string;
    scope: string;
};

type PageProps = {
    ticket: Ticket;
    addonModules: AddonModule[];
    pageConfig: { title: string; description: string; can_manage: boolean };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const fmtDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtCurrency = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n);

const STATUS_LABELS: Record<string, string> = {
    open: 'Open', in_progress: 'In Progress', review: 'Review',
    resolved: 'Resolved', closed: 'Closed',
};

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        open:        'bg-blue-50 border border-blue-200 text-blue-700',
        in_progress: 'bg-yellow-50 border border-yellow-200 text-yellow-700',
        review:      'bg-purple-50 border border-purple-200 text-purple-700',
        resolved:    'bg-green-50 border border-green-200 text-green-700',
        closed:      'bg-zinc-50 border border-dashed border-zinc-300 text-zinc-500',
    };
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${map[status] ?? 'bg-zinc-100 text-zinc-600'}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
    const map: Record<string, string> = {
        low:      'bg-zinc-100 text-zinc-600',
        medium:   'bg-blue-100 text-blue-700',
        high:     'bg-orange-100 text-orange-700',
        critical: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${map[priority] ?? ''}`}>
            {priority}
        </span>
    );
};

// ---------------------------------------------------------------------------
// Section: Message Thread
// ---------------------------------------------------------------------------

function MessageThread({ ticket, currentUserId }: { ticket: Ticket; currentUserId: number }) {
    const { data, setData, post, processing, reset } = useForm({ message: '' });

    const send = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tickets.message', { ticket: ticket.id }), {
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Messages</h3>

            {/* Messages */}
            <div className="flex flex-col gap-3">
                {ticket.messages.length === 0 && (
                    <p className="text-xs text-muted-foreground">No messages yet. Start the conversation.</p>
                )}
                {ticket.messages.map((msg) => {
                    const isMe = msg.user.id === currentUserId;
                    return (
                        <div key={msg.id} className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {msg.message}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                                {msg.user.name} · {fmt(msg.created_at)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Reply form - hide if closed */}
            {ticket.status !== 'closed' && (
                <form onSubmit={send} className="flex gap-2 items-end mt-1">
                    <Textarea
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        placeholder="Write a message..."
                        rows={2}
                        className="resize-none flex-1 text-sm"
                    />
                    <Button type="submit" size="icon" disabled={processing || !data.message.trim()} className="h-10 w-10 shrink-0">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Section: Proposal (admin sends / company approves)
// ---------------------------------------------------------------------------

function ProposalSection({ ticket, isSuperAdmin, addonModules }: { ticket: Ticket; isSuperAdmin: boolean; addonModules: AddonModule[] }) {
    const proposalForm = useForm({
        estimated_price: '',
        estimated_days: '',
        module_id: '',
    });

    const [payLoading, setPayLoading] = useState(false);

    const submitProposal = (e: React.FormEvent) => {
        e.preventDefault();
        proposalForm.post(route('tickets.proposal.store', { ticket: ticket.id }));
    };

    const approveProposal = () => {
        router.post(route('tickets.proposal.approve', { ticket: ticket.id }));
    };

    const handlePay = async () => {
        if (!ticket.proposal?.invoice_add_on) return;
        setPayLoading(true);
        try {
            const res = await fetch(route('payments.addon.pay', { invoiceAddOn: ticket.proposal.invoice_add_on.id }), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '', 'Accept': 'application/json' },
            });
            const json = await res.json();
            // @ts-ignore
            window.snap.pay(json.snap_token, {
                onSuccess: () => router.reload(),
                onClose: () => setPayLoading(false),
            });
        } catch {
            setPayLoading(false);
        }
    };

    if (ticket.type !== 'feature_request') return null;

    const proposal = ticket.proposal;
    const invoice  = proposal?.invoice_add_on;

    // Auto-fill harga saat module dipilih
    const handleModuleSelect = (moduleId: string) => {
        proposalForm.setData('module_id', moduleId);
        const selected = addonModules.find((m) => String(m.id) === moduleId);
        if (selected) proposalForm.setData('estimated_price', String(selected.price));
    };

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Proposal</h3>

            {/* No proposal yet — admin can create */}
            {!proposal && isSuperAdmin && ticket.status === 'in_progress' && (
                <form onSubmit={submitProposal} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground">Send a cost & time estimate to the company.</p>

                    {/* Module selector */}
                    <div className="space-y-1">
                        <Label className="text-xs">Add-on Module</Label>
                        {addonModules.length === 0 ? (
                            <p className="text-xs text-destructive">No active add-on modules available. Please create one first in Module Management.</p>
                        ) : (
                            <Select
                                value={proposalForm.data.module_id}
                                onValueChange={handleModuleSelect}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select a module..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {addonModules.map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)} className="text-xs">
                                            <span className="font-medium">{m.name}</span>
                                            <span className="ml-2 text-muted-foreground">{m.price_fmt}</span>
                                            <span className="ml-1 text-muted-foreground capitalize">· {m.scope}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {proposalForm.errors.module_id && (
                            <p className="text-xs text-destructive">{proposalForm.errors.module_id}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Estimated Price (Rp)</Label>
                            <Input
                                type="number"
                                value={proposalForm.data.estimated_price}
                                onChange={(e) => proposalForm.setData('estimated_price', e.target.value)}
                                placeholder="Auto-filled from module"
                            />
                            {proposalForm.errors.estimated_price && (
                                <p className="text-xs text-destructive">{proposalForm.errors.estimated_price}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Estimated Days</Label>
                            <Input
                                type="number"
                                value={proposalForm.data.estimated_days}
                                onChange={(e) => proposalForm.setData('estimated_days', e.target.value)}
                                placeholder="e.g. 7"
                            />
                            {proposalForm.errors.estimated_days && (
                                <p className="text-xs text-destructive">{proposalForm.errors.estimated_days}</p>
                            )}
                        </div>
                    </div>
                    <Button type="submit" size="sm" disabled={proposalForm.processing || !proposalForm.data.module_id}>
                        Send Proposal
                    </Button>
                </form>
            )}

            {/* Proposal exists */}
            {proposal && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Estimated Cost</p>
                            <p className="font-semibold">{fmtCurrency(proposal.estimated_price)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Estimated Duration</p>
                            <p className="font-semibold">{proposal.estimated_days} days</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Proposal status:</span>
                        <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-md ${
                            proposal.status === 'approved' ? 'bg-green-50 text-green-700'
                            : proposal.status === 'rejected' ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>{proposal.status}</span>
                    </div>

                    {/* Company user: approve */}
                    {!isSuperAdmin && proposal.status === 'pending' && (
                        <Alert className="border-blue-200 bg-blue-50">
                            <AlertDescription className="text-sm text-blue-800 flex items-center justify-between gap-3">
                                <span>Review the proposal and approve to proceed with payment.</span>
                                <Button size="sm" onClick={approveProposal}>
                                    Approve & Continue
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Invoice add-on payment */}
                    {invoice && invoice.status === 'unpaid' && !isSuperAdmin && (
                        <Alert className="border-orange-200 bg-orange-50">
                            <CreditCard className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-sm text-orange-800 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium">Invoice {invoice.number}</p>
                                    <p className="text-xs">Amount: {fmtCurrency(invoice.amount)} · Due: {fmtDate(invoice.due_date)}</p>
                                </div>
                                <Button size="sm" onClick={handlePay} disabled={payLoading}>
                                    {payLoading ? 'Loading...' : 'Pay Now'}
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    {invoice && invoice.status === 'paid' && (
                        <div className="flex items-center gap-2 text-xs text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Payment confirmed. Module has been activated.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Section: Status History
// ---------------------------------------------------------------------------

function StatusHistorySection({ histories }: { histories: History[] }) {
    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Activity</h3>
            <ol className="relative border-l border-border ml-2 space-y-3">
                {histories.map((h) => (
                    <li key={h.id} className="pl-4 relative">
                        <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-background bg-muted-foreground/40" />
                        <p className="text-xs text-foreground">
                            <span className="font-medium">{h.changed_by.name}</span> changed status
                            {h.from_status && <> from <StatusBadge status={h.from_status} /></>} to <StatusBadge status={h.to_status} />
                        </p>
                        {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                        <p className="text-[10px] text-muted-foreground mt-0.5">{fmt(h.created_at)}</p>
                    </li>
                ))}
            </ol>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Tickets', href: route('tickets.index') },
    { title: 'Detail', href: '#' },
];

export default function TicketShow({ ticket, addonModules, pageConfig }: PageProps) {
    const { auth } = usePage().props as any;
    const isSuperAdmin: boolean = auth?.user?.roles?.includes('super-admin');
    const currentUserId: number = auth?.user?.id;

    const statusForm = useForm({ status: ticket.status, note: '' });

    const updateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        statusForm.patch(route('tickets.status', { ticket: ticket.id }));
    };

    const assignSelf = () => {
        router.post(route('tickets.assign', { ticket: ticket.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Back */}
                <Link href={route('tickets.index')} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Tickets
                </Link>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* --------------------------------------------------------
                        Left: Main content
                    -------------------------------------------------------- */}
                    <div className="xl:col-span-2 flex flex-col gap-6">
                        {/* Ticket header */}
                        <div className="rounded-xl border bg-card p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                    <span className="font-mono text-xs text-muted-foreground">{ticket.code}</span>
                                    <h1 className="text-xl font-semibold mt-1">{ticket.title}</h1>
                                </div>
                                <StatusBadge status={ticket.status} />
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                            <div className="flex flex-wrap gap-3 pt-1">
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Tag className="h-3.5 w-3.5" />
                                    {ticket.type === 'feature_request' ? 'Feature Request' : 'Bug Report'}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Zap className="h-3.5 w-3.5" />
                                    <PriorityBadge priority={ticket.priority} />
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <User className="h-3.5 w-3.5" />
                                    {ticket.company?.name ?? '-'}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {fmtDate(ticket.created_at)}
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="rounded-xl border bg-card p-5">
                            <MessageThread ticket={ticket} currentUserId={currentUserId} />
                        </div>

                        {/* Proposal (feature_request only) */}
                        {ticket.type === 'feature_request' && (
                            <div className="rounded-xl border bg-card p-5">
                                <ProposalSection ticket={ticket} isSuperAdmin={isSuperAdmin} addonModules={addonModules} />
                            </div>
                        )}
                    </div>

                    {/* --------------------------------------------------------
                        Right: Sidebar
                    -------------------------------------------------------- */}
                    <div className="flex flex-col gap-4">
                        {/* Admin actions */}
                        {isSuperAdmin && (
                            <div className="rounded-xl border bg-card p-4 space-y-4">
                                <h3 className="text-sm font-semibold">Admin Actions</h3>

                                {/* Assign to self */}
                                {!ticket.assignee && (
                                    <Button size="sm" className="w-full" onClick={assignSelf}>
                                        Assign to Me
                                    </Button>
                                )}
                                {ticket.assignee && (
                                    <p className="text-xs text-muted-foreground">
                                        Assigned to: <span className="font-medium text-foreground">{ticket.assignee.name}</span>
                                    </p>
                                )}

                                <Separator />

                                {/* Update status */}
                                <form onSubmit={updateStatus} className="space-y-2">
                                    <Label className="text-xs">Update Status</Label>
                                    <Select
                                        value={statusForm.data.status}
                                        onValueChange={(v) => statusForm.setData('status', v as any)}
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(STATUS_LABELS).map(([v, l]) => (
                                                <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        value={statusForm.data.note}
                                        onChange={(e) => statusForm.setData('note', e.target.value)}
                                        placeholder="Optional note..."
                                        className="h-8 text-xs"
                                    />
                                    <Button type="submit" size="sm" className="w-full" disabled={statusForm.processing}>
                                        Update Status
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Details card */}
                        <div className="rounded-xl border bg-card p-4 space-y-3">
                            <h3 className="text-sm font-semibold">Details</h3>
                            <dl className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Status</dt>
                                    <dd><StatusBadge status={ticket.status} /></dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Priority</dt>
                                    <dd><PriorityBadge priority={ticket.priority} /></dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Assignee</dt>
                                    <dd className="font-medium">{ticket.assignee?.name ?? 'Unassigned'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Created</dt>
                                    <dd>{fmtDate(ticket.created_at)}</dd>
                                </div>
                                {ticket.resolved_at && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Resolved</dt>
                                        <dd>{fmtDate(ticket.resolved_at)}</dd>
                                    </div>
                                )}
                                {ticket.closed_at && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Closed</dt>
                                        <dd>{fmtDate(ticket.closed_at)}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Activity history */}
                        <div className="rounded-xl border bg-card p-4">
                            <StatusHistorySection histories={ticket.histories} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
