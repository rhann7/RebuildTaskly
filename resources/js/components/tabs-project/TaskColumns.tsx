export const getTaskColumns = (workspaceSlug: string, projectSlug: string) => [
      {
        data: "title",
        title: "TASK DETAILS",
        width: '35%',
        className: "text-left align-middle px-6 group",
        render: (data: any, type: any, row: any) => `
            <a href="/workspaces/${workspaceSlug}/projects/${projectSlug}/tasks/${row.slug}" 
               class="flex items-center gap-4 py-3 group/item transition-all no-underline block">
                <div class="size-10 shrink-0 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg group-hover/item:scale-105 transition-all duration-300 border border-white/10 relative overflow-hidden">
                    <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="relative z-10">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                        <path d="m9 12 2 2 4-4"/>
                    </svg>
                </div>
                <div class="flex flex-col justify-center min-w-0 leading-tight">
                    <span class="font-black text-foreground truncate text-[13px] group-hover/item:text-sada-red transition-colors uppercase leading-none mb-1">
                        ${row.title}
                    </span>
                    <p class="text-[11px] text-muted-foreground font-bold line-clamp-1 italic tracking-wider opacity-60 border-l-2 border-muted pl-2">
                        ${row.description || 'No operational briefing provided...'}
                    </p>
                </div>
            </a>
        `
    },
    {
        data: "priority",
        title: "PRIORITY",
        width: '15%',
        className: "text-left align-middle px-6",
        render: (data: any) => {
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
        data: "status",
        title: "STATUS",
        width: '15%',
        className: "text-left align-middle px-6",
        render: (data: any) => {
            const statusMap: any = {
                'done': { color: 'bg-emerald-500', label: 'COMPLETED' },
                'in_progress': { color: 'bg-blue-500', label: 'IN PROGRESS' },
                'todo': { color: 'bg-zinc-400', label: 'TODO' },
                'overdue': { color: 'bg-sada-red', label: 'OVERDUE' }
            };
            const config = statusMap[data] || { color: 'bg-zinc-300', label: 'PENDING' };

            return `
                <div class="flex items-center gap-2.5 bg-muted/30 w-fit px-3 py-1.5 rounded-lg border border-border">
                    <div class="size-1.5 rounded-full ${config.color} animate-pulse"></div>
                    <span class="text-[9px] font-black text-foreground uppercase tracking-widest">${config.label}</span>
                </div>
            `;
        }
    },
    {
        data: "due_date",
        title: "DEADLINE",
        width: '15%',
        className: "text-left align-middle px-6",
        render: (data: any) => `
            <div class="flex flex-col">
                <span class="text-[11px] font-black text-foreground uppercase  ">
                    ${data ? new Date(data).toLocaleDateString('en-GB').replace(/\//g, '-') : 'Not Set'}
                </span>
                <span class="text-[8px] font-bold text-muted-foreground uppercase er mt-0.5">Due Date</span>
            </div>
        `
    },
    {
        data: "id",
        title: "CONTROL",
        width: '20%',
        className: "text-right align-right px-6",  
        render: (data: any) => `
            <div class="flex justify-start items-center gap-2">
                <button class="size-8 inline-flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-900 hover:text-white transition-all border border-zinc-200 group/btn cursor-pointer shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button class="size-8 inline-flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all border border-zinc-200 group/btn cursor-pointer shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
            </div>
        `
    }
];