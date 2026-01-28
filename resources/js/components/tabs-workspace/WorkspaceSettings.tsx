import React from 'react';
import { useForm } from '@inertiajs/react';
import { Trash2, Save, ShieldCheck } from 'lucide-react';

// 1. Tambahkan company_id di tipe data biar TS nggak komplain
type WorkspaceFormData = {
    name: string;
    description: string;
    status: 'active' | 'inactive';
    company_id: number | string;
};

type EmptyForm = Record<string, never>;

// 2. Terima props isSuperAdmin dan list companies dari WorkspaceShow
export default function WorkspaceSettings({ workspace, isSuperAdmin, companies }: any) {
    
    const { data, setData, put, processing: updating } = useForm<WorkspaceFormData>({
        name: workspace.name || '',
        description: workspace.description || '',
        status: workspace.status || 'active',
        company_id: workspace.company_id || '', // Inisialisasi ID company
    });

    const { delete: destroy, processing: deleting } = useForm<EmptyForm>({});

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/workspaces/${workspace.slug}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                // Update state lokal dengan data terbaru dari server
                const updatedWorkspace = page.props.workspace as any;
                setData({
                    name: updatedWorkspace.name,
                    description: updatedWorkspace.description || '',
                    status: updatedWorkspace.status as 'active' | 'inactive',
                    company_id: updatedWorkspace.company_id
                });
                alert('PROTOCOL UPDATED SUCCESSFULLY');
            },
            onError: (errors) => {
                // Sekarang lo bisa liat error validasi langsung di alert kalau ada yang kurang
                console.error(errors);
                alert('Update failed: ' + Object.values(errors).join(', '));
            }
        });
    };

    const handleDelete = () => {
        if (confirm('PROTOKOL PENGHAPUSAN: Semua data sektor akan dihapus permanen.')) {
            destroy(`/workspaces/${workspace.slug}`);
        }
    };

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-700 pb-20 w-full">
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-[32px] overflow-hidden">
                <div className="p-8 border-b border-zinc-100 dark:border-white/5">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
                        General Protocol
                    </h3>
                    <p className="text-[10px] text-zinc-500 uppercase mt-1 italic">
                        Update workspace configuration
                    </p>
                </div>

                <form onSubmit={handleUpdate} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* INPUT NAME */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-400 italic">
                                Workspace Name
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 rounded-2xl px-6 text-zinc-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-red-600 transition-all"
                            />
                        </div>

                        {/* SELECT STATUS */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-400 italic">
                                Operational Status
                            </label>
                            <div className="relative">
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value as 'active' | 'inactive')}
                                    className="w-full h-14 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 rounded-2xl px-6 text-zinc-900 dark:text-white font-bold outline-none appearance-none cursor-pointer"
                                >
                                    <option value="active">ACTIVE PROTOCOL</option>
                                    <option value="inactive">INACTIVE / STANDBY</option>
                                </select>
                                <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* KHUSUS SUPER ADMIN: Pilih Company */}
                        {isSuperAdmin && (
                            <div className="space-y-3 md:col-span-2 animate-in slide-in-from-top-2 duration-500">
                                <label className="text-[10px] font-black uppercase text-red-500 italic">
                                    Assign to Company (Super Admin Only)
                                </label>
                                <select
                                    value={data.company_id}
                                    onChange={e => setData('company_id', e.target.value)}
                                    className="w-full h-14 bg-red-50/10 dark:bg-red-900/5 border border-red-200/50 dark:border-red-900/20 rounded-2xl px-6 text-zinc-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-red-500"
                                >
                                    <option value="">Select Company</option>
                                    {companies?.map((company: any) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-400 italic">
                            Briefing
                        </label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 text-zinc-900 dark:text-white min-h-[140px] outline-none focus:ring-1 focus:ring-red-600 transition-all"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={updating}
                            className="h-14 px-10 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-3"
                        >
                            <Save size={16} /> {updating ? 'Saving...' : 'Update Protocol'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-red-500/[0.03] border border-red-500/20 rounded-[32px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="max-w-md text-left">
                    <h4 className="text-[11px] font-black text-red-500 uppercase">
                        Destroy Entire Sector
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-2 font-medium">
                        Semua data yang sudah dihapus tidak dapat dipulihkan dari mainframe.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-14 px-8 border-2 border-red-500/30 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center gap-3 shrink-0"
                >
                    <Trash2 size={16} /> Terminate Sector
                </button>
            </div>
        </div>
    );
}