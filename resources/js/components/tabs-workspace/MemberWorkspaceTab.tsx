import React, { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import DataTableBase from '@/components/DataTableBase'; // Sesuaikan path-nya
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2 } from 'lucide-react';

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
}

export default function WorkspaceMembers({ workspace, members }: Props) {
    const { auth }: any = usePage().props;

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
                        <div class="font-black text-[12px] uppercase tracking-wider">${data.name}</div>
                        <div class="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">${data.email}</div>
                    </div>
                </div>
            `
        },
        {
            title: "Role",
            data: "roles",
            render: (roles: any[]) => {
                const roleName = roles[0]?.name || 'Member';
                return `<span class="px-2.5 py-1 rounded-lg bg-muted border border-border text-[10px] font-black uppercase tracking-widest">${roleName}</span>`;
            }
        },
        {
            title: "Joined At",
            data: "joined_at",
            render: (date: string) => `<span class="text-muted-foreground font-bold text-[11px] uppercase">${date}</span>`
        },
        {
            title: "Actions",
            data: null,
            orderable: false,
            className: "text-right",
            render: (data: Member) => {
                // Jangan nampilin tombol delete buat diri sendiri
                if (data.id === auth.user.id) return '';
                return `
                    <button class="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors cursor-pointer text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                `;
            }
        }
    ], [auth.user.id]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/30 p-6 rounded-xl border border-border/50">
                <div>
                    <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-foreground">Workspace Members</h3>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                        Kelola akses karyawan ke workspace <span className="text-red-500">{workspace.name}</span>
                    </p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] px-6 h-11 rounded-xl shadow-lg shadow-red-500/20 border-none transition-all active:scale-95">
                    <UserPlus size={14} className="mr-2" strokeWidth={3} /> Invite Employee
                </Button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
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
    );
}