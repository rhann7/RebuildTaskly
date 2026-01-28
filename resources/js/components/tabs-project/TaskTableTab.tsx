import { useState, useMemo } from 'react';
import DataTableBase from '@/components/DataTableBase';
import { getTaskColumns } from '@/components/tabs-project/TaskColumns'; 
import { Search, Plus, Zap } from 'lucide-react';
import CreateTaskModal from '@/components/tabs-project/CreateTaskModal';

export default function TaskTableTab({ project, tasks = [], workspace }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Inisialisasi kolom dengan context workspace & project slug
    const columns = useMemo(() => 
        getTaskColumns(workspace.slug, project.slug), 
        [workspace.slug, project.slug]
    );
    
    // Filter logic dengan safety check
    const filteredTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return [];
        return tasks.filter((t: any) => 
            t.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tasks, searchQuery]);

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* Control Bar: Search & Initialize Button */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                <div className="relative w-full max-w-lg group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-sada-red transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search Tasks..."
                        className="w-full h-12 pl-12 pr-6 bg-card border border-border rounded-xl text-[11px] font-bold tracking-widest outline-none focus:ring-2 focus:ring-sada-red/20 focus:border-sada-red transition-all uppercase placeholder:text-muted-foreground/30"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto h-12 px-8 bg-primary text-primary-foreground rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shrink-0 cursor-pointer"
                >
                    <Plus size={16} strokeWidth={3} /> Add New Task
                </button>
            </div>

            {/* Content Area: DataTable dengan Style OKLCH */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden w-full transition-all duration-300">
                {filteredTasks.length > 0 ? (
                    <div className="min-w-full align-middle">
                        <DataTableBase data={filteredTasks} columns={columns} />
                    </div>
                ) : (
                    /* Empty State: Tactical Visual */
                    <div className="py-32 text-center border-t border-border">
                        <div className="relative inline-block mb-4">
                            <Zap className="text-muted-foreground/20 animate-pulse" size={48} />
                            <Zap className="absolute inset-0 text-sada-red/10 blur-sm" size={48} />
                        </div>
                        <p className="uppercase tracking-[0.3em] text-muted-foreground text-[10px] font-black italic">
                            No Tasks Found
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