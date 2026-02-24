import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { AlertTriangle, LogOut, Clock, XCircle, RefreshCw } from 'lucide-react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

interface Subscription {
    status: 'active' | 'expired' | 'overridden';
    ends_at: string;
    days_left: number;
    plan_name: string;
    is_free: boolean;
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { auth, subscription } = usePage().props as any;
    const sub = subscription as Subscription | null;

    const showWarning = sub && sub.status === 'active' && sub.days_left <= 3 && sub.days_left >= 0;
    const showExpired = !sub || sub.status === 'expired';

    return (
        <div className="relative flex min-h-screen flex-col">
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>

                {auth?.is_impersonating && (
                    <div className="bg-orange-600 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-[100] shadow-md border-b border-orange-700">
                        <div className="text-sm font-bold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-200 shrink-0" />
                            <span>
                                Impersonation Mode:{' '}
                                <span className="font-normal opacity-90">You are viewing as</span>{' '}
                                {auth.user.name}
                            </span>
                        </div>
                        <Link href="/impersonate/leave" className="flex items-center gap-1.5 bg-white text-orange-600 px-3 py-1 rounded font-bold text-xs hover:bg-orange-50 transition-colors shadow-sm">
                            <LogOut className="h-3 w-3" />Leave
                        </Link>
                    </div>
                )}

                {!auth?.is_impersonating && showWarning && (
                    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-yellow-800">
                            <Clock className="h-4 w-4 shrink-0 text-yellow-600" />
                            <span className="text-sm">
                                Your <strong>{sub!.plan_name}</strong> subscription expires in{' '}
                                <strong>{sub!.days_left} {sub!.days_left === 1 ? 'day' : 'days'}</strong>.{' '}
                                {sub.is_free ? 'Upgrade your plan to continue accessing features.' : 'Renew now to avoid interruption.'}
                            </span>
                        </div>
                        <Link href={route('billings')} className="flex items-center gap-1.5 bg-yellow-600 text-white px-3 py-1 rounded font-bold text-xs hover:bg-yellow-700 transition-colors shadow-sm shrink-0 ml-4">
                            <RefreshCw className="h-3 w-3" />{sub!.is_free ? 'Upgrade' : 'Renew'}
                        </Link>
                    </div>
                )}

                {!auth?.is_impersonating && showExpired && !auth?.user?.roles?.includes('super-admin') && (
                    <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-red-800">
                            <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                            <span className="text-sm">
                                Your subscription has <strong>expired</strong>. Access to features is restricted until you renew or upgrade your plan.
                            </span>
                        </div>
                        <Link href={route('billings')} className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1 rounded font-bold text-xs hover:bg-red-700 transition-colors shadow-sm shrink-0 ml-4">
                            <RefreshCw className="h-3 w-3" />View Billings
                        </Link>
                    </div>
                )}

                {children}

            </AppLayoutTemplate>
        </div>
    );
};