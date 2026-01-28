export const getTaskColumns = (workspaceSlug: string, projectSlug: string) => [
    {
        header: "OBJECTIVE DETAILS",
        data: "title",
        className: "w-full min-w-[400px] py-4 pl-6", 
        render: (data: any, type: any, row: any) => `
            <div class="flex items-center gap-4 group/item">
                <div class="size-11 shrink-0 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg transition-transform group-hover/item:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <div class="flex flex-col">
                    <span class="font-black text-[13px] uppercase tracking-tight text-zinc-900 dark:text-white line-clamp-1">
                        ${row.title}
                    </span>
                    <p class="text-[10px] text-zinc-500 font-medium line-clamp-1 lowercase first-letter:uppercase">
                        ${row.description || 'no operational briefing provided...'}
                    </p>
                </div>
            </div>
        `
    },
    {
        header: "STATUS",
        data: "status",
        className: "px-6 whitespace-nowrap text-center w-[120px]",
        render: (data: any) => `
            <div class="flex items-center justify-center gap-2">
                <div class="size-1.5 rounded-full ${data === 'completed' ? 'bg-emerald-500' : 'bg-orange-500'} animate-pulse"></div>
                <span class="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">${data || 'PENDING'}</span>
            </div>
        `
    },
    {
        header: "",
        data: "id",
        className: "text-right pr-6 w-[80px]",
        render: (data: any) => `
            <div class="flex justify-end pr-2">
                <button class="size-10 inline-flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-900 hover:text-white text-zinc-900 dark:text-white transition-all border border-zinc-200 dark:border-white/5 hover:scale-110 active:scale-95 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
            </div>
        `
    }
];