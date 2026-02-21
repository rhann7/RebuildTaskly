import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { AlertTriangle, LogOut } from 'lucide-react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { auth } = usePage().props as any;

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
                            KELUAR
                        </Link>
                    </div>
                )}
            </AppLayoutTemplate>
        </div>
    );
};