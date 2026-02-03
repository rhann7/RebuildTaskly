import { useState } from 'react';
import { Search, Grid3x3, List, X, Filter, Calendar } from "lucide-react";

interface ProjectControlsProps {
    viewMode: 'grid' | 'list';
    setViewMode: (mode: 'grid' | 'list') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    // Props untuk Filter (Gunakan Array untuk Multi-select)
    statusFilter: string[];
    setStatusFilter: (val: string[]) => void;
    priorityFilter: string[];
    setPriorityFilter: (val: string[]) => void;
}

export const ProjectControls = ({ 
    viewMode, 
    setViewMode, 
    searchQuery, 
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter
}: ProjectControlsProps) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Helper untuk toggle multi-select
    const toggleFilter = (currentArray: string[], value: string, setter: (val: string[]) => void) => {
        if (currentArray.includes(value)) {
            setter(currentArray.filter(i => i !== value));
        } else {
            setter([...currentArray, value]);
        }
    };

    return (
        <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* BAR UTAMA */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card rounded-[24px] p-3 shadow-sm border border-border transition-all">
                
                {/* Search */}
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-sada-red transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH PROJECTS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 h-12 rounded-2xl border-none bg-muted/30 focus:bg-background focus:ring-4 focus:ring-sada-red/10 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    {/* View Toggles */}
                    <div className="flex items-center gap-1 bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                        <ViewToggle active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon={Grid3x3} label="Grid" />
                        <ViewToggle active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={List} label="List" />
                    </div>

                    {/* Tactical Filter Toggle */}
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-5 h-12 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                            isFilterOpen || statusFilter.length > 0 || priorityFilter.length > 0
                            ? 'bg-sada-red text-white border-sada-red shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                            : 'bg-card border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Filter size={16} />
                        {isFilterOpen ? 'HIDE FILTERS' : 'TACTICAL FILTERS'}
                    </button>
                </div>
            </div>

            {/* COLLAPSIBLE FILTER PANEL */}
            {isFilterOpen && (
                <div className="bg-card/50 backdrop-blur-sm rounded-[32px] p-8 border border-border border-dashed animate-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        
                        {/* Status Group */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 bg-sada-red rounded-full" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">Filter by Status</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['active', 'inactive'].map((s) => (
                                    <FilterButton 
                                        key={s}
                                        label={s === 'active' ? 'ACTIVE OPS' : 'STANDBY'}
                                        active={statusFilter.includes(s)}
                                        onClick={() => toggleFilter(statusFilter, s, setStatusFilter)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Priority Group */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 bg-sada-red rounded-full" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">Filter by Priority</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['low', 'medium', 'high'].map((p) => (
                                    <FilterButton 
                                        key={p}
                                        label={p}
                                        active={priorityFilter.includes(p)}
                                        onClick={() => toggleFilter(priorityFilter, p, setPriorityFilter)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Panel */}
                    <div className="mt-8 pt-6 border-t border-border/50 flex justify-between items-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase italic tracking-widest">
                            {statusFilter.length + priorityFilter.length} Active tactical parameters
                        </p>
                        {(statusFilter.length > 0 || priorityFilter.length > 0) && (
                            <button 
                                onClick={() => { setStatusFilter([]); setPriorityFilter([]); }}
                                className="text-[9px] font-black text-sada-red hover:underline tracking-[0.2em] uppercase"
                            >
                                Reset All Parameters
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components
const FilterButton = ({ label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
            active 
            ? 'bg-foreground text-background border-foreground shadow-lg scale-105' 
            : 'bg-muted/20 text-muted-foreground border-border/50 hover:border-muted-foreground/50'
        }`}
    >
        {label}
    </button>
);

const ViewToggle = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
            active 
            ? 'bg-background shadow-md text-sada-red' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
    >
        <Icon className="size-4" />
        {active && <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>}
    </button>
);