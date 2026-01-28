import { useState, useMemo } from 'react';
import DataTableBase from '@/components/DataTableBase';
import { getTaskColumns } from '@/components/tabs-project/TaskColumns'; 
import { Search, Plus, Zap } from 'lucide-react';
import CreateTaskModal from '@/components/tabs-project/CreateTaskModal';

// Tambahkan default value [] pada props tasks agar tidak undefined saat awal render
export default function TaskTableTab({ project, tasks = [], workspace }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Inisialisasi kolom dengan data slug untuk routing di dalam render string HTML
    const columns = useMemo(() => 
        getTaskColumns(workspace.slug, project.slug), 
        [workspace.slug, project.slug]
    );
    
    // Logic filter dengan safety check (optional chaining)
    const filteredTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return [];
        
        return tasks.filter((t: any) => 
            t.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tasks, searchQuery]);

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* Action Bar: Search & Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                <div className="relative w-full max-w-lg group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-zinc-900 transition-colors" />
                    <input 
                        type="text"
                        placeholder="SEARCH OBJECTIVES..."
                        className="w-full h-12 pl-12 pr-6 bg-card border border-border rounded-xl text-[11px] font-bold tracking-widest outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all uppercase"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto h-12 px-8 bg-zinc-900 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shrink-0"
                >
                    <Plus size={16} strokeWidth={3} /> Add New Task
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-card rounded-[24px] border border-border shadow-sm overflow-hidden w-full transition-all duration-300">
                {filteredTasks.length > 0 ? (
                    /* Menggunakan DataTableBase yang sudah terintegrasi dengan datatables.net */
                    <DataTableBase data={filteredTasks} columns={columns} />
                ) : (
                    /* Empty State: Jika tidak ada data */
                    <div className="py-32 text-center">
                        <Zap className="mx-auto mb-4 text-zinc-300 animate-pulse" size={48} />
                        <p className="uppercase tracking-[0.3em] text-muted-foreground text-[10px] font-black italic">
                            No Tasks Detected in Current Sector
                        </p>
                    </div>
                )}
            </div>

            {/* Modal Components */}
            <CreateTaskModal 
                isOpen={isModalOpen} 
                setIsOpen={setIsModalOpen} 
                project={project} 
                workspace={workspace} 
            />
        </div>
    );
}