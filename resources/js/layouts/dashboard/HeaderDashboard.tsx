import { usePage } from '@inertiajs/react';
import { Page } from '@inertiajs/core'; // Gunakan import yang lebih bersih

// Definisikan interface agar reusable
interface DashboardProps extends Page {
    auth: {
        user: {
            name: string;
            email: string;
            company?: { name: string };
            roles?: string[];
        };
        permissions: string[];
    };
    [key: string]: unknown;
}

export const HeaderDashboard = () => {
    // Hook HARUS dipanggil di dalam fungsi komponen
    const { props } = usePage<DashboardProps>();
    const { auth } = props;

    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Welcome Back, {auth.user.name}! 👋
                </h1>
                <p className="text-sm text-muted-foreground">
                    Here's what's happening with <span className="font-medium text-foreground">{auth.user.company?.name || 'your company'}</span> today.
                </p>
            </div>

            {/* Kamu bisa tambah tombol aksi cepat di sini jika perlu */}
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-sada-red">
                        {auth.user.roles?.[0] || 'Member'}
                    </span>
                    <span className="text-[10px] text-muted-foreground italic">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>
        </div>
    );
};