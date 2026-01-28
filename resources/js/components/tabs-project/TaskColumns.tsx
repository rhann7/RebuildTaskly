export const getTaskColumns = (workspaceSlug: string, projectSlug: string) => [
    {
        data: "title",
        title: "TASK",
        width: '50%',
        className: "text-left align-middle px-6 group", 
        render: (data: any, type: any, row: any) => `
            <div class="flex items-center gap-4 py-2 group/item">
                <div class="size-11 shrink-0 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg transition-transform group-hover/item:scale-110 border border-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <div class="flex flex-col min-w-0">
                    <span class="font-black text-[13px] uppercase tracking-tight text-foreground line-clamp-1 group-hover/item:text-sada-red transition-colors">
                        ${row.title}
                    </span>
                    <p class="text-[10px] text-muted-foreground font-medium line-clamp-1 italic opacity-70">
                        ${row.description || 'No operational briefing provided...'}
                    </p>
                </div>
            </div>
        `
    },
    {
        data: "status",
        title: "STATUS",
        width: '25%',
        className: "px-6 whitespace-nowrap text-center align-middle",
        render: (data: any) => {
            const isCompleted = data === 'completed' || data === 'done';
            const colorClass = isCompleted ? 'bg-emerald-500' : 'bg-orange-500';
            const textClass = isCompleted ? 'text-emerald-500' : 'text-orange-500';
            
            return `
                <div class="flex items-center justify-center gap-2.5">
                    <div class="size-1.5 rounded-full ${colorClass} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.1)]"></div>
                    <span class="text-[10px] font-black ${textClass} opacity-80 uppercase tracking-[0.2em]">
                        ${data || 'PENDING'}
                    </span>
                </div>
            `;
        }
    },
    {
        data: "id",
        title: "ACTIONS",
        width: '10%',
        className: "text-right pr-6 align-middle",
        render: (data: any) => `
            <div class="flex justify-end">
                <button class="size-10 inline-flex items-center justify-center rounded-xl bg-muted/50 hover:bg-sada-red hover:text-white text-foreground transition-all border border-border hover:scale-110 active:scale-95 shadow-sm group/btn cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover/btn:rotate-12 transition-transform"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
            </div>
        `
    }
];