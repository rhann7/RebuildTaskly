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

    const operatives = useMemo(() => {
        const projectUsers = project.users || [];
        const completers = task.subtasks?.map((s: any) => s.completer).filter(Boolean) || [];
        const combined = [...projectUsers, ...completers];
        return Array.from(new Map(combined.map(user => [user.id, user])).values());
    }, [project.users, task.subtasks]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* --- LEFT: MISSION PARAMETERS & OBJECTIVES --- */}
            <div className="lg:col-span-2 flex flex-col gap-10">

                {/* 1. Description Card */}
                <div className="bg-white dark:bg-zinc-900/40 border border-border rounded-[40px] p-8 md:p-10 relative overflow-hidden shadow-sm group transition-all duration-500 hover:shadow-xl hover:shadow-black/[0.02]">
                    <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] dark:opacity-[0.05] rotate-12 select-none pointer-events-none text-sada-red transition-transform duration-1000 group-hover:scale-110 group-hover:-rotate-12">
                        <StickyNote size={320} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-sada-red/10 rounded-full">
                                <span className="text-[10px] font-black text-sada-red uppercase tracking-[0.2em] ">Description</span>
                            </div>
                            {isManager && (
                                <div className="flex items-center gap-1 opacity-40">
                                    <Shield size={12} className="text-zinc-500" />
                                    <span className="text-[9px] font-bold uppercase">Restricted</span>
                                </div>
                            )}
                        </div>
                        
                        <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed opacity-90 max-w-3xl font-medium whitespace-pre-line tracking-tight">
                            {task.description || "No specific mission parameters defined for this task."}
                        </p>
                    </div>
                </div>

                {/* 2. Sub-Tasks Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center px-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-2xl font-black flex items-center gap-3 ">
                                <Target className="text-sada-red" size={24} strokeWidth={2.5} />
                                SubTasks
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                                    {task.subtasks?.length || 0} active checkpoints
                                </p>
                            </div>
                        </div>

                        {isManager && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="h-11 px-6 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-sada-red hover:text-white transition-all shadow-xl active:scale-95 group"
                            >
                                <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" /> 
                                Add Objective
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
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
                            <div className="py-24 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[48px] flex flex-col items-center justify-center opacity-20 group hover:opacity-40 transition-opacity">
                                <Target size={56} className="mb-4 text-muted-foreground group-hover:scale-110 transition-transform duration-500" />
                                <p className="text-[11px] font-black uppercase tracking-[0.5em] italic">Zero Objectives Found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- RIGHT: INTELLIGENCE SIDEBAR --- */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                
                {/* Field Operatives Card */}
                <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-border rounded-[40px] p-8 flex flex-col gap-6 relative overflow-hidden">
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-[9px] font-black text-sada-red uppercase tracking-[0.2em] flex items-center gap-2">
                            <UserIcon size={12} strokeWidth={3} /> Assignee 
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 relative z-10">
                        {operatives.length > 0 ? (
                            operatives.map((user: any) => (
                                <div key={user.id} className="group relative">
                                    <div className="size-12 rounded-[18px] ring-4 ring-background bg-zinc-800 border border-border overflow-hidden shadow-lg transition-all duration-500 group-hover:rounded-full group-hover:scale-110 group-hover:-translate-y-2 group-hover:ring-sada-red/20">
                                        <img 
                                            src={user.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=27272a&color=fff`} 
                                            alt={user.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-white text-white dark:text-black text-[9px] font-black px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl z-30 border border-white/10 uppercase tracking-widest translate-y-2 group-hover:translate-y-0">
                                        {user.name}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 dark:bg-white rotate-45" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] font-bold text-zinc-400 italic py-2">No active operatives detected.</p>
                        )}
                    </div>
                </div>

                {/* Status/Deadline Meta Card */}
                <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-border rounded-[40px] p-8 flex flex-col gap-6 relative overflow-hidden group">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 size-32 bg-sada-red/20 blur-[60px] rounded-full -mr-10 -mt-10" />
                    
                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-sada-red/80 dark:text-zinc-400 uppercase tracking-[0.2em] italic">Deadline Tracker</span>
                            <span className="text-lg font-black uppercase tracking-widest text-foreground">
                                {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Deadline Set'}
                            </span>
                        </div>
                        <div className="size-12 rounded-2xl bg-white/5 dark:bg-black/5 flex items-center justify-center border border-white/10 dark:border-black/10 transition-transform duration-700 group-hover:rotate-[360deg]">
                            <Activity size={18} strokeWidth={2.5} className="text-sada-red animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Logic */}
            <AddSubTaskModal
                isOpen={isAddModalOpen}
                setIsOpen={setIsAddModalOpen}
                workspace={workspace}
                project={project}
                task={task}
            />
        </div>
    );
};