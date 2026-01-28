import { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import DataTableBase from '@/components/DataTableBase';
import { getProjectColumns } from '@/components/tabs-workspace/ProjectColumns'; // Gunakan kolom yang sudah kita rapikan tadi
import { Search, Plus, Briefcase, Settings2, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProjectIndex({ projects, workspaces, filters, pageConfig, isSuperAdmin, workspace }: any) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Workspaces', href: '/workspaces' },
        { title: workspace.name, href: `/workspaces/${workspace.slug}` },
        { title: 'Projects', href: '#' },
    ];

    // Gunakan kolom yang sudah kita standarisasi
    const columns = useMemo(() => getProjectColumns(workspace.slug), [workspace.slug]);

    const handleSearch = () => {
        router.get(`/workspaces/${workspace.slug}/projects`, 
            { search: searchQuery }, 
            { preserveState: true, replace: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Projects - ${workspace.name}`} />

            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Header SADA Style */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                        Sector Registry
                    </h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        Active operations within {workspace.name}
                    </p>
                </div>

                {/* Control Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                    <div className="relative w-full max-w-lg group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-sada-red transition-colors" />
                        <Input 
                            type="text"
                            placeholder="Search operation nomenclature..."
                            className="h-12 pl-12 bg-card border-border rounded-xl text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-sada-red/20 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    
                    {pageConfig.can_manage && (
                        <Button 
                            onClick={() => setIsModalOpen(true)}
                            className="h-12 px-8 bg-sada-red hover:bg-sada-red-hover text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-sada-red/20 transition-all active:scale-95"
                        >
                            <Plus className="size-4 mr-2" strokeWidth={3} /> Add New Sector
                        </Button>
                    )}
                </div>

                {/* Table Section */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden w-full transition-all">
                    {projects.data.length > 0 ? (
                        <DataTableBase 
                            data={projects.data} 
                            columns={columns} 
                            options={{ pageLength: 10 }}
                        />
                    ) : (
                        <div className="py-40 text-center border-t border-border">
                            <Briefcase className="mx-auto mb-4 text-muted-foreground/20" size={48} />
                            <p className="uppercase tracking-[0.3em] text-muted-foreground text-[10px] font-black">
                                No Active Operations Detected
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal bisa panggil CreateProjectModal yang sudah kita rapikan tadi */}
        </AppLayout>
    );
}