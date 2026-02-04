import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { UserPlus, User, Briefcase, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        role: 'member',
        workspace_id: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Ganti route('team.store') jadi path string manual '/team'
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

            <div className="p-6 space-y-6">
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-[0.2em] text-foreground uppercase italic">
                            Personnel <span className="text-sada-red">Deployment</span>
                        </h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            Authorize and assign tactical roles to units
                        </p>
                    </div>

                    <button 
                        onClick={() => setIsAddOpen(!isAddOpen)}
                        className="flex items-center gap-2 bg-sada-red hover:bg-red-700 text-white px-6 py-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] text-[10px] font-black uppercase tracking-widest"
                    >
                        <UserPlus size={16} />
                        {isAddOpen ? 'Abort Operation' : 'Deploy New Unit'}
                    </button>
                </div>

                {/* ADD MEMBER FORM */}
                {isAddOpen && (
                    <div className="bg-card border-2 border-dashed border-sada-red/30 rounded-[32px] p-8 animate-in zoom-in-95 duration-300">
                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-2">Codename</label>
                                <input 
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm focus:ring-2 focus:ring-sada-red" 
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
                                    className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm focus:ring-2 focus:ring-sada-red" 
                                    placeholder="email@tactical.com"
                                />
                                {errors.email && <p className="text-red-500 text-[9px] uppercase font-bold">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-2">Access Level</label>
                                <select 
                                    value={data.role}
                                    onChange={e => setData('role', e.target.value)}
                                    className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm focus:ring-2 focus:ring-sada-red"
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
                                        className="w-full bg-muted/30 border-none rounded-2xl h-12 px-4 text-sm focus:ring-2 focus:ring-sada-red"
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
                                    className="bg-foreground text-background px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : 'Confirm Authorization'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TEAM LIST TABLE */}
                <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Personnel</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Clearance</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Sector Assignment</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-sada-red group-hover:text-white transition-all">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-[12px] uppercase tracking-wider">{member.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            member.roles[0]?.name === 'company' 
                                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            : member.roles[0]?.name === 'manager' 
                                            ? 'bg-sada-red/10 text-sada-red border border-sada-red/20' 
                                            : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {member.roles[0]?.name || 'NO ROLE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-muted-foreground italic text-[11px]">
                                            <Briefcase size={14} />
                                            {member.managed_workspace?.name || 'Unassigned / Global'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
