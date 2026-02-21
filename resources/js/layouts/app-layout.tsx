import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { AlertTriangle, AlertCircle, LogOut, CreditCard } from 'lucide-react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { auth } = usePage().props as any;
    const sub = auth?.user?.company?.subscription;

    return (
        <div className="relative flex min-h-screen flex-col">
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            
                {auth?.is_impersonating && (
                    <div className="bg-orange-600 text-white px-4 py-4 flex justify-between items-center z-[100] sticky top-0 shadow-md border-b border-orange-700">
                        <div className="text-sm font-bold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-200" />
                            <span>Mode Penyamaran: <span className="font-normal opacity-90">Login sebagai</span> {auth.user.name}</span>
                        </div>
                        <Link 
                            href="/impersonate/leave" 
                            className="flex items-center gap-1.5 bg-white text-orange-600 px-3 py-1 rounded font-bold text-xs hover:bg-orange-50 transition-colors shadow-sm"
                        >
                            <LogOut className="h-3 w-3" />
                            Keluar
                        </Link>
                    </div>
                )}

                {sub && (!sub.is_active || sub.is_expiring) && (
                    <div className={`px-4 py-2 flex justify-between items-center z-[90] sticky ${auth?.is_impersonating ? 'top-[52px]' : 'top-0'} shadow-sm border-b transition-all ${
                        !sub.is_active 
                            ? 'bg-red-600 border-red-700 text-white' 
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                            <AlertCircle className={`h-4 w-4 ${!sub.is_active ? 'text-red-200' : 'text-amber-500'}`} />
                            {!sub.is_active ? (
                                <span>Masa langganan <strong>{sub.plan_name}</strong> telah habis. Segera perbarui untuk mengakses fitur.</span>
                            ) : (
                                <span>Masa langganan akan habis dalam <strong>{sub.remaining_days} hari</strong> ({sub.ends_at}).</span>
                            )}
                        </div>
                        <Link 
                            href="/billing"
                            className={`flex items-center gap-1 px-3 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                                !sub.is_active 
                                    ? 'bg-white text-red-600 hover:bg-red-50' 
                                    : 'bg-amber-600 text-white hover:bg-amber-700'
                            }`}
                        >
                            <CreditCard className="h-3 w-3" />
                            {!sub.is_active ? 'Perbarui Sekarang' : 'Langganan Kembali'}
                        </Link>
                    </div>
                )}
            </AppLayoutTemplate>
        </div>
    );
};