export const getProjectColumns = (workspaceSlug: string) => [
    {
        header: "PROJECT DETAILS",
        data: "name",
        render: (data: any, type: any, row: any) => `
            <div class="flex items-center gap-4 group/item">
                <div class="size-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20 transition-transform group-hover/item:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                </div>
                <div class="flex flex-col max-w-[400px]">
                    <a href="/workspaces/${workspaceSlug}/projects/${row.slug}" class="font-black text-[13px] uppercase tracking-tight text-white line-clamp-1 hover:text-red-500 transition-colors">
                        ${row.name}
                    </a>
                    <p class="text-[10px] text-zinc-500 font-medium line-clamp-1 lowercase first-letter:uppercase mb-1">
                        ${row.description || 'no operational brief provided...'}
                    </p>
                    <div class="flex items-center gap-2">
                         <span class="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">ACTIVE SECTOR</span>
                    </div>
                </div>
            </div>
        `
    },
    {
        header: "STATUS",
        data: "status",
        render: (data: any) => `
            <div class="flex items-center gap-2">
                <div class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">${data || 'ONLINE'}</span>
            </div>
        `
    },
    {
        header: "",
        data: "slug",
        className: "text-right",
        render: (data: any) => `
            <div class="flex justify-end pr-2">
                <a href="/workspaces/${workspaceSlug}/projects/${data}" class="size-9 inline-flex items-center justify-center rounded-xl bg-zinc-800/50 hover:bg-red-600 text-white transition-all border border-white/5 hover:scale-110 active:scale-95 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
            </div>
        `
    }
];