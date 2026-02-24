import { Activity, CheckCircle, Clock, FileEdit, ShieldAlert, PlusCircle } from "lucide-react";

interface ActivityProps {
    title: string;
    desc: string;
    time: string;
    type: 'timesheet' | 'project' | 'approval' | 'revision' | 'system';
}

export const RecentActivities = ({ activities }: { activities: ActivityProps[] }) => {
    
    // Fungsi untuk menentukan Icon dan Warna berdasarkan tipe aktivitas
    const getActivityStyle = (type: string) => {
        switch (type) {
            case 'timesheet':
                return { icon: FileEdit, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
            case 'project':
                return { icon: PlusCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
            case 'approval':
                return { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
            case 'revision':
                return { icon: ShieldAlert, color: 'text-red-500 bg-red-500/10 border-red-500/20' };
            case 'system':
                return { icon: Activity, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
            default:
                return { icon: Clock, color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' };
        }
    };

    return (
        <div className="">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight uppercase ">Activity Feed</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">Latest system updates</p>
                </div>
                <div className="size-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <Activity className="size-4 text-muted-foreground" />
                </div>
            </div>

            <div className="relative space-y-4 before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-border/50">
                {activities && activities.length > 0 ? (
                    activities.map((activity, index) => {
                        const style = getActivityStyle(activity.type);
                        const Icon = style.icon;

                        return (
                            <div key={index} className="relative flex gap-4 group">
                                {/* Timeline Dot & Icon */}
                                <div className={`relative z-10 size-10 rounded-full flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110 ${style.color}`}>
                                    <Icon className="size-4" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight leading-tight group-hover:text-sada-red transition-colors">
                                            {activity.title}
                                        </h4>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap ml-2">
                                            {activity.time}
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
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">No recent activity</p>
                    </div>
                )}
            </div>
        </div>
    );
};