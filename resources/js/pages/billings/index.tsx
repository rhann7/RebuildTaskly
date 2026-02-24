import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { CalendarDays, CreditCard, RefreshCw, ArrowRightLeft, Layers, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Module = {
    name: string;
    description: string;
};

type Subscription = {
    id: number;
    plan_id: number;
    plan_name: string;
    plan_description: string;
    price: number;
    is_free: boolean;
    status: 'active' | 'expired' | 'overridden';
    starts_at: string;
    ends_at: string;
    is_valid: boolean;
    days_left: number;
    modules: Module[];
};

type Company = {
    id: number;
    name: string;
    category: string | null;
};

type PageProps = {
    subscription: Subscription | null;
    company: Company;
    pageConfig: { title: string; description: string; can_manage: boolean };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Billing', href: route('billings') },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export default function BillingsIndex({ subscription, company, pageConfig }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageConfig.title} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">{company.name}</h2>
                        <p className="text-sm text-muted-foreground">{company.category ?? 'Manage your company subscription.'}</p>
                    </div>

                    {subscription && (
                        <div className="flex items-center gap-2">
                            {!subscription.is_free && (
                                <Link href={route('invoices.store')} method="post" data={{ plan_id: subscription.plan_id }} as="button" onBefore={() => confirm('Are you sure you want to renew this plan?')} className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                                    <RefreshCw className="h-4 w-4" />Renew Plan
                                </Link>
                            )}
                            <Link href={route('plans.pricing')} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
                                <ArrowRightLeft className="h-4 w-4" />{subscription.is_free ? 'Upgrade Plan' : 'Change Plan'}
                            </Link>
                        </div>
                    )}
                </div>

                {subscription ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex flex-col gap-3 rounded-xl border bg-background p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CreditCard className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Active Plan</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-foreground">{subscription.plan_name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {subscription.price === 0 ? 'Free' : formatCurrency(subscription.price)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 rounded-xl border bg-background p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Subscription Period</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-foreground">{subscription.ends_at}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Started {subscription.starts_at}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 rounded-xl border bg-background p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Layers className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Available Features</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-foreground">{subscription.modules.length} Modules</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Included in {subscription.plan_name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-4 overflow-hidden rounded-xl border border-sidebar-border/70 bg-background shadow-sm">
                            <div className="border-b border-sidebar-border/70 p-6">
                                <h3 className="font-semibold text-foreground">Features in This Plan</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{subscription.plan_description}</p>
                            </div>

                            <div className="flex flex-1 flex-col p-0">
                                {subscription.modules.length > 0 ? (
                                    <div className="divide-y divide-border">
                                        {subscription.modules.map((mod, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-medium leading-none">{mod.name}</p>
                                                    <p className="text-xs text-muted-foreground">{mod.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-muted-foreground">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                                            <Layers className="h-6 w-6 opacity-50" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground">No modules available</h3>
                                        <p className="text-sm">This plan does not have any active modules yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                            <CreditCard className="h-6 w-6 opacity-50" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No active subscription</h3>
                        <p className="text-sm text-muted-foreground mb-4">Choose a plan to start using all features.</p>
                        <Link href={route('plans.pricing')}>
                            <Button className="gap-2"><ArrowRightLeft className="h-4 w-4" /> View Plans</Button>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}