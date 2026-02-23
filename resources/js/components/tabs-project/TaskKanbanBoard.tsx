import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { router } from '@inertiajs/react';
import TaskGridCard from './TaskGridCard';

interface KanbanProps {
    tasks: any;
    workspace: any;
    project: any;
}

export default function TaskKanbanBoard({ tasks, workspace, project }: KanbanProps) {
    
    // 1. Fungsi Ekstrak yang lebih Aman & "Deep"
    const extractTasks = (source: any) => {
        if (!source) return [];
        // Ambil array mentah dari Laravel Paginate
        const rawTasks = Array.isArray(source) ? source : (source.data || []);
        
        // Mapping ulang buat mastiin property subtasks & manual_progress ikut terbawa
        return rawTasks.map((t: any) => ({
            ...t,
            subtasks: t.subtasks || [],
            manual_progress: t.manual_progress ?? null,
            total_objectives: t.total_objectives ?? (t.subtasks?.length || 0)
        }));
    };

    const [localTasks, setLocalTasks] = useState<any[]>(extractTasks(tasks));
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

    // 2. Sync yang bener-bener Refresh
    useEffect(() => {
        setLocalTasks(extractTasks(tasks));
    }, [tasks]);

    const columns = [
        { id: 'todo', title: 'To-Do', color: 'bg-zinc-500' },
        { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
        { id: 'done', title: 'Done', color: 'bg-emerald-500' },
    ];

    const handleDragStart = (e: React.DragEvent, taskId: number) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('text/plain', taskId.toString()); 
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleDrop = (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        setDraggedTaskId(null);

        if (!taskId) return;

        const taskToMove = localTasks.find((t: any) => t.id.toString() === taskId);
        
        if (taskToMove && taskToMove.status !== newStatus) {
            
            // --- OPTIMISTIC UPDATE (SUNTIK DATA LANGSUNG) ---
            setLocalTasks((prev: any[]) => prev.map(t => {
                if (t.id.toString() === taskId) {
                    let updatedManualProgress = t.manual_progress;
                    
                    // Kalau ditarik ke DONE, paksa progress jadi 100
                    if (newStatus === 'done') {
                        updatedManualProgress = 100;
                    } 
                    // Kalau ditarik balik dari DONE ke in_progress/todo, 
                    // dan dia gak punya subtask, balikin ke 0
                    else if (t.status === 'done' && (t.subtasks?.length || 0) === 0) {
                        updatedManualProgress = 0;
                    }

                    return { 
                        ...t, 
                        status: newStatus, 
                        manual_progress: updatedManualProgress 
                    };
                }
                return t;
            }));

            // --- DATABASE UPDATE ---
            router.patch(`/workspaces/${workspace.slug}/projects/${project.slug}/tasks/${taskToMove.slug}/status`, {
                status: newStatus
            }, {
                preserveScroll: true,
                preserveState: true, // INI PENTING: Biar state React lo gak di-reset total
                only: ['tasks', 'project'], // Ambil data yang perlu aja
                onSuccess: (page) => {
                    console.log("Sync Success, Data dari server:", page.props.tasks);
                }
            });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-700">
            {columns.map((col) => {
                const columnTasks = localTasks.filter((t: any) => t.status === col.id);

                return (
                    <div key={col.id} className="flex flex-col gap-5">
                        <div className="flex items-center justify-between px-6 mb-1">
                            <div className="flex items-center gap-3">
                                <div className={`size-2.5 rounded-full ${col.color} ${col.id === 'in_progress' ? 'animate-pulse' : ''}`} />
                                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-800 dark:text-zinc-200">
                                    {col.title}
                                </h3>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-500">
                                {columnTasks.length} UNITS
                            </div>
                        </div>

                        <div 
                            className={`flex flex-col gap-6 p-3 rounded-[44px] transition-all duration-300 min-h-[600px] border-2 border-transparent ${
                                draggedTaskId ? 'bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed border-zinc-200 dark:border-zinc-800' : ''
                            }`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            {columnTasks.map((task: any) => (
                                <div 
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    className={`transition-all duration-300 ${draggedTaskId === task.id ? 'opacity-20 scale-90' : 'opacity-100'}`}
                                >
                                    <TaskGridCard
                                        task={task}
                                        workspace={workspace}
                                        project={project}
                                    />
                                </div>
                            ))}
                            {columnTasks.length === 0 && (
                                <div className="py-24 flex flex-col items-center justify-center opacity-10 border-4 border-dashed border-zinc-300 dark:border-zinc-700 rounded-[40px] m-2">
                                    <Zap size={32} />
                                    <span className="text-[10px] font-black uppercase mt-4">No Units</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}