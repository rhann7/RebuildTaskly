import React from 'react';
import { useForm } from '@inertiajs/react';
import { Trash2, Save, ShieldCheck, AlertTriangle } from 'lucide-react';
import InputError from '@/components/input-error';

/* =======================
    TYPES
======================= */
interface Project {
    id: number;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    slug: string;
    priority: 'low' | 'medium' | 'high'; // Tambahkan ini
    due_date?: string;
}

interface Workspace {
    id: number;
    slug: string;
}

interface ProjectSettingsTabProps {
    project: Project;
    workspace: Workspace;
    isSuperAdmin: boolean;
}

/* =======================
    COMPONENT
======================= */
export default function ProjectSettingsTab({
    project,
    workspace,
    isSuperAdmin,
}: ProjectSettingsTabProps) {

    // Form Update dengan Type Safety
    const { data, setData, patch, processing: updating, errors } = useForm({
        name: project.name ?? '',
        description: project.description ?? '',
        status: project.status ?? 'active',
        priority: project.priority ?? 'medium', // Initialize
        due_date: project.due_date ?? '',       // Initialize
    });

    // Form Khusus Deletion
    const { delete: destroy, processing: deleting } = useForm();

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/workspaces/${workspace.slug}/projects/${project.slug}`, {
            preserveScroll: true,
            onSuccess: () => alert('PROJECT PARAMETERS UPDATED'),
        });
    };

    const handleDelete = () => {
        if (confirm('PROTOKOL PENGHAPUSAN: Semua data task dalam project ini akan dimusnahkan secara permanen.')) {
            destroy(`/workspaces/${workspace.slug}/projects/${project.slug}`);
        }
    };

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 w-full">
            
            {/* SECTION 1: IDENTITY CONFIGURATION */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                            <Save size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                                Project Configuration
                            </h3>
                            <p className="text-[10px] text-muted-foreground uppercase mt-1 font-bold">
                                Project configuration & parameters
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* PROJECT NAME */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
                                Project Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full h-14 bg-muted/30 border border-border rounded-xl px-6 text-foreground font-bold outline-none focus:ring-2 focus:ring-sada-red/20 focus:border-sada-red transition-all uppercase placeholder:opacity-20"
                                placeholder="E.G. OPERATION OVERLORD"
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* PROJECT STATUS */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
                                Project Status
                            </label>
                            <div className="relative group">
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value as 'active' | 'inactive')}
                                    className="w-full h-14 bg-muted/30 border border-border rounded-xl px-6 text-foreground font-bold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-sada-red/20 transition-all uppercase"
                                >
                                    <option value="active" className="bg-card">Active</option>
                                    <option value="inactive" className="bg-card">Standby / Inactive</option>
                                </select>
                                <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-sada-red pointer-events-none transition-colors" size={18} />
                            </div>
                        </div>
                        {/* TAMBAHKAN PRIORITY */}
                        <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
                                Priority Level
                                </label>
                                <select
                                    value={data.priority}
                                    onChange={e => setData('priority', e.target.value as any)}
                                    className="w-full h-14 bg-muted/30 border border-border rounded-xl px-6 text-foreground font-bold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-sada-red/20 transition-all uppercase">
                                    <option value="low">Low Priority</option>
                                     <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                 </select>
                            <InputError message={errors.priority} />
                        </div>
                        {/* TAMBAHKAN DUE DATE */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
                                Deadline / Due Date
                            </label>
                            <input
                                type="date"
                                value={data.due_date}
                                onChange={e => setData('due_date', e.target.value)}
                                className="w-full h-14 bg-muted/30 border border-border rounded-xl px-6 text-foreground font-bold outline-none focus:ring-2 focus:ring-sada-red/20 transition-all"
                            />
                            <InputError message={errors.due_date} />
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
                            Project Description
                        </label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Describe your project..."
                            className="w-full bg-muted/30 border border-border rounded-xl p-6 text-foreground font-medium min-h-[140px] outline-none focus:ring-2 focus:ring-sada-red/20 focus:border-sada-red transition-all italic placeholder:opacity-20"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={updating}
                            className="h-14 px-10 bg-primary text-primary-foreground rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3 shadow-xl cursor-pointer"
                        >
                            <Save size={16} strokeWidth={3} />
                            {updating ? 'SYNCING...' : 'COMMIT CHANGES'}
                        </button>
                    </div>
                </form>
            </div>

            {/* SECTION 2: DANGER ZONE */}
            <div className="bg-sada-red/[0.03] border border-sada-red/20 rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors hover:bg-sada-red/[0.05]">
                <div className="flex items-center gap-5 text-left w-full">
                    <div className="size-12 rounded-lg bg-sada-red/10 flex items-center justify-center text-sada-red shrink-0 border border-sada-red/20">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="max-w-md">
                        <h4 className="text-[11px] font-black text-sada-red uppercase tracking-wider">
                            DANGER ZONE
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold leading-relaxed">
                            Once a project is purged, all its tasks and data associated with it are lost forever.
                        </p>
                    </div>
                </div>
                
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-14 px-8 border-2 border-sada-red/30 text-sada-red rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-sada-red hover:text-white transition-all flex items-center gap-3 shrink-0 active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-sada-red/10"
                >
                    <Trash2 size={16} strokeWidth={3} />
                    {deleting ? 'PURGING...' : 'DELETE PROJECT'}
                </button>
            </div>
        </div>
    );
}