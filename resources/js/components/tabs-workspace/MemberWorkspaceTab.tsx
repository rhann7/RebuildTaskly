import React, { useMemo, useState } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import DataTableBase from '@/components/DataTableBase';
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2, ChevronDown } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

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
    allEmployees: any[];
}

export default function WorkspaceMembers({ workspace, members, allEmployees = [] }: Props) {
    const { auth }: any = usePage().props;
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // 1. LOGIC OTORITAS: Cek apakah user punya akses manajemen (Boss Level)
    const canManageRoster = auth.user.roles?.some((role: any) => {
        const roleName = typeof role === 'string' ? role : role.name;
        return ['company', 'manager', 'super-admin', 'owner'].includes(roleName);
    });

    const { data, setData, post, processing, reset, errors } = useForm({
        user_id: '',
    });

    const submitInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManageRoster) return;

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
            className: "py-4",
            render: (data: Member) => `
                <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-[11px] font-black text-red-600 border border-red-100 shadow-sm">
                        ${data.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div class="font-black text-[12px] uppercase tracking-wider text-zinc-900">${data.name}</div>
                        <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">${data.email}</div>
                    </div>
                </div>
            `
        },
        {
            title: "Role",
            data: null,
            render: (data: any) => {
                if (data.is_manager) {
                    return `<span class="px-3 py-1 rounded-lg bg-red-50 border border-red-100 text-[10px] font-black uppercase tracking-widest text-red-600 shadow-sm">MANAGER</span>`;
                }
                const roleName = data.roles[0]?.name || 'Member';
                const isManagement = ['company', 'manager', 'super-admin', 'owner'].includes(roleName.toLowerCase());
                
                return isManagement 
                    ? `<span class="px-3 py-1 rounded-lg bg-red-50 border border-red-100 text-[10px] font-black uppercase tracking-widest text-red-600 shadow-sm">${roleName.toUpperCase()}</span>`
                    : `<span class="px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-600">${roleName.toUpperCase()}</span>`;
            }
        },
        {
            title: "Joined At",
            data: "joined_at",
            render: (date: string) => `<span class="text-zinc-500 font-bold text-[11px] uppercase tracking-widest">${date}</span>`
        },
        {
            title: "Actions",
            data: null,
            orderable: false,
            className: "text-right px-6",
            render: (data: Member) => {
                // 2. PROTEKSI TABEL: Sembunyikan tombol hapus jika user login adalah Member
                // Atau jika baris tersebut adalah akun user itu sendiri
                if (!canManageRoster || data.id === auth.user.id) return '';
                
                return `
                    <button class="p-2.5 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all cursor-pointer text-zinc-300 border border-transparent hover:border-red-100 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                `;
            }
        }
    ], [auth.user.id, canManageRoster]);

    return (
        <div className="space-y-6 mt-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm relative overflow-hidden">
                <div className="z-10">
                    <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-zinc-900 flex items-center gap-3">
                        <span className="w-10 h-[3px] bg-red-600 rounded-full"></span>
                        Workspace Members
                    </h3>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-3 ml-13 leading-relaxed">
                        Manajemen personil aktif untuk <span className="text-red-600 font-black decoration-red-200 underline-offset-4 underline">{workspace.name}</span>
                    </p>
                </div>

                {/* 3. PROTEKSI TOMBOL INVITE: Hanya muncul buat Boss Level */}
                {canManageRoster && (
                    <Button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="z-10 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] px-8 h-12 rounded-2xl shadow-xl shadow-red-600/10 border-none transition-all active:scale-95 shrink-0"
                    >
                        <UserPlus size={16} className="mr-3" strokeWidth={3} /> Invite Employee
                    </Button>
                )}

                {/* Decorative Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
            </div>

            {/* Table Section */}
            <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-2">
                    <DataTableBase
                        columns={columns}
                        data={members}
                        options={{
                            pageLength: 10,
                            order: [[0, 'asc']]
                        }}
                    />
                </div>
            </div>

            {/* Invite Modal */}
            {canManageRoster && (
                <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                    <DialogContent className="sm:max-w-[450px] bg-white border-zinc-200 rounded-[32px] p-8">
                        <DialogHeader className="space-y-3">
                            <DialogTitle className="text-[16px] font-black uppercase tracking-[0.2em] text-zinc-900">Invite Employee</DialogTitle>
                            <DialogDescription className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                                Berikan akses operasional ke workspace <span className="text-red-600 font-black">{workspace.name}</span>.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={submitInvite} className="space-y-6 mt-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Identity Selection</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-[12px] font-bold text-zinc-900 focus:ring-4 focus:ring-red-500/5 focus:border-red-600 outline-none transition-all appearance-none cursor-pointer"
                                        value={data.user_id}
                                        onChange={e => setData('user_id', e.target.value)}
                                    >
                                        <option value="">PILIH KARYAWAN...</option>
                                        {allEmployees.map((emp: any) => (
                                            <option key={emp.id} value={emp.id}>{emp.name.toUpperCase()} — {emp.email}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
                                </div>
                                {errors.user_id && <p className="text-red-600 text-[10px] font-black uppercase tracking-tighter mt-1 ml-1">{errors.user_id}</p>}
                            </div>

                            <div className="flex gap-4 mt-8">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="flex-1 text-[10px] font-black uppercase tracking-widest rounded-2xl h-12 hover:bg-zinc-100"
                                >
                                    Abort
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-zinc-900/20 active:scale-95"
                                >
                                    {processing ? 'Authorizing...' : 'Grant Access'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}