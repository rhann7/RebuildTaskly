import {
    Activity, Clock, CheckCircle,
    AlertCircle, PlayCircle, PlusCircle,
    FileText, User, UserPlus
} from "lucide-react";
import dayjs from "dayjs";

interface Props {
    task: any;
}

export const TaskActivityLog = ({ task }: Props) => {

    // --- DYNAMIC TIMELINE GENERATOR ---
    // We build the activity log by extracting timestamps from the task and its relations.
    // --- DYNAMIC TIMELINE GENERATOR ---
    const generateLogs = () => {
        let logs: any[] = [];

        // 1. Task Created
        if (task.created_at) {
            logs.push({
                id: `created-${task.id}`,
                title: "Task Initiated",
                description: `Task was created in the system.`,
                type: "created",
                time: task.created_at,
                user: "System"
            });
        }

        // 2. Deadline Set
        if (task.due_date) {
            logs.push({
                id: `deadline-${task.id}`,
                title: "Deadline Configured",
                description: `Target completion date set to ${dayjs(task.due_date).format('DD MMM YYYY')}.`,
                type: "update",
                time: task.created_at,
                user: "System"
            });
        }

        // 3. Documents Uploaded (Menyesuaikan dengan 'documents.user')
        if (task.documents && task.documents.length > 0) {
            task.documents.forEach((doc: any) => {
                logs.push({
                    id: `doc-${doc.id}`,
                    title: "Asset Uploaded",
                    description: `File '${doc.file_name}' added to the vault.`,
                    type: "document",
                    time: doc.created_at,
                    user: doc.user?.name || "System" // <--- Ubah jadi doc.user
                });
            });
        }

        // 4. Timesheets Logged (Menyesuaikan dengan 'entries' dari Controller)
        if (task.entries && task.entries.length > 0) { // <--- Ubah jadi task.entries
            task.entries.forEach((ts: any) => {

                // Hitung durasi jam dari start_at ke end_at jika field hours tidak ada
                const hours = ts.hours || (dayjs(ts.end_at).diff(dayjs(ts.start_at), 'hour', true)).toFixed(1);

                // Log the initial submission
                logs.push({
                    id: `ts-created-${ts.id}`,
                    title: "Timesheet Logged",
                    description: `${ts.user?.name || 'A user'} logged ${hours} hours.`,
                    type: "timesheet",
                    time: ts.created_at,
                    user: ts.user?.name || "System"
                });

                // Log status changes
                if (ts.status !== 'draft' && ts.updated_at !== ts.created_at) {
                    let logType = "status";
                    let title = "Timesheet Updated";

                    if (ts.status === 'approved') { logType = "completed"; title = "Timesheet Approved"; }
                    if (ts.status === 'revision') { logType = "issue"; title = "Revision Requested"; }

                    logs.push({
                        id: `ts-updated-${ts.id}-${ts.updated_at}`,
                        title: title,
                        description: `Timesheet status changed to ${ts.status.toUpperCase()}.`,
                        type: logType,
                        time: ts.updated_at,
                        user: "Manager"
                    });
                }
            });
        }

        // 5. Task Status Update
        if (task.status !== 'todo' && task.updated_at !== task.created_at) {
            logs.push({
                id: `task-status-${task.updated_at}`,
                title: "Status Progression",
                description: `Task advanced to ${task.status.toUpperCase()}.`,
                type: task.status === 'done' ? "completed" : "status",
                time: task.updated_at,
                user: "System"
            });
        }

        // Sort logs descending (newest first)
        return logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    };

    const logsToDisplay = generateLogs();

    const getLogStyle = (type: string) => {
        switch (type) {
            case 'created': return { icon: PlusCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
            case 'status': return { icon: PlayCircle, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
            case 'completed': return { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
            case 'issue': return { icon: AlertCircle, color: 'text-red-500 bg-red-500/10 border-red-500/20' };
            case 'document': return { icon: FileText, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
            case 'assigned': return { icon: UserPlus, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
            case 'timesheet': return { icon: Clock, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
            default: return { icon: Activity, color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' };
        }
    };

    return (
        <div className="bg-card border border-border rounded-[40px] p-8 md:p-12 shadow-sm animate-in fade-in duration-700 max-w-4xl mx-auto w-full">

            <div className="flex items-center justify-between mb-12 border-b border-border pb-6">
                <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic flex items-center gap-3">
                        <Activity size={24} className="text-sada-red" />
                        Audit Trail
                    </h2>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
                        Comprehensive chronological log of all task interactions.
                    </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-muted rounded-2xl border border-border">
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                        {logsToDisplay.length} Records
                    </span>
                </div>
            </div>

            <div className="relative pl-6 space-y-10 before:absolute before:inset-y-0 before:left-[43px] before:w-[2px] before:bg-border/50">
                {logsToDisplay.length > 0 ? (
                    logsToDisplay.map((log) => {
                        const style = getLogStyle(log.type);
                        const Icon = style.icon;

                        return (
                            <div key={log.id} className="relative flex gap-8 group">
                                {/* Timeline Node */}
                                <div className={`relative z-10 size-12 rounded-2xl flex items-center justify-center border shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-sm ${style.color}`}>
                                    <Icon size={20} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 bg-muted/20 border border-transparent group-hover:border-border/60 group-hover:bg-muted/40 p-6 rounded-3xl transition-all duration-300">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight">
                                            {log.title}
                                        </h4>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap bg-background px-3 py-1 rounded-lg border border-border shadow-sm">
                                            {dayjs(log.time).format('DD MMM YYYY, HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {log.description}
                                    </p>

                                    {log.user && (
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="size-5 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-border flex items-center justify-center">
                                                <User size={10} className="text-muted-foreground opacity-50" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                                                Action by: {log.user}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-12 text-center text-muted-foreground">
                        <p className="text-[11px] font-black uppercase tracking-widest opacity-50">No activity recorded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};