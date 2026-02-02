export const getTaskColumns = (workspaceSlug: string, projectSlug: string) => [
    {
        data: "title",
        title: "OBJECTIVE DETAILS",
        width: '40%',
        className: "text-left align-middle px-6 group", 
        render: (data: any, type: any, row: any) => `
            <div class="flex items-center gap-4 py-3 group/item">
                <div class="size-10 shrink-0 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg transition-transform group-hover/item:scale-110 border border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <div class="flex flex-col min-w-0">
                    <span class="font-black text-[12px] uppercase tracking-tight text-foreground line-clamp-1 group-hover/item:text-sada-red transition-colors">
                        ${row.title}
                    </span>
                    <p class="text-[9px] text-muted-foreground font-bold line-clamp-1 italic opacity-60 uppercase tracking-wider">
                        ${row.description || 'NO OPERATIONAL BRIEFING'}
                    </p>
                </div>
            </div>
        `
    },
    {
        data: "priority",
        title: "PRIORITY",
        width: '15%',
        className: "px-4 text-center align-middle",
        render: (data: any) => {
            const colors = {
                high: 'text-red-500 border-red-500/20 bg-red-500/5',
                medium: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
                low: 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5'
            };
            const active = colors[data as keyof typeof colors] || colors.low;
            
            return `
                <div class="inline-flex items-center px-3 py-1 rounded-full border ${active} gap-2">
                    <div class="size-1 rounded-full bg-current animate-pulse"></div>
                    <span class="text-[9px] font-black uppercase tracking-[0.15em]">${data || 'NORMAL'}</span>
                </div>
            `;
        }
    },
    {
        data: "status",
        title: "STATUS",
        width: '15%',
        className: "px-4 text-center align-middle",
        render: (data: any) => {
            const isDone = data === 'done';
            const isInProgress = data === 'in_progress';
            
            let color = 'text-zinc-400';
            if (isDone) color = 'text-emerald-500';
            if (isInProgress) color = 'text-blue-500';

            return `
                <span class="text-[10px] font-black ${color} uppercase tracking-[0.2em]">
                    ${data?.replace('_', ' ') || 'PENDING'}
                </span>
            `;
        }
    },
    {
        data: "due_date",
        title: "DEADLINE",
        width: '15%',
        className: "px-4 text-center align-middle",
        render: (data: any) => `
            <div class="flex flex-col items-center">
                <span class="text-[10px] font-mono font-bold text-muted-foreground tracking-tighter">
                    ${data ? new Date(data).toLocaleDateString('en-GB').replace(/\//g, '-') : '--/--/--'}
                </span>
            </div>
        `
    },
    {
        data: "id",
        title: "CONTROL",
        width: '15%',
        className: "text-right pr-6 align-middle",
        render: (data: any) => `
            <div class="flex justify-end gap-2">
                <button class="size-9 inline-flex items-center justify-center rounded-xl bg-muted/30 hover:bg-zinc-900 hover:text-white transition-all border border-border group/btn cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button class="size-9 inline-flex items-center justify-center rounded-xl bg-muted/30 hover:bg-sada-red hover:text-white transition-all border border-border group/btn cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
            </div>
        `
    }
];