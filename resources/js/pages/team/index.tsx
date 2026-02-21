import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react'; // Tambah usePage
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
    // 1. Ambil data user yang sedang login dari Global Props Inertia
    const { auth } = usePage<any>().props;
    
    // 2. Logic Proteksi: Tentukan siapa yang berhak menambah unit
    // Sesuaikan 'admin' atau 'owner' dengan string role yang lo pake di DB
    const canDeploy = auth.user.role === 'admin' || auth.user.role === 'owner' || auth.user.role === 'super-admin';

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
        // Proteksi tambahan sebelum kirim request
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
                
                {/* HeaderBase dengan kontrol visibilitas tombol */}
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
                        // Tombol cuma muncul jika canDeploy = true
                        show: canDeploy 
                    }}
                />

                {/* Form Add Member dengan proteksi ganda */}
                {isAddOpen && canDeploy && (
                    <div className="bg-card border-2 border-dashed border-sada-red/30 rounded-[32px] p-8 animate-in zoom-in-95 duration-300">
                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-2">Codename</label>
                                <input 
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm focus:ring-2 focus:ring-sada-red outline-none" 
                                    placeholder="Full Name"
                                />
                                {errors.name && <p className="text-red-500 text-[9px] uppercase font-bold">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-2">Neural Link (Email)</label>
                                <input 
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm focus:ring-2 focus:ring-sada-red outline-none" 
                                    placeholder="email@tactical.com"
                                />
                                {errors.email && <p className="text-red-500 text-[9px] uppercase font-bold">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-2">Access Level</label>
                                <select 
                                    value={data.role}
                                    onChange={e => setData('role', e.target.value)}
                                    className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm focus:ring-2 focus:ring-sada-red outline-none"
                                >
                                    {availableRoles.map(r => (
                                        <option key={r} value={r}>{r.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            {data.role === 'manager' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-2">Assign Sector</label>
                                    <select 
                                        value={data.workspace_id}
                                        onChange={e => setData('workspace_id', e.target.value)}
                                        className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm focus:ring-2 focus:ring-sada-red outline-none"
                                    >
                                        <option value="">Select Workspace</option>
                                        {workspaces.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="md:col-span-4 flex justify-end">
                                <button 
                                    disabled={processing}
                                    className="bg-foreground text-background px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sada-red hover:text-white transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : 'Confirm Authorization'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table Area */}
                <div className="bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden min-h-[400px]">
                    <DataTableBase 
                        data={members} 
                        columns={columns}
                        options={{
                            order: [[0, 'asc']],
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}