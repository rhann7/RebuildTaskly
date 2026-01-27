import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import WorkspaceLayout from '@/layouts/workspaces/WorkspaceLayout';
import DataTableBase from '@/components/DataTableBase';
import { getProjectColumns } from '@/components/tabs-workspace/ProjectColumns';
import CreateProjectModal from '@/components/tabs-workspace/CreateProjectModal';
import { Search, Plus, Zap } from 'lucide-react';

export default function WorkspaceShow({ workspace, projects }: any) {
    const [activeTab, setActiveTab] = useState<'projects' | 'members' | 'settings'>('projects');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns = useMemo(() => getProjectColumns(workspace.slug), [workspace.slug]);
    
    const filteredProjects = useMemo(() => {
        return projects.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [projects, searchQuery]);

    return (
        <WorkspaceLayout workspace={workspace} activeTab={activeTab} setActiveTab={setActiveTab}>
            <Head title={workspace.name} />

            <div className="p-8 animate-in fade-in duration-700 w-full">
                {activeTab === 'projects' && (
                    <div className="flex flex-col gap-8 w-full">
                        {/* Control Bar */}
                        <div className="flex justify-between items-center gap-4 w-full">
                            <div className="relative w-full max-w-lg group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="SEARCH SECTOR PROTOCOL..."
                                    className="w-full h-14 pl-14 pr-6 bg-zinc-900/40 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:ring-1 focus:ring-red-600/30 focus:bg-zinc-900/60 transition-all text-white"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="h-14 px-8 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center gap-3 active:scale-95 shadow-xl shrink-0"
                            >
                                <Plus size={16} strokeWidth={4} /> Initialize Sector
                            </button>
                        </div>

                        {/* Table Container - FIX MELEBAR */}
                        <div className="bg-white dark:bg-zinc-900/20 rounded-[32px] border border-zinc-200 dark:border-white/[0.02] overflow-hidden w-full shadow-sm dark:shadow-none transition-all duration-300">
                            <div className="inline-block min-w-full align-middle">
                                {filteredProjects.length > 0 ? (
                                    <DataTableBase data={filteredProjects} columns={columns} />
                                ) : (
                                    <div className="py-40 text-center uppercase tracking-widest text-zinc-400 dark:text-zinc-600 text-[10px] font-black">
                                        <Zap className="mx-auto mb-4 opacity-20" size={40} />
                                        No Sectors Detected
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <CreateProjectModal 
                isOpen={isModalOpen} 
                setIsOpen={setIsModalOpen} 
                workspace={workspace} 
            />
        </WorkspaceLayout>
    );
}