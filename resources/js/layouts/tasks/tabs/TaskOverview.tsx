import {
    StickyNote,
    Target,
    User as UserIcon,
    Plus,
    Activity,
    Shield,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import AddSubTaskModal from '@/components/tabs-project/CreateSubTasksModal';
import { SubTaskItem } from '../subtask/SubTaskItem';

interface Props {
    task: any;
    isManager?: boolean;
    workspace: any;
    project: any;
}

export const TaskOverview = ({ task, isManager = false, workspace, project }: Props) => {
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* --- KIRI: MISSION PARAMETERS & SUB-TASKS --- */}
            <div className="lg:col-span-2 flex flex-col gap-8">

                {/* 1. Description Card */}
                <div className="bg-white dark:bg-zinc-900/40 border border-border rounded-[40px] p-8 md:p-10 relative overflow-hidden shadow-sm group">
                    <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] dark:opacity-[0.05] rotate-12 select-none pointer-events-none text-sada-red transition-transform duration-1000 group-hover:scale-110">
                        <StickyNote size={300} />
                    </div>
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-sada-red uppercase tracking-[0.2em] italic">Description</span>
                            {isManager && <Shield size={10} className="text-sada-red opacity-50" />}
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed italic opacity-90 max-w-2xl font-medium mt-2 whitespace-pre-line">
                            {task.description || "No specific mission parameters defined for this task."}
                        </p>
                    </div>
                </div>

                {/* 2. Sub-Tasks Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-end px-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-black uppercase flex items-center gap-3 tracking-tighter text-zinc-900 dark:text-white">
                                <Target className="text-sada-red" size={20} />
                                Operational Objectives
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">
                                {task.subtasks?.length || 0} Objectives Identified
                            </p>
                        </div>

                        {/* TOMBOL DIBUKA UNTUK SEMUA ROLE (isManager dihapus) */}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="h-10 px-5 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-sada-red hover:text-white transition-all shadow-lg active:scale-95 group/btn"
                        >
                            <Plus size={14} strokeWidth={3} className="group-hover/btn:rotate-90 transition-transform duration-300" /> 
                            Add Objective
                        </button>
                    </div>

                    <AddSubTaskModal
                        isOpen={isAddModalOpen}
                        setIsOpen={setIsAddModalOpen}
                        workspace={workspace}
                        project={project}
                        task={task}
                    />

                    <div className="grid grid-cols-1 gap-4">
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
                            <div className="py-20 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[40px] flex flex-col items-center justify-center opacity-30">
                                <Target size={48} className="mb-4 text-muted-foreground" />
                                <p className="text-[11px] font-black uppercase tracking-[0.4em]">Zero Objectives Found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- KANAN: SIDEBAR --- */}
            <div className="lg:col-span-1 flex flex-col gap-6">

                {/* Field Operatives Card */}
                <div className="bg-zinc-50 dark:bg-white/[0.02] border border-dashed border-zinc-200 dark:border-white/10 rounded-[32px] p-6 flex flex-col gap-5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60 flex items-center gap-2">
                        <UserIcon size={10} className="text-sada-red" /> Operatives In-Field
                    </span>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {operatives.length > 0 ? (
                            operatives.map((user: any) => (
                                <div key={user.id} className="group relative">
                                    <div className="size-11 rounded-xl ring-2 ring-background bg-zinc-800 border border-border overflow-hidden shadow-lg hover:scale-110 hover:-translate-y-1 transition-all duration-300">
                                        <img 
                                            src={user.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`} 
                                            alt={user.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl z-30 border border-white/10">
                                        {user.name}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] font-bold text-zinc-400 italic py-2">No active operatives detected.</p>
                        )}
                    </div>
                </div>

                {/* Meta Card */}
                <div className="px-6 py-5 bg-zinc-900 dark:bg-white border border-zinc-800 dark:border-zinc-200 rounded-[32px] shadow-xl shadow-black/10">
                   <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-sada-red dark:text-zinc-400 uppercase tracking-widest">Deadline Terminal</span>
                            <span className="text-xs font-black text-white dark:text-black uppercase italic tracking-tight">
                                {task.due_date || 'Undetermined'}
                            </span>
                        </div>
                        <div className="size-8 rounded-lg bg-white/5 dark:bg-black/5 flex items-center justify-center border border-white/10 dark:border-black/10">
                            <Activity size={14} className="text-sada-red animate-pulse" />
                        </div>
                   </div>
                </div>
            </div>
        </div>
    );
};