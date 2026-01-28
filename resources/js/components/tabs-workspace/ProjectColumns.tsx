import ReactDOMServer from 'react-dom/server';
import { Building2, FolderKanban, MoreVertical, CheckCircle2 } from "lucide-react";

export const getProjectColumns = (workspaceSlug: string) => [
    {
        data: 'name',
        title: 'PROJECT DETAILS',
        width: '35%',
        className: 'text-left align-middle px-6 group',
        render: (data: any, type: any, row: any) => {
            const statusStyles: any = {
                "in-progress": "bg-blue-500/10 text-blue-600 border-blue-500/20",
                "completed": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                "planning": "bg-purple-500/10 text-purple-600 border-purple-500/20",
                "overdue": "bg-sada-red/10 text-sada-red border-sada-red/20"
            };
            const currentStatusStyle = statusStyles[row.status] || 'bg-muted text-muted-foreground border-border';

            return `
                <a href="/workspaces/${workspaceSlug}/projects/${row.slug}" class="flex items-center gap-4 py-3 group no-underline">
                    <div class="size-11 rounded-xl bg-gradient-to-br ${row.color || 'from-sada-red to-red-950'} flex items-center justify-center shadow-lg shadow-sada-red/10 group-hover:scale-110 transition-transform shrink-0 border border-white/5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="font-black text-foreground truncate text-[13px] group-hover:text-sada-red transition-colors uppercase tracking-tight leading-tight">
                            ${row.name}
                        </span>
                        <div class="mt-1 flex items-center gap-2">
                            <span class="text-[9px] uppercase font-black px-2 py-0.5 rounded border tracking-widest ${currentStatusStyle}">
                                ${row.status.replace('-', ' ')}
                            </span>
                            <span class="text-[10px] text-muted-foreground font-medium italic line-clamp-1 opacity-70">
                                ${row.description || 'No operational brief...'}
                            </span>
                        </div>
                    </div>
                </a>
            `;
        }
    },
    {
        data: 'status',
        title: 'STATUS',
        width: '35%',
        className: 'text-left align-middle px-6 group',
        render: (data: any) => `
            <div class="flex items-center gap-2">
                <div class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">${data || 'ONLINE'}</span>
            </div>
        `     
    } 
];