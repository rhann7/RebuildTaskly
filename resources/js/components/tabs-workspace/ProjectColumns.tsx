import { Building2, FolderKanban, MoreVertical, CheckCircle2 } from "lucide-react";

export const getProjectColumns = (workspaceSlug: string) => [
    {
        data: 'name',
        title: 'Project Name',
        width: '30%',
        className: 'text-left align-middle px-6 group',
        render: (data: any, type: any, row: any) => {
            return `
                <a href="/workspaces/${workspaceSlug}/projects/${row.slug}" class="flex items-center gap-4 py-4 group no-underline transition-all">
                    <div class="size-12 rounded-2xl bg-gradient-to-br ${row.color || 'from-sada-red to-red-950'} flex items-center justify-center shadow-lg shadow-sada-red/10 group-hover:scale-105 transition-all duration-300 border border-white/10 relative overflow-hidden">
                        <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="relative z-10"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="font-black text-foreground truncate text-[13px] group-hover:text-sada-red transition-colors uppercase tracking-tight leading-none mb-1">
                            ${row.name}
                        </span>
                    </div>
                </a>
            `;
        }
    },
    {
        data: 'description',
        title: 'Description',
        width: '25%', 
        className: 'text-left align-middle px-6',
        render: (data: any) => `
            <div class="max-w-[200px]">
                <p class="text-[11px] text-muted-foreground font-medium lic line-clamp-2 leading-relaxed  border-l-2 border-muted pl-3">
                    ${data || 'No operational briefing provided...'}
                </p>
            </div>
        `
    },
    {
        data: 'status',
        title: 'Status',
        width: '15%',
        className: 'text-left align-middle px-6',
        render: (data: any) => {
            const statusMap: any = {
                'active': { color: 'bg-emerald-500', label: 'ACTIVE' },
                'in-progress': { color: 'bg-blue-500', label: 'IN PROGRESS' },
                'planning': { color: 'bg-amber-500', label: 'PLANNING' },
                'overdue': { color: 'bg-sada-red', label: 'OVERDUE' }
            };
            const config = statusMap[data] || { color: 'bg-zinc-500', label: 'STANDBY' };
            
            return `
                <div class="flex items-center gap-2.5 bg-muted/30 w-fit px-3 py-1.5 rounded-lg border border-border">
                    <div class="size-1.5 rounded-full ${config.color} animate-pulse"></div>
                    <span class="text-[9px] font-black text-foreground uppercase tracking-widest">${config.label}</span>
                </div>
            `;
        }
    },
    {
        data: 'priority',
        title: 'Priority',
        width: '15%',
        className: 'text-left align-middle px-6',
        render: (data: string) => {
            const colors: any = {
                high: 'text-sada-red bg-sada-red/5 border-sada-red/20',
                medium: 'text-amber-500 bg-amber-500/5 border-amber-500/20',
                low: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20'
            };
            return `
                <div class="px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-[0.2em] text-center w-fit ${colors[data] || 'text-muted-foreground border-border'}">
                    ${data || 'LOW'}
                </div>
            `;
        }
    },
    {
        data: 'due_date',
        title: 'Due Date',
        width: '15%',
        className: 'text-left align-middle px-6',
        render: (data: string) => `
            <div class="flex items-center gap-2">
                <div class="flex flex-col">
                    <span class="text-[11px] font-black text-foreground uppercase tracking-tight ">
                        ${data ? new Date(data).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'}) : 'NOT SET'}
                    </span>
                    <span class="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5">Termination Date</span>
                </div>
            </div>
        `     
    }
];