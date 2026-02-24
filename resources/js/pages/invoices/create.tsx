import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Calendar, Clock, Building2, CheckCircle2, Package } from 'lucide-react';

// ← TAMBAHAN: type Proposal
type Proposal = {
    id: number;
    module_name: string;
    ticket_title: string | null;
    estimated_price: number;
};

type Invoice = {
    id: number;
    number: string;
    plan_name: string;
    amount: number;
    plan_amount: number;    // ← TAMBAHAN
    formatted_amount: string;
    original_price: number | null;
    plan_duration: number;
    status: 'unpaid' | 'paid' | 'expired' | 'canceled';
    snap_token: string | null;
    due_date: string;
    is_payable: boolean;
    proposals: Proposal[]; // ← TAMBAHAN
    company: { id: number; name: string } | null;
    plan: { id: number; name: string } | null;
};

type PageProps = {
    invoice: Invoice;
    pageConfig: { title: string; description: string };
};

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

const formatDateTime = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

export default function InvoiceCreate({ invoice, pageConfig }: PageProps) {
    const handlePay = () => {
        fetch(route('invoices.payment', { invoice: invoice.id }), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'Accept': 'application/json',
            },
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                const token = data.invoice?.snap_token;
                if (token) {
                    (window as any).snap.pay(token, {
                        onSuccess: () => router.visit(route('invoices.show', { invoice: invoice.id })),
                        onPending: () => router.visit(route('invoices.show', { invoice: invoice.id })),
                        onError: () => router.visit(route('invoices.show', { invoice: invoice.id })),
                        onClose: () => console.log('Payment popup closed'),
                    });
                }
            })
            .catch(err => console.error('Payment error:', err));
    };

    const today = new Date();
    const hasDiscount = invoice.original_price !== null && invoice.original_price > invoice.plan_amount;
    const discountAmount = hasDiscount ? invoice.original_price! - invoice.plan_amount : 0;
    const hasAddons = invoice.proposals.length > 0; // ← TAMBAHAN
    const addonTotal = invoice.proposals.reduce((s, p) => s + p.estimated_price, 0); // ← TAMBAHAN

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Head title={pageConfig.title} />

            <div className="p-6">
                <Link href={route('invoices.index')}>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Invoices
                    </button>
                </Link>
            </div>

            <div className="flex-1 flex items-start justify-center px-4 pb-20">
                <div className="w-full max-w-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Review Invoice</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">{pageConfig.description}</p>
                        </div>
                        <span className="inline-flex items-center rounded-md bg-yellow-50 border border-yellow-200 px-2.5 py-1 text-xs font-medium text-yellow-700">
                            Unpaid
                        </span>
                    </div>

                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="border-b p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Invoice Number</p>
                                    <p className="font-mono font-bold text-lg text-foreground mt-0.5">{invoice.number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                                    <p className="text-sm font-medium text-foreground mt-0.5">Awaiting Payment</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bill Date</p>
                                        <p className="text-sm font-medium">{formatDate(today.toISOString())}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Due Date</p>
                                        <p className="text-sm font-medium">{formatDateTime(invoice.due_date)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-b p-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                <Building2 className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Bill To</span>
                            </div>
                            <p className="font-semibold text-foreground">{invoice.company?.name ?? '-'}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-2 grid grid-cols-12">
                                <span className="col-span-7">Item</span>
                                <span className="col-span-2 text-center">Duration</span>
                                <span className="col-span-3 text-right">Amount</span>
                            </div>

                            {/* Baris subscription plan — sama persis seperti sebelumnya */}
                            <div className="grid grid-cols-12 items-center py-2">
                                <div className="col-span-7">
                                    <p className="font-medium text-sm text-foreground">{invoice.plan_name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Subscription plan — {invoice.plan_duration === 365 ? 'Yearly' : 'Monthly'} billing
                                    </p>
                                </div>
                                <div className="col-span-2 text-center">
                                    <p className="text-sm text-muted-foreground">{invoice.plan_duration} days</p>
                                </div>
                                <div className="col-span-3 text-right">
                                    <p className="font-mono font-semibold text-sm">{formatCurrency(invoice.original_price!)}</p>
                                </div>
                            </div>

                            {/* ← TAMBAHAN: baris add-on per proposal */}
                            {hasAddons && invoice.proposals.map((proposal) => (
                                <div key={proposal.id} className="grid grid-cols-12 items-center py-2 border-t border-dashed border-border/50">
                                    <div className="col-span-7">
                                        <div className="flex items-center gap-1.5">
                                            <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <p className="font-medium text-sm text-foreground">{proposal.module_name}</p>
                                        </div>
                                        {proposal.ticket_title && (
                                            <p className="text-xs text-muted-foreground mt-0.5 ml-5">Ref: {proposal.ticket_title}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-0.5 ml-5">Add-on module</p>
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <p className="text-sm text-muted-foreground">—</p>
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <p className="font-mono font-semibold text-sm">{formatCurrency(proposal.estimated_price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t bg-muted/30 p-6 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono">
                                    {hasDiscount ? formatCurrency(invoice.original_price!) : formatCurrency(invoice.plan_amount)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                {hasDiscount ? (
                                    <span className="font-mono text-green-500">-{formatCurrency(discountAmount)}</span>
                                ) : (
                                    <span className="font-mono">Rp0</span>
                                )}
                            </div>
                            {/* ← TAMBAHAN: baris add-on total jika ada */}
                            {hasAddons && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Add-on Modules ({invoice.proposals.length})</span>
                                    <span className="font-mono">+{formatCurrency(addonTotal)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between font-bold text-base border-t pt-2 mt-2">
                                <span>Total Due</span>
                                <span className="font-mono text-lg">{invoice.formatted_amount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5 space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">What You Get</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            <span>Access to <strong className="text-foreground">{invoice.plan_name}</strong> for <strong className="text-foreground">{invoice.plan_duration} days</strong></span>
                        </div>
                        {/* ← TAMBAHAN: list add-on */}
                        {hasAddons && invoice.proposals.map((proposal) => (
                            <div key={proposal.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                <span><strong className="text-foreground">{proposal.module_name}</strong> add-on — already active, billed this cycle</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            <span>Subscription starts immediately after payment is confirmed</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            <span>Invoice valid until <strong className="text-foreground">{formatDateTime(invoice.due_date)}</strong></span>
                        </div>
                    </div>

                    {invoice.is_payable && (
                        <button onClick={handlePay} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                            <CreditCard className="h-4 w-4" /> Proceed to Payment
                        </button>
                    )}

                    <p className="text-center text-xs text-muted-foreground pb-4">
                        Payment is securely processed by Midtrans. This invoice will expire in 24 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}
