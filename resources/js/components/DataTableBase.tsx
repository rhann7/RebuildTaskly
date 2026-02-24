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

    // --- FIX RE-SYNC DATA (PENTING!) ---
    useEffect(() => {
        if (internalRef.current && data) {
            try {
                const dt = internalRef.current.dt();
                // Hapus baris lama, tambah data baru, gambar ulang tanpa reset posisi page
                dt.clear().rows.add(data).draw(false);
                updatePageInfo();
            } catch (e) {
                console.error("DT Refresh Error:", e);
            }
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
                
                table.dataTable { 
                    border-collapse: collapse !important; 
                    width: 100% !important; 
                    table-layout: fixed !important;
                    margin-bottom: 0 !important; 
                    background-color: transparent !important; 
                }

                /* HEADER STYLE */
                table.dataTable thead th { 
                    background: transparent !important; 
                    color: var(--muted-foreground) !important;
                    font-size: 10px !important; 
                    text-transform: uppercase !important; 
                    letter-spacing: 0.2em !important; 
                    padding: 24px 20px !important; 
                    border-bottom: 1px solid var(--border) !important;
                    font-weight: 900 !important;
                    text-align: left !important;
                }

                /* BODY CELLS STYLE */
                table.dataTable tbody td { 
                    border-bottom: 1px solid var(--border) !important;
                    padding: 20px !important; 
                    color: var(--foreground) !important;
                    font-size: 13px; 
                }

                /* HOVER & DARK STATE */
                table.dataTable tbody tr {
                    background-color: transparent !important;
                    transition: background-color 0.2s ease;
                }

                table.dataTable tbody tr:hover { 
                    background-color: var(--muted) !important; 
                }

                /* RESPONSIVE CHILD ROW */
                table.dataTable.dtr-inline.collapsed > tbody > tr > td.dtr-control:before {
                    background-color: var(--sada-red) !important;
                }
            `}</style>


            <div className="overflow-hidden rounded-t-xl">
                <DataTable 
                    ref={internalRef}
                    data={data}
                    columns={columns} 
                    options={{
                        dom: 't',
                        responsive: true,
                        autoWidth: false,
                        pageLength: pageSize,
                        destroy: true,
                        retrieve: true,
                        drawCallback: () => updatePageInfo(),
                        initComplete: () => updatePageInfo(),
                        ...options
                    }} 
                    className="w-full"
                />
            </div>

            {/* Pagination Controls Identik Style Lo */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-0 px-6 py-6 border-t border-border bg-card/50 rounded-b-xl">
                <div className="flex items-center gap-6">
                    <div className="relative flex items-center group">
                        <select 
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="bg-muted/50 border border-border rounded-lg pl-3 pr-8 py-2 text-[11px] font-black text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all cursor-pointer appearance-none min-w-[70px]"
                        >
                            {[5, 10, 25, 50].map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 pointer-events-none text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                        Showing <span className="text-foreground font-black">{pageInfo.start}</span> to <span className="text-foreground font-black">{pageInfo.end}</span> of <span className="text-foreground font-black">{pageInfo.total}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => handlePageClick(pageInfo.current - 1)}
                        disabled={pageInfo.current === 0}
                        className="flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-background text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20 transition-all cursor-pointer"
                    >
                        <ChevronLeft size={14} strokeWidth={3} /> Prev
                    </button>

                    <div className="flex items-center gap-1.5">
                        {(() => {
                            const pages = [];
                            for (let i = 0; i < pageInfo.pages; i++) {
                                if (i === 0 || i === pageInfo.pages - 1 || (i >= pageInfo.current - 1 && i <= pageInfo.current + 1)) {
                                    pages.push(
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handlePageClick(i)}
                                            className={`size-10 flex items-center justify-center rounded-xl text-[11px] font-black transition-all border cursor-pointer ${
                                                pageInfo.current === i 
                                                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/30' 
                                                : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    );
                                }
                            }
                            return pages;
                        })()}
                    </div>

                    <button
                        type="button"
                        onClick={() => handlePageClick(pageInfo.current + 1)}
                        disabled={pageInfo.current >= pageInfo.pages - 1 || pageInfo.pages === 0}
                        className="flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-background text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20 transition-all cursor-pointer"
                    >
                        Next <ChevronRight size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
});

export default DataTableBase;