import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import WorkspaceLayout from '@/layouts/workspaces/WorkspaceLayout';
import DataTableBase from '@/components/DataTableBase';
import { getProjectColumns } from '@/components/tabs-workspace/ProjectColumns';
import CreateProjectModal from '@/components/tabs-workspace/CreateProjectModal';
import WorkspaceSettings from '@/components/tabs-workspace/WorkspaceSettings';
import ProjectGridCard from '@/components/tabs-workspace/ProjectGridCard'; // Import komponen Grid lo
import { Search, Plus, Zap, Users2, LayoutGrid, List } from 'lucide-react'; // Tambah icon

export default function WorkspaceShow({ workspace, projects, auth, companies }: any) {
    const [activeTab, setActiveTab] = useState<'projects' | 'members' | 'settings'>('projects');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default ke Grid ala Northland
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns = useMemo(() => getProjectColumns(workspace.slug), [workspace.slug]);
    
    const filteredProjects = useMemo(() => {
        if (!Array.isArray(projects)) return [];
        return projects.filter((p: any) => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    return (
        <WorkspaceLayout workspace={workspace} activeTab={activeTab} setActiveTab={setActiveTab} projects={projects}>
            <Head title={workspace.name} />

            <div className="w-full flex flex-col gap-8 py-8 animate-in fade-in duration-700">
                
                {activeTab === 'projects' && (
                    <div className="flex flex-col gap-8 w-full">
                        
                        {/* Control Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 w-full">
                            <div className="relative w-full max-w-lg group">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-sada-red transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="SEARCH PROJECTS..."
                                    className="w-full h-11 pl-8 bg-transparent border-b border-border rounded-none text-[11px] font-bold tracking-[0.2em] outline-none focus:border-sada-red transition-all uppercase placeholder:text-muted-foreground/40"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                {/* VIEW MODE SWITCHER */}
                                <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border h-12">
                                    <button 
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                        title="Grid View"
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                        title="List View"
                                    >
                                        <List size={18} />
                                    </button>
                                </div>

                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="h-12 px-8 bg-sada-red text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-sada-red/20 shrink-0"
                                >
                                    <Plus size={16} strokeWidth={3} /> Add New Project
                                </button>
                            </div>
                        </div>

                        {/* CONTENT AREA: LIST VS GRID */}
                        <div className="w-full transition-all duration-300">
                            {filteredProjects.length > 0 ? (
                                viewMode === 'list' ? (
                                    /* LIST VIEW */
                                    <div className="bg-card rounded-[24px] border border-border shadow-sm overflow-hidden animate-in fade-in duration-500">
                                        <DataTableBase data={filteredProjects} columns={columns} />
                                    </div>
                                ) : (
                                    /* GRID VIEW */
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                                        {filteredProjects.map((project: any) => (
                                            <ProjectGridCard 
                                                key={project.id} 
                                                project={project} 
                                                workspaceSlug={workspace.slug} 
                                            />
                                        ))}
                                    </div>
                                )
                            ) : (
                                /* EMPTY STATE */
                                <div className="py-32 text-center border border-dashed border-border rounded-[32px] bg-card/20">
                                    <Zap className="mx-auto mb-4 text-muted-foreground/20" size={48} />
                                    <p className="uppercase tracking-[0.3em] text-muted-foreground text-[10px] font-black italic">
                                        No Projects Detected in This Sector
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="py-32 text-center border border-dashed border-border rounded-[32px] bg-muted/5">
                            <Users2 className="mx-auto mb-4 text-muted-foreground/20" size={48} />
                            <p className="uppercase tracking-[0.3em] text-muted-foreground text-[10px] font-black">
                                Personnel Management Module Offline
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <WorkspaceSettings 
                            workspace={workspace} 
                            isSuperAdmin={auth.user.roles?.includes('super-admin')} 
                            companies={companies}
                        />
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