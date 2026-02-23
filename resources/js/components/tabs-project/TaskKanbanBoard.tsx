import { useState, useEffect } from 'react';
import { Columns, Zap } from 'lucide-react';
import { router } from '@inertiajs/react';
import TaskGridCard from './TaskGridCard';

interface KanbanProps {
    tasks: any[];
    workspace: any;
    project: any;
}

export default function TaskKanbanBoard({ tasks, workspace, project }: KanbanProps) {
    // 1. Local state agar UI langsung berubah saat di-drag (Optimistic Update)
    const [localTasks, setLocalTasks] = useState(tasks);
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

    // Sync state lokal jika props 'tasks' berubah dari backend
    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const columns = [
        { id: 'todo', title: 'To-Do', color: 'bg-zinc-500' },
        { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
        { id: 'done', title: 'Done', color: 'bg-emerald-500' },
    ];

    // --- DRAG & DROP HANDLERS ---
    const handleDragStart = (e: React.DragEvent, taskId: number) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        // Set data task ID yang sedang dibawa
        e.dataTransfer.setData('text/plain', taskId.toString()); 
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Wajib agar zona ini menerima drop
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        setDraggedTaskId(null);

        if (!taskId) return;

        // Cari task yang sedang dipindah
        const taskToMove = localTasks.find(t => t.id.toString() === taskId);
        if (taskToMove && taskToMove.status !== newStatus) {
            
            // 1. Optimistic UI Update (Geser langsung di layar)
            setLocalTasks(prev => prev.map(t => 
                t.id.toString() === taskId ? { ...t, status: newStatus } : t
            ));

            // 2. Kirim update ke Backend via Inertia
            router.patch(`/workspaces/${workspace.slug}/projects/${project.slug}/tasks/${taskToMove.slug}/status`, {
                status: newStatus
            }, {
                preserveScroll: true,
                preserveState: true, // Jangan reset state komponen
                onError: () => {
                    // Kalau gagal, kembalikan posisi semula dari props
                    setLocalTasks(tasks);
                    alert("Failed to update task status.");
                }
            });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in slide-in-from-bottom-4 duration-500">
            {columns.map((col) => {
                const columnTasks = localTasks.filter(t => t.status === col.id);

                return (
                    <div key={col.id} className="flex flex-col gap-4">
                        {/* Column Header */}
                        <div className="flex items-center justify-between px-4 mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`size-2 rounded-full ${col.color} animate-pulse`} />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
                                    {col.title}
                                </h3>
                            </div>
                            <div className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-black opacity-50">
                                {columnTasks.length}
                            </div>
                        </div>

                        {/* Drop Zone Content */}
                        <div 
                            className="flex flex-col gap-5 p-2 bg-muted/10 rounded-[40px] border-2 border-transparent hover:border-dashed hover:border-border/50 transition-all min-h-[500px]"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            {columnTasks.length > 0 ? (
                                columnTasks.map((task) => (
                                    <div 
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onDragEnd={() => setDraggedTaskId(null)}
                                        className={`cursor-grab active:cursor-grabbing transition-all duration-300 ${draggedTaskId === task.id ? 'opacity-40 scale-95' : 'opacity-100 hover:scale-[1.02]'}`}
                                    >
                                        {/* Bungkus TaskGridCard biar tidak bentrok event kliknya */}
                                        <div className="pointer-events-auto">
                                            <TaskGridCard
                                                task={task}
                                                workspace={workspace}
                                                project={project}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center opacity-20 border-2 border-dashed border-border/20 rounded-[32px] m-2 pointer-events-none">
                                    <Zap size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}