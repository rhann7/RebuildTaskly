import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import WorkspaceLayout from '@/layouts/workspaces/WorkspaceLayout';
import DataTableBase from '@/components/DataTableBase';
import { getProjectColumns } from '@/components/tabs-workspace/ProjectColumns';
import CreateProjectModal from '@/components/tabs-workspace/CreateProjectModal';
// 1. IMPORT WorkspaceSettings yang sudah kita buat tadi
import WorkspaceSettings from '@/components/tabs-workspace/WorkspaceSettings'; 
import { Search, Plus, Zap, Users2 } from 'lucide-react';

// 2. TANGKAP isSuperAdmin dan companies di sini
export default function WorkspaceShow({ workspace, projects, isSuperAdmin, companies }: any) {
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

            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* TAB PROJECTS */}
                {activeTab === 'projects' && (
                    <div className="flex flex-col gap-6 w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                            <div className="relative w-full max-w-lg group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-sada-red transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Search project..."
                                    className="w-full h-12 pl-12 pr-6 bg-card border border-border rounded-xl text-[11px] font-bold tracking-widest outline-none focus:ring-2 focus:ring-sada-red/20 focus:border-sada-red transition-all"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full sm:w-auto h-12 px-8 bg-sada-red text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-sada-red-hover transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-sada-red/20 shrink-0"
                            >
                                <Plus size={16} strokeWidth={3} /> Add New Project
                            </button>
                        </div>

                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden w-full transition-all duration-300">
                            <div className="min-w-full align-middle">
                                {filteredProjects.length > 0 ? (
                                    <DataTableBase data={filteredProjects} columns={columns} />
                                ) : (
                                    <div className="py-32 text-center border-t border-border">
                                        <Zap className="mx-auto mb-4 text-muted-foreground/20" size={48} />
                                        <p className="uppercase tracking-[0.3em] text-muted-foreground text-[10px] font-black">
                                            No Projects Detected
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB MEMBERS */}
                {activeTab === 'members' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="py-32 text-center border border-dashed border-border rounded-xl bg-muted/5">
                            <Users2 className="mx-auto mb-4 text-muted-foreground/20" size={48} />
                            <p className="uppercase tracking-[0.3em] text-muted-foreground text-[10px] font-black">
                                Members Module Coming Soon
                            </p>
                        </div>
                    </div>
                )}

                {/* TAB SETTINGS - KITA BALIKIN LAGI KE COMPONENT KITA */}
                {activeTab === 'settings' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center">
                        <WorkspaceSettings 
                            workspace={workspace} 
                            isSuperAdmin={isSuperAdmin} 
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