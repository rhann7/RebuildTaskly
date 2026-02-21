import { Head, Link } from '@inertiajs/react';
import { Check, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Module {
    id: number;
    name: string;
}

interface Plan {
    id: number;
    name: string;
    description: string | null;
    price: number;
    duration: number;
    modules: Module[];
}

interface PageProps {
    plans: Plan[];
    pageConfig: {
        title: string;
        description: string;
    };
}

const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        maximumFractionDigits: 0 
    }).format(amount);
};

export default function Pricing({ plans, pageConfig }: PageProps) {
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

            <header className="max-w-4xl mx-auto text-center px-4 pt-4 pb-16">
                <h1 className="text-3xl font-bold tracking-tight mb-3">
                    {pageConfig.title}
                </h1>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
                    {pageConfig.description}
                </p>
            </header>

            <main className="flex-1 px-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <Card key={plan.id} className="flex flex-col border-border bg-card shadow-sm transition-all hover:ring-1 hover:ring-ring">
                            <CardHeader className="pb-6">
                                <div className="flex justify-between items-start mb-2">
                                    <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                                    {plan.duration === 365 && (
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                                            Yearly
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="text-xs min-h-[32px] line-clamp-2">
                                    {plan.description || 'Flexible plan for your business needs.'}
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="flex-1 space-y-8">
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold">
                                            {plan.price === 0 ? 'Free' : formatIDR(plan.price)}
                                        </span>
                                        <span className="text-muted-foreground text-xs font-medium lowercase">
                                            /{plan.duration === 365 ? 'yr' : 'mo'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold tracking-wide">
                                        Billed every {plan.duration} days
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
                                    variant={plan.price === 0 ? "outline" : "default"}
                                    asChild
                                >
                                    <a href="#">
                                        {plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

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