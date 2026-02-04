import { useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import DataTableBase from '@/components/DataTableBase';
import { ProjectControls } from '@/components/tabs-workspace/ProjectControls';
import { ProjectGlobalHero } from '@/components/projects-global/ProjectGlobalHero';
import { NoDataSignal } from '@/components/projects-global/NoDataSignal';
import { getGlobalProjectColumns } from '@/components/projects-global/GlobalProjectColumns';

export default function index({ projects, workspaces, filters }: any) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    
    // State Filter
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<string[]>(filters.status || []);
    const [priorityFilter, setPriorityFilter] = useState<string[]>(filters.priority || []);
    const [workspaceFilter, setWorkspaceFilter] = useState<string[]>(filters.workspaces || []);

    const columns = useMemo(() => getGlobalProjectColumns(), []);

    // Logic: Jalankan router saat salah satu state filter berubah
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/projects', 
                { 
                    search: searchQuery, 
                    status: statusFilter, 
                    priority: priorityFilter,
                    workspaces: workspaceFilter 
                },
                { 
                    preserveState: true, 
                    replace: true, 
                    preserveScroll: true,
                    only: ['projects', 'filters'] // Biar ringan, cuma reload data tabel & filter
                }
            );
        }, 300); // Debounce 300ms biar gak spam request pas ngetik search

        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter, priorityFilter, workspaceFilter]);

    return (
        <AppLayout breadcrumbs={[
    { title: 'Dashboard', href: '/dashboard' }, 
    { title: 'Global Projects', href: '/projects' } // Tambahin href di sini
    ]}>
            <Head title="Global Projects" />

            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8 p-6 md:p-10 animate-in fade-in duration-700">
                
                <ProjectGlobalHero 
                    total={projects.total} 
                    activeCount={projects.data.length} 
                />

                <ProjectControls 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery} // Cukup update state, useEffect yang handle request
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    priorityFilter={priorityFilter}
                    setPriorityFilter={setPriorityFilter}
                    // Tambahan props untuk filter workspace
                    workspaces={workspaces} 
                    workspaceFilter={workspaceFilter}
                    setWorkspaceFilter={setWorkspaceFilter}
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
                    <span>
                        Operational Range: {projects.from || 0} — {projects.to || 0}
                    </span>
                    <span>
                        Total Intelligence: {projects.total || 0} Assets
                    </span>
                </div>
            </div>
        </AppLayout>
    );
}