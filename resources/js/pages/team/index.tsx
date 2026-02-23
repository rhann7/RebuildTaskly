import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Users, ShieldCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import HeaderBase from '@/components/HeaderBase';
import DataTableBase from '@/components/DataTableBase';
import { getTeamColumns } from '@/components/team/TeamColumns';

interface Member {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
    managed_workspace?: { name: string };
}

interface Props {
    members: Member[];
    workspaces: { id: number; name: string }[];
    availableRoles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Command Center', href: '/dashboard' },
    { title: 'Tactical Team', href: '/team' },
];

export default function TeamIndex({ members, workspaces, availableRoles }: Props) {
    const { auth } = usePage<any>().props;
    
    // FIX LOGIC: Cek role dari array roles (standar Spatie/Laravel)
    // Kita tambahkan 'company' ke dalam list yang diizinkan (canDeploy)
    const canDeploy = useMemo(() => {
        const userRoles = auth.user.roles?.map((r: any) => typeof r === 'string' ? r : r.name) || [];
        // Masukkan semua role yang boleh tambah employee di sini
        return userRoles.some((role: string) => 
            ['super-admin', 'owner', 'company', 'admin'].includes(role.toLowerCase())
        );
    }, [auth.user]);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const columns = useMemo(() => getTeamColumns(), []);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        role: 'member',
        workspace_id: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canDeploy) return;

        post('/team', {
            onSuccess: () => {
                reset();
                setIsAddOpen(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="TACTICAL TEAM" />

            <div className="mx-auto w-full max-w-[1600px] flex flex-col gap-8 p-6 md:p-10 animate-in fade-in duration-700">
                
                <HeaderBase 
                    title="Personnel" 
                    subtitle="Deployment"
                    stats={[
                        { label: "Total Units", value: members.length, icon: Users },
                        { label: "Authorized", value: members.filter(m => m.roles.length > 0).length, icon: ShieldCheck, color: "text-sada-red" }
                    ]}
                    addButton={{
                        label: isAddOpen ? "Abort Operation" : "Deploy New Unit",
                        onClick: () => setIsAddOpen(!isAddOpen),
                        show: canDeploy // Sekarang tombol muncul buat Company
                    }}
                />

                {isAddOpen && canDeploy && (
                    <div className="bg-card border-2 border-dashed border-sada-red/30 rounded-[32px] p-8 animate-in zoom-in-95 duration-300">
                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-zinc-500">Codename</label>
                                <input 
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm font-bold focus:ring-2 focus:ring-sada-red outline-none transition-all" 
                                    placeholder="Full Name"
                                />
                                {errors.name && <p className="text-red-500 text-[9px] uppercase font-black mt-1 ml-2">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-zinc-500">Neural Link (Email)</label>
                                <input 
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm font-bold focus:ring-2 focus:ring-sada-red outline-none transition-all" 
                                    placeholder="email@tactical.com"
                                />
                                {errors.email && <p className="text-red-500 text-[9px] uppercase font-black mt-1 ml-2">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-zinc-500">Access Level</label>
                                <select 
                                    value={data.role}
                                    onChange={e => setData('role', e.target.value)}
                                    className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm font-bold focus:ring-2 focus:ring-sada-red outline-none appearance-none cursor-pointer"
                                >
                                    {availableRoles.map(r => (
                                        <option key={r} value={r} className="bg-white text-zinc-900">{r.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            {data.role === 'manager' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-zinc-500">Assign Sector</label>
                                    <select 
                                        value={data.workspace_id}
                                        onChange={e => setData('workspace_id', e.target.value)}
                                        className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm font-bold focus:ring-2 focus:ring-sada-red outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Workspace</option>
                                        {workspaces.map(w => (
                                            <option key={w.id} value={w.id} className="bg-white text-zinc-900">{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="md:col-span-4 flex justify-end items-center gap-4 border-t border-border/50 pt-6 mt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    disabled={processing}
                                    className="bg-zinc-900 text-white px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sada-red transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Authorizing...' : 'Confirm Authorization'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden min-h-[400px]">
                    <div className="p-2">
                        <DataTableBase 
                            data={members} 
                            columns={columns}
                            options={{
                                pageLength: 10,
                                order: [[0, 'asc']],
                            }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}