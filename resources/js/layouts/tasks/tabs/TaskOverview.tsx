import {
    StickyNote,
    Target,
    User as UserIcon,
    Plus,
    Activity,
    Shield,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { SubTaskItem } from '../subtask/SubTaskItem';
// PASTIKAN IMPORT MODAL INI BENAR (sesuaikan path-nya)
import AddSubTaskModal from '@/components/tabs-project/CreateSubTasksModal';

interface Props {
    task: any;
    isManager?: boolean;
    workspace: any;
    project: any;
}

export const TaskOverview = ({ task, isManager = false, workspace, project }: Props) => {
    // State untuk mengontrol Modal Add Subtask
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    /**
     * LOGIC: Operatives In-Field
     * Mengambil data unik dari project users dan completer subtask.
     */
    const operatives = useMemo(() => {
        const projectUsers = project.users || [];
        const completers = task.subtasks?.map((s: any) => s.completer).filter(Boolean) || [];
        const combined = [...projectUsers, ...completers];
        return Array.from(new Map(combined.map(user => [user.id, user])).values());
    }, [project.users, task.subtasks]);

    task.subtasks.filter((s: any) => Boolean(s.is_completed)).length

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* --- KIRI: MISSION PARAMETERS & SUB-TASKS --- */}
            <div className="lg:col-span-2 flex flex-col gap-8">

                {/* 1. Description Card */}
                <div className="bg-card border border-border rounded-[40px] p-8 md:p-10 relative overflow-hidden shadow-sm group">
                    <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] rotate-12 select-none pointer-events-none text-sada-red transition-transform duration-1000 group-hover:scale-110">
                        <StickyNote size={300} />
                    </div>
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-sada-red uppercase tracking-[0.2em] italic">Description</span>
                            {isManager && <Shield size={10} className="text-sada-red opacity-50" />}
                        </div>
                        <p className="text-foreground text-sm leading-relaxed italic opacity-90 max-w-2xl font-medium mt-2 whitespace-pre-line">
                            {task.description || "No specific mission parameters defined for this task."}
                        </p>
                    </div>
                </div>

                {/* 2. Sub-Tasks Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-end px-4 border-b border-border pb-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-black uppercase flex items-center gap-3 text-foreground">
                                <Target className="text-sada-red" size={20} />
                                Subtask List
                            </h3>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                {task.subtasks && task.subtasks.length > 0
                                    ? `${task.subtasks.filter((s: any) => s.is_completed).length} of ${task.subtasks.length} Subtasks Completed`
                                    : 'No Subtasks Added'}
                            </span>
                        </div>

                        {/* TOMBOL ADD OBJECTIVE */}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="h-10 px-5 bg-foreground text-background rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:scale-95 transition-all shadow-md group/btn"
                        >
                            <Plus size={14} strokeWidth={3} className="group-hover/btn:rotate-90 transition-transform duration-300" />
                            Add Sub Task
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {task.subtasks && task.subtasks.length > 0 ? (
                            task.subtasks.map((sub: any) => (
                                <SubTaskItem
                                    key={sub.id}
                                    sub={sub}
                                    workspace={workspace}
                                    project={project}
                                    task={task}
                                />
                            ))
                        ) : (
                            <div className="py-20 border-2 border-dashed border-border rounded-[40px] flex flex-col items-center justify-center bg-muted/10 opacity-60">
                                <Target size={48} className="mb-4 text-muted-foreground/30" />
                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em]">Zero Objectives Found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- KANAN: SIDEBAR --- */}
            <div className="lg:col-span-1 flex flex-col gap-6">

                {/* Field Operatives Card */}
                <div className="bg-muted/30 border border-dashed border-border rounded-[32px] p-6 flex flex-col gap-5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic flex items-center gap-2">
                        <UserIcon size={12} className="text-sada-red" /> Assignee
                    </span>

                    <div className="flex flex-wrap items-center gap-3">
                        {operatives.length > 0 ? (
                            operatives.map((user: any) => (
                                <div key={user.id} className="group relative">
                                    <div className="size-11 rounded-xl ring-2 ring-background bg-muted border border-border overflow-hidden shadow-sm hover:scale-110 hover:-translate-y-1 transition-all duration-300">
                                        <img
                                            src={user.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl z-30">
                                        {user.name}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] font-bold text-muted-foreground italic py-2">No active operatives detected.</p>
                        )}
                    </div>
                </div>

                {/* Meta Card */}
                <div className="px-6 py-5 bg-card border border-border rounded-[32px] shadow-sm">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-sada-red uppercase tracking-[0.2em]">Deadline Terminal</span>
                            <span className="text-xs font-black text-foreground uppercase tracking-tight">
                                {task.due_date || 'Undetermined'}
                            </span>
                        </div>
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center border border-border">
                            <Activity size={16} className="text-sada-red animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL TAMBAH SUBTASK */}
            <AddSubTaskModal
                isOpen={isAddModalOpen}
                setIsOpen={setIsAddModalOpen}
                project={project}
                workspace={workspace}
                task={task}
            />

        </div>
    );
};