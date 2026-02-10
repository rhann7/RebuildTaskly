import { useState } from 'react';
import { Clock, Plus, Paperclip, FileText, Trash2, Send, Activity } from 'lucide-react';

interface Props {
    task: any;
}

export const TaskTimesheets = ({ task }: Props) => {
    const [isLogging, setIsLogging] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* --- KIRI: LOG HISTORY & ACTIVITY FEED --- */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="flex justify-between items-center px-2">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                            <Activity size={16} className="text-sada-red" />
                            Operation Logs
                        </h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold opacity-60">
                            {task.timesheets?.length || 0} Logs Recorded
                        </p>
                    </div>
                    
                    {!isLogging && (
                        <button 
                            onClick={() => setIsLogging(true)}
                            className="h-10 px-6 bg-zinc-900 text-white rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-sada-red transition-all shadow-lg active:scale-95"
                        >
                            <Plus size={14} strokeWidth={3} /> Submit Work Log
                        </button>
                    )}
                </div>

                {/* Form Input Log (Conditional) */}
                {isLogging && (
                    <div className="bg-background border-2 border-sada-red/30 rounded-[32px] p-8 animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Duration (Hours)</label>
                                    <input type="number" placeholder="0.0" className="bg-muted/30 border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sada-red outline-none transition-all italic font-bold" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Date of Operation</label>
                                    <input type="date" className="bg-muted/30 border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sada-red outline-none transition-all font-bold uppercase" />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Activity Description</label>
                                <textarea placeholder="Write your activity here" rows={3} className="bg-muted/30 border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sada-red outline-none transition-all resize-none italic" />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <button className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-sada-red transition-colors uppercase tracking-widest">
                                    <Paperclip size={14} /> Upload Files
                                </button>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsLogging(false)} className="px-4 py-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Cancel</button>
                                    <button className="px-8 py-3 bg-sada-red text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sada-red/20 active:scale-95 transition-all">
                                        <Send size={12} /> Dispatch Log
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Log List */}
                <div className="flex flex-col gap-3">
                    {/* Placeholder tunggal agar UI tidak terlihat kosong melompong */}
                    <LogItem 
                        name="System Operative" 
                        date="Waiting for transmission..." 
                        duration="0.0" 
                        note="No logs recorded yet. Start by submitting your first work log." 
                    />
                </div>
            </div>

            {/* --- KANAN: STATS & SUMMARY --- */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-muted/10 border border-border rounded-[32px] p-8 flex flex-col gap-6 shadow-inner">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">Resource Allocation</span>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-6 bg-background border border-border rounded-2xl shadow-sm group hover:border-sada-red transition-all">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Time Consumed</span>
                                <Clock size={14} className="text-sada-red group-hover:animate-pulse" />
                            </div>
                            <span className="text-3xl font-black italic tracking-tighter">0.0 <small className="text-[10px] uppercase not-italic opacity-30 tracking-widest font-bold">Hours</small></span>
                        </div>

                        <div className="p-6 bg-background border border-border rounded-2xl shadow-sm group hover:border-emerald-500 transition-all">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Evidence Uploaded</span>
                                <FileText size={14} className="text-emerald-500 group-hover:animate-bounce" />
                            </div>
                            <span className="text-3xl font-black italic tracking-tighter">00 <small className="text-[10px] uppercase not-italic opacity-30 tracking-widest font-bold">Files</small></span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border border-dashed border-border rounded-[32px] opacity-40">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">
                        Notice: All work logs are subject to verification by the sector manager. Ensure evidence is attached for priority tasks.
                    </p>
                </div>
            </div>
        </div>
    );
};

const LogItem = ({ name, date, duration, note, hasFile = false }: any) => (
    <div className="group bg-white border border-border p-6 rounded-[28px] flex flex-col gap-4 hover:border-sada-red/30 transition-all shadow-sm">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-muted border border-border overflow-hidden p-0.5">
                    <img src={`https://ui-avatars.com/api/?name=${name}&background=1a1a1a&color=fff`} className="size-full object-cover rounded-lg" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-black text-foreground uppercase leading-none italic">{name}</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">{date}</span>
                </div>
            </div>
            <div className="bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-200">
                <span className="text-[10px] font-black text-zinc-900 italic">{duration}H</span>
            </div>
        </div>
        
        <p className="text-[11px] text-zinc-500 italic leading-relaxed pl-14">
            {note}
        </p>

        {hasFile && (
            <div className="ml-14 mt-1 p-3 bg-zinc-50 border border-border rounded-xl flex items-center justify-between group/file cursor-pointer hover:bg-zinc-100 transition-colors">
                <div className="flex items-center gap-2">
                    <Paperclip size={12} className="text-sada-red" />
                    <span className="text-[9px] font-black uppercase text-zinc-600 tracking-tight">transmission_proof.png</span>
                </div>
                <span className="text-[8px] font-black text-sada-red uppercase opacity-0 group-hover/file:opacity-100 transition-opacity tracking-widest">Download</span>
            </div>
        )}
    </div>
);