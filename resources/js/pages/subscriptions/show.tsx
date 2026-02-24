import { Link } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem } from '@/types';
import { ArrowLeft, Building2, CreditCard, CalendarDays, Receipt } from 'lucide-react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Subscription = {
    id: number;
    plan_name: string;
    status: 'active' | 'expired' | 'overridden';
    starts_at: string;
    ends_at: string;
    is_valid: boolean;
    company: { id: number; name: string } | null;
    plan: { id: number; name: string } | null;
    invoice: { id: number; number: string } | null;
};

type PageProps = {
    subscription: Subscription;
    pageConfig: PageConfig;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Subscription Management', href: route('product-management.subscriptions.index') },
    { title: 'Detail', href: '#' },
];

const StatusBadge = ({ status }: { status: Subscription['status'] }) => {
    if (status === 'active') return (
        <span className="inline-flex items-center gap-1 rounded-md bg-green-50 border border-green-200 px-2.5 py-1 text-xs font-medium text-green-700">Active</span>
    );
    if (status === 'expired') return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700">Expired</span>
    );
    return (
        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-50 border border-dashed border-zinc-300 px-2.5 py-1 text-xs text-zinc-500">Overridden</span>
    );
};

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

export default function SubscriptionShow({ subscription, pageConfig }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageConfig.title} />

            <div className="px-4 py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">{pageConfig.title}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">{pageConfig.description}</p>
                    </div>
                    <Link href={route('product-management.subscriptions.index')}>
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border bg-card p-5 space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Company</span>
                        </div>
                        <p className="text-lg font-semibold text-foreground">{subscription.company?.name ?? '-'}</p>
                    </div>

                    <div className="rounded-lg border bg-card p-5 space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Plan</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-semibold text-foreground">{subscription.plan_name}</p>
                            <StatusBadge status={subscription.status} />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-5 space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Subscription Period</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Start</span>
                                <span className="font-medium">{formatDate(subscription.starts_at)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">End</span>
                                <span className="font-medium">{formatDate(subscription.ends_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-5 space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Receipt className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Invoice</span>
                        </div>
                        {subscription.invoice ? (
                            <Link href={route('invoices.show', { invoice: subscription.invoice?.id })}>
                                <p className="font-mono text-sm font-medium text-foreground hover:underline">
                                    {subscription.invoice.number}
                                </p>
                            </Link>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No invoice — Free Plan</p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}