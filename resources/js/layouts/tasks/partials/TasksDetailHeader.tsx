import { ShieldAlert, Zap, Activity } from 'lucide-react';

interface Props {
    task: any;
    project?: any;
}

export const TaskDetailHeader = ({ task, project }: Props) => (
    <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-sm transition-all duration-500">
        
        {/* Watermark Decoration - Dibuat lebih subtle */}
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] dark:opacity-[0.05] rotate-12 select-none pointer-events-none text-sada-red">
            <ShieldAlert size={400} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            
            {/* LEFT: TITLE & IDENTIFICATION */}
            <div className="flex flex-col gap-5 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-sada-red/10 border border-sada-red/20 px-3 py-1 rounded-xl">
                        <Zap size={12} className="text-sada-red animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sada-red">
                            {task.id || 'TSK-CORE'}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest  opacity-70">
                        Projects:  {project?.name || task.project_name || 'Unassigned Sector'}
                    </span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white  tracking-tighter  leading-[0.9]">
                        {task.title}
                    </h1>
                    <div className="h-1 w-20 bg-sada-red rounded-full" />
                </div>
            </div>

            {/* RIGHT: OPERATIONAL STABILITY (Progress) */}
            <div className="flex flex-col gap-4 min-w-[280px] w-full lg:w-auto bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 p-6 rounded-[32px] backdrop-blur-md">
                <div className="flex justify-between items-end">
                    {/* <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Activity size={10} className="text-sada-red" />
                            Stability Score
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">System Nominal</span>
                    </div> */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-zinc-900 dark:text-white  tracking-tighter font-mono leading-none">
                            {task.progress || 0}
                        </span>
                        <span className="text-xs font-black text-sada-red ">%</span>
                    </div>
                </div>

                {/* Progress Bar Industrial */}
                <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden p-[2px] border border-zinc-300 dark:border-white/5">
                    <div 
                        className="h-full bg-gradient-to-r from-sada-red to-red-500 rounded-full shadow-[0_0_15px_rgba(227,6,19,0.4)] transition-all duration-1000 ease-out" 
                        style={{ width: `${task.progress || 0}%` }} 
                    />
                </div>
                
                <p className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em] text-right opacity-50">
                    Transmission ID: {task.slug || 'N/A'}
                </p>
            </div>
        </div>
    </div>
);