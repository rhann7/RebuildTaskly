import { usePage } from '@inertiajs/react';
import { Page } from '@inertiajs/core';
import AppLogoIcon from './app-logo-icon';

interface SharedProps extends Page {
    auth: {
        user: {
            name: string;
            roles: string[]; // Kita asumsikan Spatie mengirim array roles
            company?: {
                name: string;
            };
            workspace?: {
                name: string;
            };
        } | null;
    };
    [key: string]: any;
}

export default function AppLogo() {
    const { props } = usePage<SharedProps>();
    const { auth } = props;
    const user = auth.user;

    // Logika menentukan Label Berdasarkan Role/Konteks
    const getIdentity = () => {
        if (!user) return { name: 'Sada Taskly', sub: 'Guest Access' };

        // 1. Jika Super Admin / Developer
        if (user.roles?.includes('super-admin')) {
            return { name: 'Sada Central', sub: 'System Architect' };
        }

        // 2. Jika Company Admin
        if (user.company) {
            return { name: user.company.name, sub: 'Company Panel' };
        }

        // 3. Jika Workspace Member
        if (user.workspace) {
            return { name: user.workspace.name, sub: 'Team Workspace' };
        }

        // Default
        return { name: 'Sada Taskly', sub: 'Company Panel' };
    };

    const identity = getIdentity();
    
    return (
       <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo Container: Tanpa Background, Tanpa Border */}
            <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl bg-sada-red text-white  transition-transform duration-300 hover:scale-110">
                <AppLogoIcon className="size-9 fill-current" />
            </div>

            {/* Info Text: Hilang otomatis saat Sidebar Shrink */}
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-2 duration-500">
                <span className="truncate font-black  text-foreground">
                    {identity.name}
                </span>
                <span className="truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    {identity.sub}
                </span>
            </div>
        </div>
    );

}
