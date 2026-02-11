import {
    StickyNote,
    Target,
    User,
    Plus,
    ArrowRight,
    Activity,
    Shield,
    CheckCircle2
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import AddSubTaskModal from '@/components/tabs-project/CreateSubTasksModal';
import { SubTaskItem } from '../subtask/SubTaskItem';

interface Props {
    task: any;
    isManager?: boolean;
    workspace: any; // Diwajibkan agar bisa dikirim ke modal
    project: any;    // Diwajibkan agar bisa dikirim ke modal
}

export const TaskOverview = ({ task, isManager = false, workspace, project }: Props) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* --- KIRI: MISSION BRIEF & SUB-TASKS --- */}
            <div className="lg:col-span-2 flex flex-col gap-8">

                {/* 1. Description Card (Mission Parameters) */}
                <div className="bg-white dark:bg-muted/10 border border-border rounded-[40px] p-8 md:p-10 relative overflow-hidden shadow-sm">
                    <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] rotate-12 select-none pointer-events-none text-foreground">
                        <StickyNote size={300} />
                    </div>
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-sada-red uppercase tracking-[0.2em] italic">Mission Parameters</span>
                            {isManager && <Shield size={10} className="text-sada-red opacity-50" />}
                        </div>
                        <p className="text-zinc-600 dark:text-muted-foreground text-sm leading-relaxed italic opacity-90 max-w-2xl font-medium mt-2">
                            {task.description || "No specific mission parameters defined for this objective."}
                        </p>
                    </div>
                </div>

                {/* 2. Sub-Tasks Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-end px-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <Target className="text-sada-red" size={20} />
                                Operational Objectives
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">
                                {task.subtasks?.length || 0} Sub-Tasks Identified
                            </p>
                        </div>

                        {isManager && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="h-10 px-5 bg-zinc-900 text-white rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-sada-red transition-all shadow-lg active:scale-95"
                            >
                                <Plus size={14} strokeWidth={3} /> Add Objective
                            </button>
                        )}
                    </div>

                    {/* MODAL: Pastikan props workspace dan project diteruskan ke sini */}
                    <AddSubTaskModal
                        isOpen={isAddModalOpen}
                        setIsOpen={setIsAddModalOpen}
                        workspace={workspace}
                        project={project}
                        task={task}
                    />

                    {/* SUB-TASK LIST/TABLE */}
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
                            /* Tampilan jika data kosong */
                            <div className="py-20 border-2 border-dashed border-border rounded-[40px] flex flex-col items-center justify-center opacity-30">
                                <Target size={48} className="mb-4 text-muted-foreground" />
                                <p className="text-[11px] font-black uppercase tracking-[0.4em]">No Operational Objectives Found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- KANAN: SIDEBAR --- */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Integrity Card (Progress) */}
                <div className="bg-white border border-border flex flex-col gap-6 rounded-[40px] p-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <Activity size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <span className="text-[9px] font-black text-sada-red uppercase tracking-[0.3em] italic">Integrity Score</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black italic tracking-tighter text-zinc-900">{task.progress || 0}%</span>
                            <span className="text-[10px] font-black uppercase text-emerald-500 italic">Nominal</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden p-[1px]">
                            <div
                                className="h-full bg-sada-red rounded-full shadow-[0_0_15px_rgba(227,6,19,0.5)] transition-all duration-1000"
                                style={{ width: `${task.progress || 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Field Operatives Card */}
                <div className="bg-muted/10 border border-dashed border-border rounded-[32px] p-6 flex flex-col gap-4">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic opacity-60">Operatives In-Field</span>
                    <div className="flex -space-x-3 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="inline-block size-10 rounded-xl ring-4 ring-background bg-zinc-800 border border-border overflow-hidden shadow-sm">
                                <img src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt={`user-${i}`} />
                            </div>
                        ))}
                        <div className="flex items-center justify-center size-10 rounded-xl ring-4 ring-background bg-zinc-100 border border-border text-[10px] font-black text-zinc-400">
                            +2
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};