import React, { forwardRef, useEffect, useState, useImperativeHandle, useRef } from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-responsive-dt';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

DataTable.use(DT);

const DataTableBase = forwardRef<any, any>(({ columns, data, options }, ref) => {
    const internalRef = useRef<any>(null);
    const [pageSize, setPageSize] = useState(options?.pageLength || 5);
    const [pageInfo, setPageInfo] = useState({ 
        start: 0, 
        end: 0, 
        total: 0, 
        current: 0, 
        pages: 0 
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
            {/* Dinamis CSS Berbasis OKLCH & Sada Red */}
            <style>{`
                .dt-paging, .dataTables_paginate, .dt-info, .dataTables_info, .dt-search, .dataTables_filter { display: none !important; }
                
                table.dataTable { 
                    border-collapse: collapse !important; 
                    width: 100% !important; 
                    margin-bottom: 0 !important;
                    background-color: transparent !important;
                }

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

                table.dataTable tbody td { 
                    border-bottom: 1px solid var(--border) !important; 
                    padding: 20px !important;
                    color: var(--foreground) !important;
                    font-size: 13px;
                }

                table.dataTable tbody tr {
                    background-color: transparent !important;
                    transition: background-color 0.2s ease;
                }

                table.dataTable tbody tr:hover {
                    background-color: var(--muted) !important;
                }
                
                .dtr-details { width: 100%; }
                .dtr-title { font-weight: bold; color: var(--muted-foreground); margin-right: 10px; }
            `}</style>

            <div className="overflow-hidden rounded-t-[radius-lg] border-x border-t border-border">
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
            </div>

            {/* Pagination Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-6 border border-border bg-card/50 rounded-b-[radius-lg]">
                
                {/* Bagian Kiri: Info + Page Size Selector */}
                <div className="flex items-center gap-6">
                    <div className="relative flex items-center group">
                        <select 
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="bg-muted/50 border border-border rounded-lg pl-3 pr-8 py-2 text-[11px] font-black text-foreground focus:outline-none focus:ring-2 focus:ring-sada-red/20 transition-all cursor-pointer appearance-none min-w-[70px]"
                        >
                            {[5, 10, 25, 50].map((size) => (
                                <option key={size} value={size} className="bg-background">{size}</option>
                            ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 pointer-events-none text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>

                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        Showing <span className="text-foreground font-black">{pageInfo.start}</span> to <span className="text-foreground font-black">{pageInfo.end}</span> of <span className="text-foreground font-black">{pageInfo.total}</span>
                    </div>
                </div>

                {/* Bagian Kanan: Navigation Buttons */}
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
                                            className={`size-10 flex items-center justify-center rounded-xl text-[11px] font-black transition-all border cursor-pointer ${
                                                current === i 
                                                ? 'bg-sada-red border-sada-red text-white shadow-lg shadow-sada-red/30' 
                                                : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    );
                                } 
                                else if ((i === current - delta - 1 && i > 0) || (i === current + delta + 1 && i < totalPages - 1)) {
                                    pages.push(
                                        <span key={i} className="px-1 text-muted-foreground/30 font-black">...</span>
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