import { Layout, Target, Plus, Send, FolderKanban, X, Info, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "../ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import { useMemo, useState } from "react";
import { router } from "@inertiajs/react";

export function TimeEntryModal({ isOpen, setIsOpen, data, setData, submitEntry, projects, processing, errors }: any) {
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });

    // 1. Memoization untuk performa: Cari Project
    const selectedProj = useMemo(() =>
        projects?.find((p: any) => p.id.toString() === data.project_id?.toString()),
        [data.project_id, projects]);

    // 2. Memoization untuk performa: Cari Task
    const selectedTsk = useMemo(() =>
        selectedProj?.tasks?.find((t: any) => t.id.toString() === data.task_id?.toString()),
        [data.task_id, selectedProj]);

    // Di dalam TimeEntryModal.tsx
    const handleQuickAddTask = () => {
        if (!newTask.title || !data.project_id) return;

        // Perbaiki pemanggilan route-nya:
        router.post(('timesheets.storeTask'), { // Gunakan helper route()
            project_id: data.project_id,
            title: newTask.title,
            priority: newTask.priority,
        }, {
            onSuccess: () => {
                setIsAddingTask(false);
                setNewTask({ title: '', priority: 'medium' });
            }
        });
    };

    // 3. Helper untuk reset berjenjang saat dropdown atas berubah
    const handleProjectChange = (id: string) => {
        setData({
            ...data,
            project_id: id,
            task_id: '',
            sub_task_id: '',
            // Reset description jika ingin log baru per project
        });
    };

    const handleTaskChange = (id: string) => {
        setData({
            ...data,
            task_id: id,
            sub_task_id: '',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                setIsAddingTask(false);
                // Tip: Bisa tambahkan reset() form di sini jika diinginkan
            }
        }}>
            <DialogContent className="max-w-2xl bg-background border border-border rounded-[32px] p-0 overflow-hidden shadow-2xl transition-all outline-none">

                <DialogHeader className="p-8 border-b border-border bg-muted/20 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sada-red to-transparent" />
                    <div className="flex items-center gap-2 mb-1">
                        <div className="size-2 bg-sada-red rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-sada-red uppercase tracking-[0.3em]">System Registry</span>
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Initialize Work Log</DialogTitle>
                </DialogHeader>

                <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto scrollbar-hide">

                    {/* SELEKSI PROJECT */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                            <FolderKanban size={12} className="text-sada-red" /> Project Resource
                        </label>
                        <Select
                            value={data.project_id?.toString()}
                            onValueChange={handleProjectChange}
                        >
                            <SelectTrigger className={`h-12 bg-muted/50 border-border rounded-xl font-bold text-xs transition-colors ${errors.project_id ? 'border-red-500 bg-red-50/10' : 'focus:border-sada-red'}`}>
                                <SelectValue placeholder="SELECT PROJECT" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                                {projects?.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id.toString()} className="font-bold text-xs">{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.project_id && <p className="text-[9px] text-red-500 font-black uppercase ml-1 italic">{errors.project_id}</p>}
                    </div>

                    {/* LINKED TASK */}
                    <div className="space-y-4 border-t border-border/50 pt-6">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                                <Layout size={12} className="text-sada-red" /> Linked Task
                            </label>
                            {selectedProj && !isAddingTask && (
                                <button
                                    type="button"
                                    onClick={() => setIsAddingTask(true)}
                                    className="text-sada-red hover:text-red-700 flex items-center gap-1 text-[10px] font-black uppercase transition-all active:scale-95"
                                >
                                    <Plus size={12} strokeWidth={3} /> New Task
                                </button>
                            )}
                        </div>

                        {!isAddingTask ? (
                            <Select
                                disabled={!selectedProj}
                                value={data.task_id?.toString()}
                                onValueChange={handleTaskChange}
                            >
                                <SelectTrigger className={`h-12 bg-muted/50 border-border rounded-xl font-bold text-xs ${errors.task_id ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder={selectedProj ? "SELECT TASK" : "AWAITING PROJECT..."} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {selectedProj?.tasks?.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id.toString()} className="font-bold text-xs">{t.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="bg-sada-red/5 p-4 rounded-2xl border border-dashed border-sada-red/30 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase text-sada-red flex items-center gap-2">
                                        <Plus size={10} /> Quick Deploy Task
                                    </span>
                                    <button type="button" onClick={() => setIsAddingTask(false)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
                                </div>
                                <input
                                    autoFocus
                                    className="w-full h-10 bg-background border border-border rounded-lg px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-sada-red/20 transition-all placeholder:text-muted-foreground/50"
                                    placeholder="Task Title (e.g. Frontend Integration)"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAddTask()}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleQuickAddTask} size="sm" className="bg-sada-red hover:bg-red-700 text-[10px] font-black uppercase h-8 px-4 rounded-lg">Create & Link</Button>
                                    <Button variant="ghost" onClick={() => setIsAddingTask(false)} size="sm" className="text-[10px] font-black uppercase h-8 px-4">Cancel</Button>
                                </div>
                            </div>
                        )}
                        {errors.task_id && <p className="text-[9px] text-red-500 font-black uppercase ml-1 italic">{errors.task_id}</p>}
                    </div>

                    {/* OBJECTIVE */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                            <Target size={12} className="text-sada-red" /> Objective Completion
                        </label>
                        <Select
                            disabled={!selectedTsk}
                            value={data.sub_task_id?.toString()}
                            onValueChange={(v) => setData('sub_task_id', v)}
                        >
                            <SelectTrigger className="h-12 bg-muted/50 border-border rounded-xl font-bold text-xs">
                                <SelectValue placeholder={selectedTsk ? "SELECT OBJECTIVE" : "AWAITING TASK..."} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {selectedTsk?.subtasks?.map((st: any) => (
                                    <SelectItem key={st.id} value={st.id.toString()}>
                                        <div className="flex items-center gap-2">
                                            <div className={`size-1.5 rounded-full ${st.is_completed ? 'bg-green-500' : 'bg-amber-500'}`} />
                                            <span className="font-bold text-xs">{st.title}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* LOG DESCRIPTION */}
                    <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                            <Info size={12} className="text-sada-red" /> Operational Log
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Briefly describe your contribution or blockers..."
                            rows={3}
                            className={`w-full bg-muted/50 border border-border rounded-xl p-4 text-xs font-bold outline-none resize-none focus:ring-2 focus:ring-sada-red/20 transition-all placeholder:text-muted-foreground/40 ${errors.description ? 'border-red-500' : 'focus:border-sada-red'}`}
                        />
                        {errors.description && <p className="text-[9px] text-red-500 font-black uppercase ml-1 italic">{errors.description}</p>}
                    </div>
                </div>

                <DialogFooter className="p-8 bg-muted/20 border-t border-border flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <AlertCircle size={14} className="text-sada-red/50" />
                        <span className="text-[9px] font-bold uppercase tracking-tight">Status: Tactical Draft Deployment</span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setIsOpen(false)} className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest border-border hover:bg-background transition-all active:scale-95">
                            Discard
                        </Button>
                        <Button
                            disabled={processing || !data.task_id}
                            onClick={() => submitEntry()}
                            className="h-12 px-10 rounded-xl bg-sada-red text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 shadow-lg shadow-sada-red/20 flex gap-2 active:scale-95 disabled:opacity-50 transition-all"
                        >
                            {processing ? (
                                <div className="flex items-center gap-2">
                                    <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>DEPLOYING...</span>
                                </div>
                            ) : (
                                <>
                                    <Send size={14} />
                                    <span>DEPLOY ENTRY</span>
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}