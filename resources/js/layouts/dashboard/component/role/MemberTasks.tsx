import { CheckSquare, ArrowRight, Timer, AlertCircle } from "lucide-react";
import { Link } from "@inertiajs/react";

export const MemberTasks = ({ tasks }: { tasks: any[] }) => (
    <div className="bg-card rounded-[32px] p-8 border border-border/60 shadow-sm flex flex-col w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-xl font-black text-foreground tracking-tight uppercase  flex items-center gap-2">
                    <CheckSquare size={20} className="text-indigo-500" /> My Pending Tasks
                </h2>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
                    Prioritized action items for you
                </p>
            </div>
        </div>

        {/* List Content */}
        <div className="flex flex-col gap-4">
            {tasks && tasks.length > 0 ? (
                tasks.map((task, index) => {
                    // Penentuan Warna Badge Prioritas
                    const priorityColor =
                        task.priority === 'high' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
                            task.priority === 'medium' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                                'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

                    return (
                        <div
                            key={index}
                            className="group flex items-center justify-between p-5 rounded-[24px] bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/60 transition-all duration-300"
                        >
                            <div className="flex items-center gap-5">
                                <div className="size-12 rounded-[16px] bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0">
                                    <CheckSquare size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-indigo-500 transition-colors line-clamp-1">
                                        {task.title}
                                    </span>

                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${priorityColor}`}>
                                            {task.priority}
                                        </span>
                                        {task.due_date && (
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 bg-background px-2 py-0.5 rounded-md border border-border">
                                                <Timer size={10} />
                                                {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tombol Panah ke Halaman Task */}
                            <Link
                                href={`/workspaces/${task.project.workspace.slug}/projects/${task.project.slug}/tasks/${task.slug}`}
                            >
                                <button className="size-10 flex items-center justify-center bg-background rounded-xl text-muted-foreground hover:text-indigo-500 hover:border-indigo-500/30 border border-border shadow-sm group-hover:scale-110 group-hover:bg-indigo-500/5 transition-all shrink-0">
                                    <ArrowRight size={16} />
                                </button>
                            </Link>
                        </div>
                    );
                })
            ) : (
                <div className="py-12 text-center border-2 border-dashed border-border rounded-[24px] opacity-50 flex flex-col items-center justify-center gap-2">
                    <AlertCircle size={24} className="text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No pending tasks</p>
                </div>
            )}
        </div>
    </div>
);