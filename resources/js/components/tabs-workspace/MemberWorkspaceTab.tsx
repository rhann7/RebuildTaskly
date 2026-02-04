import React, { useMemo, useState } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import DataTableBase from '@/components/DataTableBase'; 
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"; // Asumsi pake Shadcn Dialog

interface Member {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
    joined_at: string;
}

interface Props {
    workspace: any;
    members: Member[];
    allEmployees: any[]; // Tambahin ini dari controller
}

export default function WorkspaceMembers({ workspace, members, allEmployees = [] }: Props) {
    const { auth }: any = usePage().props;
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        user_id: '',
    });

    const submitInvite = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Pake workspace.slug, bukan workspace.id
        post(`/workspaces/${workspace.slug}/members`, {
            onSuccess: () => {
                setIsInviteModalOpen(false);
                reset();
            },
        });
    };

    const columns = useMemo(() => [
        {
            title: "Member",
            data: null,
            render: (data: Member) => `
                <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-full bg-red-500/10 flex items-center justify-center text-[11px] font-black text-red-500 border border-red-500/20">
                        ${data.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div class="font-black text-[12px] uppercase tracking-wider text-foreground">${data.name}</div>
                        <div class="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">${data.email}</div>
                    </div>
                </div>
            `
        },
        {
            title: "Role",
            data: null, // Ubah jadi null biar dapet full object
            render: (data: any) => {
                if (data.is_manager) {
                    return `<span class="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500">MANAGER</span>`;
                }
                const roleName = data.roles[0]?.name || 'Member';
                return `<span class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400">${roleName}</span>`;
            }
        },
        {
            title: "Joined At",
            data: "joined_at",
            render: (date: string) => `<span class="text-muted-foreground font-black text-[11px] uppercase tracking-widest">${date}</span>`
        },
        {
            title: "Actions",
            data: null,
            orderable: false,
            className: "text-right",
            render: (data: Member) => {
                if (data.id === auth.user.id) return '';
                return `
                    <button class="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all cursor-pointer text-muted-foreground/50 hover:border-red-500/20 border border-transparent">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                `;
            }
        }
    ], [auth.user.id]);

    return (
        <div className="space-y-6 mt-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/30 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
                <div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-red-600"></span>
                        Workspace Roster
                    </h3>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-2">
                        Kelola akses tim untuk <span className="text-red-500 font-black">{workspace.name}</span>
                    </p>
                </div>
                <Button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] px-6 h-11 rounded-xl shadow-lg shadow-red-500/20 border-none transition-all active:scale-95"
                >
                    <UserPlus size={14} className="mr-2" strokeWidth={3} /> Invite Employee
                </Button>
            </div>

            {/* Table Section */}
            <div className="bg-card/50 border border-border rounded-2xl overflow-hidden shadow-sm backdrop-blur-sm">
                <DataTableBase 
                    columns={columns} 
                    data={members} 
                    options={{
                        pageLength: 10,
                        order: [[0, 'asc']]
                    }}
                />
            </div>

            {/* Invite Modal */}
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-black uppercase tracking-[0.2em]">Invite Employee</DialogTitle>
                        <DialogDescription className="text-[11px] font-bold text-muted-foreground uppercase mt-1">
                            Pilih karyawan dari perusahaan untuk ditambahkan.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitInvite} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Employee</label>
                            <select 
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-[12px] font-bold text-foreground focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all appearance-none"
                                value={data.user_id}
                                onChange={e => setData('user_id', e.target.value)}
                            >
                                <option value="">Pilih Karyawan...</option>
                                {allEmployees.map((emp: any) => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                                ))}
                            </select>
                            {errors.user_id && <p className="text-red-500 text-[10px] font-black uppercase tracking-tighter">{errors.user_id}</p>}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsInviteModalOpen(false)}
                                className="text-[10px] font-black uppercase tracking-widest rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest px-8 rounded-xl"
                            >
                                {processing ? 'Processing...' : 'Add to Workspace'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}