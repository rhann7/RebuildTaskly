export const getGlobalProjectColumns = () => [
    {
        title: 'Project',
        data: 'name',
        defaultContent: '-',
        render: (data: any, type: any, row: any) => `
            <div class="flex flex-col py-1">
                <div class="font-black uppercase tracking-wider text-sm text-foreground">${data || 'UNTITLED'}</div>
                <div class="text-[9px] text-muted-foreground font-bold uppercase tracking-tight italic">ID: PRJ-${row.id || '0'}</div>
            </div>
        `
    },
    {
        title: 'Workspace',
        data: 'workspace.name',
        defaultContent: '<span class="text-[10px] opacity-30 italic font-bold">PRIVATE WORKSPACE</span>',
        render: (data: any) => `
            <div class="flex items-center gap-2">
                <div class="text-[10px] font-black uppercase tracking-widest text-foreground">${data || 'PRIVATE WORKSPACE'}</div>
            </div>
        `
    },
    {
        title: 'PRIORITY',
        data: 'priority',
        defaultContent: 'low',
        render: (data: any) => {
            const p = data?.toLowerCase() || 'low';
            const colors: any = {
                high: 'text-red-500 bg-red-500/10 border-red-500/20',
                medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
                low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
            };
            return `<div class="text-[9px] font-black px-2 py-0.5 rounded border w-fit uppercase ${colors[p] || colors.low}">${p}</div>`;
        }
    },
    {
        title: 'STATUS',
        data: 'status',
        defaultContent: 'ACTIVE',
        render: (data: any) => `<span class="text-[10px] font-bold uppercase tracking-widest">${data || 'ACTIVE'}</span>`
    },
    {
        title: 'DEADLINE',
        data: 'due_date', // Pastikan di database fieldnya 'deadline'
        defaultContent: '<span class="text-[10px] opacity-30 font-black">NO DATE</span>',
        render: (data: any, type: any, row: any) => {
            // Kita ambil data langsung dari 'data' atau fallback ke 'row.deadline'
            const dateValue = data || row.deadline;

            if (!dateValue) {
                return `<span class="text-[10px] opacity-30 font-black italic uppercase">No Operational Limit</span>`;
            }

            // Jika data date ada, kita format dikit biar cakep kayak di screenshot lo
            // Kita asumsikan formatnya YYYY-MM-DD dari server
            try {
                const date = new Date(dateValue);
                const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
                const formattedDate = date.toLocaleDateString('en-GB', options).toUpperCase();
                
                return `
                    <div class="flex flex-col">
                        <span class="text-[11px] font-black text-foreground tracking-tighter">${formattedDate}</span>
                        <span class="text-[8px] text-muted-foreground font-bold leading-none uppercase tracking-widest">Operational Limit</span>
                    </div>
                `;
            } catch (e) {
                return `<span class="text-[10px] font-black text-red-500">${dateValue}</span>`;
            }
        }
    },
];