import { usePage } from '@inertiajs/react';
import { Page } from '@inertiajs/core';

interface DashboardProps extends Page {
    auth: {
        user: {
            name: string;
            email: string;
            company?: { name: string };
            roles?: string[];
        };
    };
    [key: string]: any;
}

export const HeaderDashboard = () => {
    const { props } = usePage<DashboardProps>();
    const { auth } = props;
    
    const role = auth.user.roles?.[0] || 'member';

    // Logika kustomisasi per Role
    const getRoleContent = () => {
        switch (role.toLowerCase()) {
            case 'super-admin':
                return {
                    greeting: "System Overview",
                    sub: "Monitoring overall platform health and company registrations.",
                    badgeColor: "text-purple-500 bg-purple-500/10 border-purple-500/20"
                };
            case 'owner':
                return {
                    greeting: `Hello, Chief ${auth.user.name.split(' ')[0]}!`,
                    sub: `Tracking ${auth.user.company?.name || 'your company'}'s growth and operations.`,
                    badgeColor: "text-sada-red bg-sada-red/10 border-sada-red/20"
                };
            case 'manager':
                return {
                    greeting: `Ready to Lead, ${auth.user.name.split(' ')[0]}?`,
                    sub: "Review your team's timesheets and project progress.",
                    badgeColor: "text-blue-500 bg-blue-500/10 border-blue-500/20"
                };
            default: // Member
                return {
                    greeting: `Welcome Back, ${auth.user.name.split(' ')[0]}! 👋`,
                    sub: `Here's what you're working on today at ${auth.user.company?.name || 'SADA'}.`,
                    badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                };
        }
    };

    const content = getRoleContent();

    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-foreground  ">
                    {content.greeting}
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                    {content.sub}
                </p>
            </div>

            <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black  tracking-[0.2em] px-2 py-0.5 rounded-md border ${content.badgeColor}`}>
                        {role.replace('-', ' ')}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold mt-1  tracking-tighter opacity-60">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </div>
        </div>
    );
};