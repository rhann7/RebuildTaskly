import { 
    Activity, CheckCircle, Clock, FileEdit, 
    ShieldAlert, PlusCircle, PlayCircle, UserPlus 
} from "lucide-react";

interface ActivityProps {
    title: string;
    desc: string;
    time: string;
    time_human?: string; // Tambahan dari backend baru
    type: string; // Diperluas agar bisa menerima berbagai tipe dari backend
}

export const RecentActivities = ({ activities }: { activities: ActivityProps[] }) => {
    
    // Fungsi untuk menentukan Icon dan Warna berdasarkan tipe aktivitas
    const getActivityStyle = (type: string) => {
        switch (type) {
            case 'timesheet':
                return { icon: Clock, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
            case 'project':
            case 'created':
                return { icon: PlusCircle, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
            case 'approval':
            case 'completed':
                return { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
            case 'revision':
            case 'issue':
                return { icon: ShieldAlert, color: 'text-red-500 bg-red-500/10 border-red-500/20' };
            case 'status':
                return { icon: PlayCircle, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
            case 'assigned':
                return { icon: UserPlus, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
            case 'system':
                return { icon: Activity, color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' };
            default:
                return { icon: FileEdit, color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' };
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Activity Feed</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
                        Latest system updates
                    </p>
                </div>
                <div className="size-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <Activity className="size-4 text-muted-foreground" />
                </div>
            </div>

            {/* Timeline Container (Bisa di-scroll kalau kepanjangan) */}
            <div className="relative flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border max-h-[400px]">
                {/* Garis vertikal timeline */}
                <div className="absolute inset-y-0 left-[19px] w-[2px] bg-border/50 pointer-events-none" />

                <div className="space-y-6 relative">
                    {activities && activities.length > 0 ? (
                        activities.map((activity, index) => {
                            const style = getActivityStyle(activity.type);
                            const Icon = style.icon;

                            // Gunakan time_human jika ada, jika tidak fallback ke time (bisa diformat JS nanti)
                            const displayTime = activity.time_human || activity.time;

                            return (
                                <div key={index} className="relative flex gap-4 group">
                                    {/* Timeline Dot & Icon */}
                                    <div className={`relative z-10 size-10 rounded-full flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110 shadow-sm ${style.color}`}>
                                        <Icon className="size-4" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-black text-foreground uppercase tracking-tight leading-tight group-hover:text-sada-red transition-colors">
                                                {activity.title}
                                            </h4>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap ml-2">
                                                {displayTime}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground line-clamp-2">
                                            {activity.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-10 text-center relative z-10 bg-card">
                            <Activity size={24} className="mx-auto mb-2 text-muted-foreground/30" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                                No recent activity
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};