import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import WorkspaceLayout from '@/layouts/workspaces/WorkspaceLayout';
import DataTableBase from '@/components/DataTableBase';
import { getProjectColumns } from '@/components/tabs-workspace/ProjectColumns';
import CreateProjectModal from '@/components/tabs-workspace/CreateProjectModal';
import WorkspaceSettings from '@/components/tabs-workspace/WorkspaceSettings';
import ProjectGridCard from '@/components/tabs-workspace/ProjectGridCard';
import { ProjectControls } from '@/components/tabs-workspace/ProjectControls';
import { Zap } from 'lucide-react';

export default function WorkspaceShow({ workspace, projects, auth, companies }: any) {
    const [activeTab, setActiveTab] = useState<'projects' | 'members' | 'settings'>('projects');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    // State Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns = useMemo(() => getProjectColumns(workspace.slug), [workspace.slug]);
    
    // Tactical Multi-Filter Logic
    const filteredProjects = useMemo(() => {
        // Cek apakah projects itu object pagination atau array langsung
        const dataArray = Array.isArray(projects) ? projects : (projects.data || []);
        
        return dataArray.filter((p: any) => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Filter Status (jika kosong berarti semua diperbolehkan)
            const matchesStatus = statusFilter.length === 0 || statusFilter.includes(p.status?.toLowerCase());
            
            // Filter Priority (jika kosong berarti semua diperbolehkan)
            const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(p.priority?.toLowerCase());

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [projects, searchQuery, statusFilter, priorityFilter]);

    return (
        <WorkspaceLayout workspace={workspace} activeTab={activeTab} setActiveTab={setActiveTab} projects={projects}>
            <Head title={workspace.name} />

            <div className="w-full flex flex-col gap-4 py-8 animate-in fade-in duration-700">
                
                {activeTab === 'projects' && (
                    <div className="flex flex-col w-full">
                        <ProjectControls 
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            priorityFilter={priorityFilter}
                            setPriorityFilter={setPriorityFilter}
                        />

                        {/* Content Area */}
                        <div className="w-full">
                            {filteredProjects.length > 0 ? (
                                viewMode === 'list' ? (
                                    <div className="bg-card rounded-[24px] border border-border shadow-sm overflow-hidden animate-in fade-in duration-500">
                                        <DataTableBase data={filteredProjects} columns={columns} />
                                    </div>
                                ) : (
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
                                <div className="py-32 text-center border border-dashed border-border rounded-[32px] bg-muted/5">
                                    <Zap className="mx-auto mb-4 text-muted-foreground/20" size={48} />
                                    <p className="uppercase tracking-[0.3em] text-muted-foreground text-[10px] font-black italic">
                                        No Projects Located with Current Parameters
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'members' && ( <div className="py-32 text-center border border-dashed border-border rounded-[32px]">... Personnel Module Offline ...</div> )}
                {activeTab === 'settings' && ( <WorkspaceSettings workspace={workspace} isSuperAdmin={auth.user.roles?.includes('super-admin')} companies={companies} /> )}
            </div>

            <CreateProjectModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} workspace={workspace} />
        </WorkspaceLayout>
    );
}