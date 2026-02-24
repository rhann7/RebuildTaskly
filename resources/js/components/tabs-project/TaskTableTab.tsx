import { useState, useMemo, useEffect } from 'react'; // Tambah useEffect
import DataTableBase from '@/components/DataTableBase';
import { getTaskColumns } from '@/components/tabs-project/TaskColumns';
import { Search, Plus, Zap, Filter, X, Calendar, LayoutGrid, List, Columns } from 'lucide-react';
import CreateTaskModal from '@/components/tabs-project/CreateTaskModal';
import TaskGridCard from '@/components/tabs-project/TaskGridCard';
import TaskKanbanBoard from './TaskKanbanBoard';

// Tambahkan props isExternalModalOpen dan setIsExternalModalOpen
export default function TaskTableTab({
    project,
    tasks = [],
    workspace,
    isExternalModalOpen,
    setIsExternalModalOpen
}: any) {
    // 1. States untuk Filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
    const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // 2. States untuk UI
    // Gunakan props dari parent jika ada, kalau tidak ada (fallback) pakai state lokal
    const isModalOpen = isExternalModalOpen;
    const setIsModalOpen = setIsExternalModalOpen;

    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'board'>('board');

    // 3. Columns Memoization
    const columns = useMemo(() =>
        getTaskColumns(workspace.slug, project.slug),
        [workspace.slug, project.slug]
    );

    // 4. Multi-Select Toggle Logic
    const toggleFilter = (value: string, currentFilters: string[], setFilters: (val: string[]) => void) => {
        if (currentFilters.includes(value)) {
            setFilters(currentFilters.filter(item => item !== value));
        } else {
            setFilters([...currentFilters, value]);
        }
    };

    // 5. Client-side Filtering Logic
    const filteredTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return [];

        return tasks.filter((t: any) => {
            const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilters.length === 0 || statusFilters.includes(t.status);
            const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(t.priority);

            const taskDate = t.due_date ? new Date(t.due_date).getTime() : null;
            const from = dateFrom ? new Date(dateFrom).getTime() : null;
            const to = dateTo ? new Date(dateTo).getTime() : null;

            let matchesDate = true;
            if (from && taskDate) matchesDate = matchesDate && taskDate >= from;
            if (to && taskDate) matchesDate = matchesDate && taskDate <= to;

            return matchesSearch && matchesStatus && matchesPriority && matchesDate;
        });
    }, [tasks, searchQuery, statusFilters, priorityFilters, dateFrom, dateTo]);

    const resetFilters = () => {
        setStatusFilters([]);
        setPriorityFilters([]);
        setDateFrom('');
        setDateTo('');
        setSearchQuery('');
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">

            {/* TOP BAR: SEARCH & PRIMARY ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card/40 p-4 rounded-[24px] border border-border backdrop-blur-sm shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-sada-red transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH TASK..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-6 bg-transparent text-[11px] font-black tracking-[0.2em] outline-none uppercase placeholder:text-muted-foreground/30"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* VIEW SWITCHER */}
                    <div className="flex bg-muted/50 p-1 rounded-xl border border-border shrink-0">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'board' ? 'bg-card text-sada-red shadow-sm' : 'text-muted-foreground'}`}
                        >
                            <Columns size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card text-sada-red shadow-sm' : 'text-muted-foreground'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-card text-sada-red shadow-sm' : 'text-muted-foreground'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-12 px-6 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 ${showFilters ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-card border-border text-muted-foreground hover:border-sada-red'
                            }`}
                    >
                        <Filter size={14} strokeWidth={2.5} />
                        {showFilters ? 'Hide Filters' : 'Filters'}
                    </button>


                </div>
            </div>

            {/* COLLAPSIBLE FILTER PANEL (Kode tetep sama) */}
            {showFilters && (
                <div className="bg-card border border-border rounded-[32px] p-8 space-y-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Zap size={120} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {/* Status Filter */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                                <div className="size-1.5 bg-sada-red" /> Filter by Status
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['todo', 'in_progress', 'done'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => toggleFilter(s, statusFilters, setStatusFilters)}
                                        className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${statusFilters.includes(s)
                                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg'
                                            : 'bg-muted/10 border-border text-muted-foreground hover:border-zinc-500'
                                            }`}
                                    >
                                        {statusFilters.includes(s) && <div className="size-1 rounded-full bg-sada-red animate-pulse" />}
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                                <div className="size-1.5 bg-sada-red" /> Filter by Priority
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['low', 'medium', 'high'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => toggleFilter(p, priorityFilters, setPriorityFilters)}
                                        className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${priorityFilters.includes(p)
                                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg'
                                            : 'bg-muted/10 border-border text-muted-foreground hover:border-zinc-500'
                                            }`}
                                    >
                                        {priorityFilters.includes(p) && <div className="size-1 rounded-full bg-sada-red animate-pulse" />}
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                                <div className="size-1.5 bg-sada-red" /> Filter by Deadline
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full h-11 pl-10 bg-muted/20 border border-border rounded-xl text-[10px] font-bold text-muted-foreground uppercase outline-none focus:border-sada-red transition-colors"
                                    />
                                </div>
                                <span className="text-muted-foreground font-black text-[10px] opacity-30">TO</span>
                                <div className="relative flex-1">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full h-11 pl-10 bg-muted/20 border border-border rounded-xl text-[10px] font-bold text-muted-foreground uppercase outline-none focus:border-sada-red transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Panel Filter */}
                    <div className="flex justify-between items-center pt-6 border-t border-border/50">
                        <div className="flex items-center gap-4">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">
                                {filteredTasks.length} Result(s) Located
                            </p>
                        </div>
                        {(statusFilters.length > 0 || priorityFilters.length > 0 || dateFrom || dateTo) && (
                            <button
                                onClick={resetFilters}
                                className="text-[10px] font-black text-sada-red uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity"
                            >
                                <X size={14} strokeWidth={3} /> Abort All Filters
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* DATA AREA: SWITCHER LOGIC */}
            <div className="w-full min-h-[400px]">
                {filteredTasks.length > 0 ? (
                    <>
                        {viewMode === 'list' && (
                            <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden animate-in fade-in duration-500">
                                <DataTableBase data={filteredTasks} columns={columns} />
                            </div>
                        )}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                                {filteredTasks.map((task: any) => (
                                    <TaskGridCard key={task.id} task={task} />
                                ))}
                            </div>
                        )}
                        {viewMode === 'board' && (
                            <TaskKanbanBoard tasks={filteredTasks} workspace={workspace} project={project} />
                        )}
                    </>
                ) : (
                    <div className="py-40 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-[32px] bg-muted/5">
                        <Zap className="size-16 text-muted-foreground/10 mb-6 animate-pulse" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">No Task Found</h3>
                        <p className="text-[9px] text-muted-foreground/50 mt-2 uppercase tracking-widest italic">Try adjusting your search parameters</p>
                    </div>
                )}
            </div>

            <CreateTaskModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                project={project}
                workspace={workspace}
            />
        </div>
    );
}