import { Columns, Zap } from 'lucide-react';
import TaskGridCard from './TaskGridCard';

interface KanbanProps {
    tasks: any[];
    workspace: any;
    project: any;
}

export default function TaskKanbanBoard({ tasks, workspace, project }: KanbanProps) {
    // Grouping logic for Kanban columns
    const columns = [
        { id: 'todo', title: 'To-Do', color: 'bg-zinc-500' },
        { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
        { id: 'done', title: 'Done', color: 'bg-emerald-500' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in slide-in-from-bottom-4 duration-500">
            {columns.map((col) => {
                const columnTasks = tasks.filter(t => t.status === col.id);

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

                        {/* Column Content */}
                        <div className="flex flex-col gap-5 p-2 bg-muted/10 rounded-[40px] border border-transparent hover:border-border/50 transition-all min-h-[500px]">
                            {columnTasks.length > 0 ? (
                                columnTasks.map((task) => (
                                    <TaskGridCard
                                        key={task.id}
                                        task={task}
                                        workspace={workspace}
                                        project={project}
                                    />
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center opacity-20 border-2 border-dashed border-border/20 rounded-[32px] m-2">
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