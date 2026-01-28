import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import WorkspaceLayout from '@/layouts/workspaces/WorkspaceLayout';
import DataTableBase from '@/components/DataTableBase';
import { getProjectColumns } from '@/components/tabs-workspace/ProjectColumns';
import CreateProjectModal from '@/components/tabs-workspace/CreateProjectModal';
import WorkspaceSettings from '@/components/tabs-workspace/WorkspaceSettings'; // Import komponen lo
import { Search, Plus, Zap, Users2 } from 'lucide-react';

export default function WorkspaceShow({ workspace, projects, auth, companies }: any) {
    const [activeTab, setActiveTab] = useState<'projects' | 'members' | 'settings'>('projects');
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

            {/* Container: px-0 agar lurus vertikal dengan teks menu di Tabs Layout */}
            <div className="w-full flex flex-col gap-8 py-8 animate-in fade-in duration-700">
                
                {activeTab === 'projects' && (
                    <div className="flex flex-col gap-8 w-full">
                        
                        {/* Control Bar: Kalibrasi Presisi Lurus Kiri */}
                        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 w-full">
                            <div className="relative w-full max-w-lg group">
                                {/* Icon Search nempel di kiri (left-0) sejajar teks Tabs */}
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-sada-red transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="SEARCH PROJECTS..."
                                    className="w-full h-11 pl-8 bg-transparent border-b border-border rounded-none text-[11px] font-bold tracking-[0.2em] outline-none focus:border-sada-red transition-all uppercase placeholder:text-muted-foreground/40"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full sm:w-auto h-12 px-8 bg-sada-red text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-sada-red/20 shrink-0"
                            >
                                <Plus size={16} strokeWidth={3} /> Add New Project
                            </button>
                        </div>

                        {/* Table Container: Lurus dengan Search Bar */}
                        <div className="bg-card rounded-[24px] border border-border shadow-sm overflow-hidden w-full transition-all duration-300">
                            {filteredProjects.length > 0 ? (
                                <DataTableBase data={filteredProjects} columns={columns} />
                            ) : (
                                <div className="py-32 text-center">
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