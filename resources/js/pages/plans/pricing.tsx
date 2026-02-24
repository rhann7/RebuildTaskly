import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Check, ArrowLeft, Info } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageConfig } from '@/types';

interface Module {
    id: number;
    name: string;
}

interface Plan {
    id: number;
    name: string;
    description: string | null;
    price: number;
    original_price: number | null;
    duration: number;
    modules: Module[];
}

interface PageProps {
    plans: Plan[];
    current_plan_id: number | null;
    pageConfig: PageConfig;
}

const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        maximumFractionDigits: 0 
    }).format(amount);
};

const calculateDiscount = (original: number, price: number) => {
    return Math.round(((original - price) / original) * 100);
};

export default function Pricing({ plans, current_plan_id, pageConfig }: PageProps) {
    const [isYearly, setIsYearly] = useState(false);

    const handleSubscribe = (planId: number, isFree: boolean) => {
        if (isFree) return;

        router.post(route('invoices.store'), { plan_id: planId }, {
            onBefore: () => confirm('Are you sure you want to subscribe to this plan?'),
        });
    };

    const filteredPlans = plans.filter(plan => 
        isYearly ? plan.duration === 365 : plan.duration === 30
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Head title={pageConfig.title} />
            
            <div className="p-6">
                <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
                    <Link href={route('dashboard')}>
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <header className="max-w-4xl mx-auto text-center px-4 pt-4 pb-10">
                <h1 className="text-3xl font-bold tracking-tight">
                    {pageConfig.title}
                </h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed mt-2">
                    {pageConfig.description}
                </p>

                <div className="flex items-center justify-center gap-3 mt-8">
                    <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            isYearly ? 'bg-zinc-900' : 'bg-zinc-200'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                isYearly ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                    <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Yearly
                    </span>
                    {isYearly && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            Save more!
                        </span>
                    )}
                </div>
            </header>

            <main className="flex-1 px-4 pb-20">
                {filteredPlans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {filteredPlans.map((plan) => {
                            const isCurrentPlan = current_plan_id === plan.id;
                            
                            return (
                                <Card key={plan.id} className="flex flex-col border-border bg-card shadow-sm transition-all hover:ring-1 hover:ring-ring">
                                    <CardHeader className="pb-6">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                                        </div>
                                        <CardDescription className="text-xs min-h-[32px] line-clamp-2">
                                            {plan.description || 'Flexible plan for your business needs.'}
                                        </CardDescription>
                                    </CardHeader>
                                    
                                    <CardContent className="flex-1 space-y-8">
                                        <div>
                                            {plan.original_price !== null && plan.original_price !== 0 && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm text-muted-foreground line-through">
                                                        {formatIDR(plan.original_price)}
                                                    </span>
                                                    <span className="text-sm text-green-500">
                                                        -{calculateDiscount(plan.original_price, plan.price)}%
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold">
                                                    {plan.price === 0 ? 'Free' : formatIDR(plan.price)}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold tracking-wide">
                                                Billed every {plan.duration === 365 ? 'year' : 'month'}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
                                                Features & Modules
                                            </p>
                                            <ul className="space-y-2.5">
                                                {plan.modules.length > 0 ? (
                                                    plan.modules.map((mod) => (
                                                        <li key={mod.id} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                            <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                                            <span className="truncate">{mod.name}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-xs text-muted-foreground italic">Standard platform access</li>
                                                )}
                                            </ul>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-6 pb-6 border-t border-border/50 bg-muted/20">
                                        <Button
                                            className="w-full font-bold shadow-sm"
                                            variant={isCurrentPlan ? "secondary" : plan.price === 0 ? "outline" : "default"}
                                            onClick={() => handleSubscribe(plan.id, plan.price === 0)}
                                            disabled={plan.price === 0 || isCurrentPlan}
                                        >
                                            {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Free Plan' : 'Subscribe Now'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                        <p className="text-sm">No {isYearly ? 'yearly' : 'monthly'} plans available at the moment.</p>
                    </div>
                )}

                <div className="mt-16 max-w-xl mx-auto">
                    <div className="flex gap-3 p-4 rounded-lg border border-border bg-muted/30 text-muted-foreground">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">
                            <strong>Note:</strong> Subscription plans do not support downgrading to a free plan once a paid plan is active. 
                            Renewal reminders will be sent <strong>3 days</strong> before expiry.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}