import { Head, Link, router, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, CreditCard, Calendar, Clock, Building2, CheckCircle2, XCircle, Ban } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

type Invoice = {
    id: number;
    number: string;
    plan_name: string;
    amount: number;
    formatted_amount: string;
    original_price: number | null;
    plan_duration: number;
    status: 'unpaid' | 'paid' | 'expired' | 'canceled';
    snap_token: string | null;
    payment_reference: string | null;
    payment_method: string | null;
    due_date: string;
    paid_at: string | null;
    is_payable: boolean;
    company: { id: number; name: string } | null;
    plan: { id: number; name: string } | null;
};

type PageProps = {
    invoice: Invoice;
    pageConfig: { title: string; description: string; can_manage: boolean };
};

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

const formatDateTime = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const StatusBadge = ({ status }: { status: Invoice['status'] }) => {
    if (status === 'paid') return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 border border-green-200 px-2.5 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Paid
        </span>
    );
    if (status === 'unpaid') return (
        <span className="inline-flex items-center rounded-md bg-yellow-50 border border-yellow-200 px-2.5 py-1 text-xs font-medium text-yellow-700">
            Unpaid
        </span>
    );
    if (status === 'expired') return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700">
            <XCircle className="h-3.5 w-3.5" /> Expired
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-50 border border-dashed border-zinc-300 px-2.5 py-1 text-xs text-zinc-500">
            <Ban className="h-3.5 w-3.5" /> Canceled
        </span>
    );
};

export default function InvoiceShow({ invoice, pageConfig }: PageProps) {
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth?.user?.roles?.includes('super-admin');

    const breadcrumbs: BreadcrumbItem[] = isSuperAdmin ? [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Product Management', href: '#' },
        { title: 'Invoices', href: route('invoices.index') },
        { title: invoice.number, href: '#' },
    ] : [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Invoices', href: route('invoices.index') },
        { title: invoice.number, href: '#' },
    ];

    const hasDiscount = invoice.original_price !== null && invoice.original_price > invoice.amount;
    const discountAmount = hasDiscount ? invoice.original_price! - invoice.amount : 0;

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this invoice? This action cannot be undone.')) {
            router.patch(route('invoices.cancel', { invoice: invoice.id }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageConfig.title} />

            <div className="flex-1 flex items-start justify-center px-4 py-8 pb-20">
                <div className="w-full max-w-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Invoice Detail</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">{pageConfig.description}</p>
                        </div>
                        <StatusBadge status={invoice.status} />
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
                                    <p className="text-sm font-medium text-foreground mt-0.5">
                                        {invoice.status === 'unpaid' ? 'Awaiting Payment' :
                                        invoice.status === 'paid' ? 'Payment Confirmed' :
                                        invoice.status === 'expired' ? 'Invoice Expired' : 'Invoice Canceled'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bill Date</p>
                                        <p className="text-sm font-medium">{formatDateTime(invoice.due_date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Due Date</p>
                                        <p className="text-sm font-medium">{formatDateTime(invoice.due_date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bill To</p>
                                        <p className="text-sm font-semibold text-foreground">{invoice.company?.name ?? '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-2 grid grid-cols-12">
                                <span className="col-span-7">Item</span>
                                <span className="col-span-2 text-center">Duration</span>
                                <span className="col-span-3 text-right">Amount</span>
                            </div>

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
                        </div>

                        <div className="border-t bg-muted/30 p-6 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono">
                                    {hasDiscount ? formatCurrency(invoice.original_price!) : invoice.formatted_amount}
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
                            <div className="flex items-center justify-between font-bold text-base border-t pt-2 mt-2">
                                <span>Total Due</span>
                                <span className="font-mono text-lg">{invoice.formatted_amount}</span>
                            </div>
                        </div>
                    </div>

                    {invoice.status === 'paid' && (
                        <div className="rounded-xl border bg-card p-5 space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment Info</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Paid At</span>
                                    <span className="font-medium text-green-600">{invoice.paid_at ? formatDateTime(invoice.paid_at) : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Payment Method</span>
                                    <span className="font-medium capitalize">{invoice.payment_method ?? '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Reference</span>
                                    <span className="font-mono text-xs">{invoice.payment_reference ?? '-'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {invoice.is_payable && !isSuperAdmin && (
                        <div className="flex items-center gap-3">
                            <Link href={route('invoices.index')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-input px-5 py-4 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <Link href={route('invoices.create', { invoice: invoice.id })} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                                <CreditCard className="h-4 w-4" /> Pay Now
                            </Link>
                            <button onClick={handleCancel} className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive px-5 py-4 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors">
                                <Ban className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {!invoice.is_payable && (
                        <Link href={route('invoices.index')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-input px-5 py-4 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Back to Invoices
                        </Link>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}