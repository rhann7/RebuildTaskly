import { User, Briefcase, Trash2 } from 'lucide-react';

export const getTeamColumns = () => [
    {
        title: "Personnel",
        data: null,
        render: (data: any) => `
            <div class="flex items-center gap-3 group">
                <div class="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-sada-red group-hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                    <p class="font-bold text-foreground text-[12px] uppercase tracking-wider">${data.name}</p>
                    <p class="text-[10px] text-muted-foreground">${data.email}</p>
                </div>
            </div>
        `
    },
    {
        title: "Clearance",
        data: "roles",
        render: (roles: any) => {
            const roleName = roles[0]?.name || 'NO ROLE';
            let colorClass = 'bg-muted text-muted-foreground';
            if (roleName === 'company') colorClass = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            if (roleName === 'manager') colorClass = 'bg-sada-red/10 text-sada-red border border-sada-red/20';
            
            return `<span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${colorClass}">${roleName}</span>`;
        }
    },
    {
        title: "Sector Assignment",
        data: null,
        render: (member: any) => {
            const managed = member.managed_workspace?.name;
            const joined = member.workspaces && member.workspaces.length > 0 
                ? member.workspaces[0].name 
                : null;

            const sectorName = managed || joined || 'Unassigned / Global';

            return `
                <div class="flex items-center gap-2 text-muted-foreground italic text-[11px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
                    ${sectorName}
                </div>
            `;
        }
    },
    {
        title: "Action",
        data: null,
        className: "text-right",
        render: () => `
            <button class="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors delete-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
        `
    }
];