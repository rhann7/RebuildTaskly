import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import DataTableBase from '@/components/DataTableBase';
import { ProjectControls } from '@/components/tabs-workspace/ProjectControls';
import HeaderBase from '@/components/HeaderBase';
import { NoDataSignal } from '@/components/projects-global/NoDataSignal';
import { getGlobalProjectColumns } from '@/components/projects-global/GlobalProjectColumns';
import { Briefcase, Activity } from 'lucide-react';

export default function Index({ projects, workspaces, filters }: any) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const columns = useMemo(() => getGlobalProjectColumns(), []);

    // FUNGSI STANDAR FILTER (Feedback Point 1 & 2)
    const handleFilterChange = (newFilters: any) => {
        const updatedFilters = { ...filters, ...newFilters };
        
        // Bersihkan filter yang kosong
        Object.keys(updatedFilters).forEach(key => {
            if (!updatedFilters[key] || updatedFilters[key].length === 0) {
                delete updatedFilters[key];
            }
        });

        router.get('/projects', updatedFilters, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            only: ['projects', 'filters']
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Global Projects', href: '/projects' }]}>
            <Head title="Global Projects" />

            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8 p-6 md:p-10 animate-in fade-in duration-700">
                
                <HeaderBase 
                    title="Global" 
                    subtitle="Project"
                    stats={[
                        { label: "Total Assets", value: projects.total, icon: Briefcase },
                        { label: "Active Ops", value: projects.data.length, icon: Activity, color: "text-sada-red" }
                    ]}
                    addButton={{
                        label: "Create Project",
                        onClick: () => {}, // Belum ada modal create global
                        show: false
                    }}
                />

                <ProjectControls 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchQuery={filters.search || ''}
                    setSearchQuery={(val) => handleFilterChange({ search: val })}
                    statusFilter={filters.status || []}
                    setStatusFilter={(val) => handleFilterChange({ status: val })}
                    priorityFilter={filters.priority || []}
                    setPriorityFilter={(val) => handleFilterChange({ priority: val })}
                    workspaces={workspaces} 
                    workspaceFilter={filters.workspaces || []}
                    setWorkspaceFilter={(val) => handleFilterChange({ workspaces: val })}
                />

                <div className="bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden min-h-[400px]">
                    {projects.data.length > 0 ? (
                        <DataTableBase 
                            data={projects.data} 
                            columns={columns}
                            options={{
                                createdRow: (row: HTMLElement, data: any) => {
                                    row.classList.add('cursor-pointer');
                                    row.onclick = () => router.visit(`/workspaces/${data.workspace?.slug}/projects/${data.slug}`);
                                }
                            }}
                        />
                    ) : (
                        <NoDataSignal />
                    )}
                </div>

                <div className="flex justify-between items-center px-4 font-black uppercase italic text-[9px] text-muted-foreground tracking-widest">
                    <span>Operational Range: {projects.from || 0} — {projects.to || 0}</span>
                    <span>Total Intelligence: {projects.total || 0} Assets</span>
                </div>
            </div>
        </AppLayout>
    );
}