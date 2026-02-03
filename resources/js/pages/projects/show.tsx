import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

import TaskTableTab from '@/components/tabs-project/TaskTableTab';
import ProjectSettingsTab from '@/components/tabs-project/ProjectSettingsTab';
import { Users2, CheckCircle2, Settings2 } from 'lucide-react';
import { ProjectDetailHeader } from '@/layouts/projects/partials/ProjectHeader';

export default function ProjectShow({ workspace, project, tasks, isSuperAdmin }: any) {
    const [activeTab, setActiveTab] = useState<'tasks' | 'members' | 'settings'>('tasks');
    
    // State tambahan untuk kontrol tampilan
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Workspaces', href: '/workspaces' },
        { title: workspace.name, href: `/workspaces/${workspace.slug}` },
        { title: project.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} - Project`} />

            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                <div className="flex flex-col gap-6">
                    <ProjectDetailHeader project={project} onAddTask={() => setActiveTab('tasks')} />
                    
                    <div className="flex gap-1 bg-muted/30 p-1 rounded-xl w-fit border border-border">
                        {[
                            { id: 'tasks', label: 'Objectives', icon: CheckCircle2 },
                            { id: 'members', label: 'Personnel', icon: Users2 },
                            { id: 'settings', label: 'Configuration', icon: Settings2 },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-card text-sada-red shadow-sm ring-1 ring-black/5' 
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'tasks' && (
                    <TaskTableTab 
                        project={project} 
                        tasks={tasks} 
                        workspace={workspace}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                )}

                {/* Tab Members & Settings tetep sama */}
                {activeTab === 'members' && (
                    <div className="py-32 text-center border border-dashed border-border rounded-[32px] bg-muted/5">
                        <Users2 className="mx-auto mb-4 text-muted-foreground/20" size={48} />
                        <p className="uppercase tracking-[0.3em] text-muted-foreground text-[10px] font-black">
                            Personnel Module Offline
                        </p>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <ProjectSettingsTab project={project} workspace={workspace} isSuperAdmin={isSuperAdmin} />
                )}
            </div>
        </AppLayout>
    );
}