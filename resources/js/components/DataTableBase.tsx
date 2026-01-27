import React, { forwardRef, useEffect, useState, useImperativeHandle, useRef } from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-responsive-dt';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

DataTable.use(DT);

const DataTableBase = forwardRef<any, any>(({ columns, data, options }, ref) => {
    const internalRef = useRef<any>(null);
    const [pageSize, setPageSize] = useState(options?.pageLength || 10);
    const [pageInfo, setPageInfo] = useState({ 
        start: 0, end: 0, total: 0, current: 0, pages: 0 
    });

    useImperativeHandle(ref, () => internalRef.current);

    const updatePageInfo = () => {
        if (!internalRef.current) return;
        try {
            const dt = internalRef.current.dt();
            const info = dt.page.info();
            setPageInfo({
                start: info.recordsTotal === 0 ? 0 : info.start + 1,
                end: info.end,
                total: info.recordsTotal,
                current: info.page,
                pages: info.pages
            });
        } catch (e) {}
    };

    const handlePageSizeChange = (newSize: number) => {
        if (!internalRef.current) return;
        const dt = internalRef.current.dt();
        dt.page.len(newSize).draw();
        setPageSize(newSize);
        updatePageInfo();
    };

    useEffect(() => {
        if (internalRef.current && data) {
            updatePageInfo();
        }
    }, [data]);

    const handlePageClick = (pageIndex: number) => {
        if (!internalRef.current) return;
        const dt = internalRef.current.dt();
        if (pageIndex >= 0 && pageIndex < pageInfo.pages) {
            dt.page(pageIndex).draw('page');
            updatePageInfo();
        }
    };

    return (
        <div className="w-full">
            <style>{`
                .dt-paging, .dataTables_paginate, .dt-info, .dataTables_info, .dt-search, .dataTables_filter { display: none !important; }
                table.dataTable { border-collapse: collapse !important; width: 100% !important; margin-bottom: 1rem !important; background-color: transparent !important; }
                table.dataTable thead th { 
                    background: transparent !important; 
                    color: var(--muted-foreground) !important; 
                    font-size: 10px !important; 
                    text-transform: uppercase !important; 
                    letter-spacing: 0.2em !important; 
                    padding: 20px !important; 
                    border-bottom: 1px solid var(--border) !important; 
                    font-weight: 900 !important;
                    text-align: left !important;
                }
                table.dataTable tbody td { 
                    border-bottom: 1px solid var(--border) !important; 
                    padding: 16px 20px !important; 
                    color: var(--foreground) !important; 
                    font-size: 13px; 
                }
                table.dataTable tbody tr:hover { background-color: var(--muted) !important; }
            `}</style>

            <DataTable 
                ref={internalRef}
                data={data}
                columns={columns} 
                options={{
                    dom: 't',
                    responsive: true,
                    pageLength: pageSize,
                    destroy: true,
                    retrieve: true,
                    drawCallback: () => updatePageInfo(),
                    initComplete: () => updatePageInfo(),
                    ...options
                }} 
                className="w-full text-foreground"
            />

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 px-2 border-t border-border pt-6 pb-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex items-center">
                        <select 
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="bg-muted/50 border border-border rounded-lg pl-3 pr-8 py-1.5 text-[11px] font-black text-foreground focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all cursor-pointer appearance-none"
                        >
                            {[5, 10, 25, 50].map((size) => (
                                <option key={size} value={size} className="bg-background">{size}</option>
                            ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 pointer-events-none text-muted-foreground" />
                    </div>
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        Showing <span className="text-foreground">{pageInfo.start}</span> to <span className="text-foreground">{pageInfo.end}</span> of <span className="text-foreground">{pageInfo.total}</span> entries
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handlePageClick(pageInfo.current - 1)}
                        disabled={pageInfo.current === 0}
                        className="flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-[12px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20 transition-all"
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>

                    <div className="flex items-center gap-1">
                        {(() => {
                            const pages = [];
                            const totalPages = pageInfo.pages;
                            const current = pageInfo.current;
                            const delta = 1;
                            for (let i = 0; i < totalPages; i++) {
                                if (i === 0 || i === totalPages - 1 || (i >= current - delta && i <= current + delta)) {
                                    pages.push(
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handlePageClick(i)}
                                            className={`size-10 flex items-center justify-center rounded-xl text-[12px] font-black transition-all border ${
                                                current === i 
                                                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                                                : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    );
                                } else if ((i === current - delta - 1 && i > 0) || (i === current + delta + 1 && i < totalPages - 1)) {
                                    pages.push(<span key={i} className="px-2 text-muted-foreground/50 font-bold">...</span>);
                                }
                            }
                            return pages;
                        })()}
                    </div>

                    <button
                        type="button"
                        onClick={() => handlePageClick(pageInfo.current + 1)}
                        disabled={pageInfo.current >= pageInfo.pages - 1 || pageInfo.pages === 0}
                        className="flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-[12px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20 transition-all"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
});

export default DataTableBase;