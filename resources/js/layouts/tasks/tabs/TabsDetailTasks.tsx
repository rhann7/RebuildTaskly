import { FileText, Clock, Paperclip, Activity, Target, ShieldCheck } from 'lucide-react';

interface Props {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    isManager?: boolean;
    taskStatus?: string; // Untuk deteksi apakah task sudah 'completed'
}

export const TaskDetailTabs = ({ activeTab, setActiveTab, isManager, taskStatus }: Props) => {
    const tabs = [
        { id: 'brief', label: 'Briefing', icon: Target },
        { id: 'logs', label: 'Timesheets', icon: Clock }, // Kita masukkan Timesheet ke sini
        { id: 'docs', label: 'Documentation', icon: Paperclip },
        { id: 'activity', label: 'System Activity', icon: Activity },
    ];

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            {/* TABS MENU */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-100/50 dark:bg-muted/20 w-fit rounded-[20px] border border-zinc-200 dark:border-white/5 backdrop-blur-md">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300
                                ${isActive 
                                    ? 'bg-white dark:bg-zinc-900 text-sada-red shadow-[0_10px_20px_rgba(0,0,0,0.05)] dark:shadow-none border border-zinc-200 dark:border-white/10 scale-100' 
                                    : 'text-zinc-400 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5 scale-95 opacity-70'
                                }
                            `}
                        >
                            <tab.icon 
                                size={14} 
                                strokeWidth={isActive ? 3 : 2} 
                                className={isActive ? 'animate-pulse' : ''} 
                            />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* --- ACTION AREA: APPROVE TASK (KHUSUS MANAGER) --- */}
            {isManager && (
                <div className="flex items-center gap-3 self-end sm:self-auto">
                    {taskStatus === 'completed' ? (
                        <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm">
                           
                        </div>
                    ) : (
                        <button 
                            className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group"
                            onClick={() => {/* Tambahkan fungsi handleApproveTask nanti */}}
                        >
                            <ShieldCheck size={16} className="group-hover:animate-bounce" />
                            Approve Task Result
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};