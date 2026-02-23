import {
    FileText, CheckSquare, Paperclip, Clock, Plus, X,
    Trash2,
    AlertTriangle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { router } from "@inertiajs/react";

import CreateTaskModal from "@/components/tabs-project/CreateTaskModal"; // Import modal task kamu
import { SubTaskItem } from "@/layouts/tasks/subtask/SubTaskItem";

export function TimeEntryModal({
    isOpen, setIsOpen, data, setData, projects, processing, errors, workspace, isEditing, onDelete
}: any) {
    const [activeTab, setActiveTab] = useState<'details' | 'checklist' | 'files'>('details');

    // State untuk memunculkan Modal Create Task
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

    // Memoization pencarian data
    const selectedProj = useMemo(() =>
        projects?.find((p: any) => String(p.id) === String(data.project_id)),
        [data.project_id, projects]
    );

    const selectedTsk = useMemo(() =>
        selectedProj?.tasks?.find((t: any) => String(t.id) === String(data.task_id)),
        [data.task_id, selectedProj]
    );

    const subtasks = selectedTsk?.subtasks || [];
    const completedCount = subtasks.filter((s: any) => s.is_completed).length;
    const progressPercent = subtasks.length === 0 ? 0 : Math.round((completedCount / subtasks.length) * 100);

    const submitEntry = () => {
        if (!data.project_id || !data.description) {
            alert("Project and Work Description are required.");
            return;
        }

        // Tembak ke endpoint create atau update tergantung props isEditing
        if (isEditing) {
            router.patch(`/timesheets/${data.id}`, data, {
                onSuccess: () => setIsOpen(false),
                preserveScroll: true,
            });
        } else {
            router.post('/timesheets', data, {
                onSuccess: () => setIsOpen(false),
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            {/* --- MODAL UTAMA (TIME ENTRY) --- */}
            <Dialog open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setActiveTab('details');
            }}>
                <DialogContent className="max-w-2xl bg-background border border-border/50 rounded-[24px] p-0 shadow-2xl outline-none overflow-hidden flex flex-col sm:rounded-[24px] transition-colors">

                    {/* HEADER */}
                    <div className="flex justify-between items-center p-5 border-b border-border/50 bg-card/30 backdrop-blur-sm">
                        <h2 className="text-base font-semibold text-foreground">
                            {isEditing ? 'Edit Entry' : 'New Entry'}
                        </h2>

                        <div className="flex items-center gap-1">
                            {/* Tampilkan tombol delete HANYA jika sedang edit data yang sudah ada */}
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="text-sada-red hover:bg-sada-red/10 p-2 rounded-md transition-colors"
                                    title="Delete Entry"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-muted-foreground hover:bg-muted/50 hover:text-foreground p-2 rounded-md transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* PESAN REVISI (Pindah ke dalam modal agar terlihat jelas) */}
                    {data.status === 'revision' && data.reject_reason && (
                        <div className="mx-6 mt-6 p-4 bg-sada-red/10 border border-sada-red/30 rounded-xl flex gap-3">
                            <AlertTriangle size={18} className="text-sada-red shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-sada-red">Manager Revision Note</span>
                                <p className="text-sm font-medium text-foreground">
                                    "{data.reject_reason}"
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TABS */}
                    <div className="px-6 pt-6 pb-2">
                        <div className="flex bg-muted/30 p-1.5 rounded-xl gap-1 border border-border/50 w-fit">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-lg transition-all ${activeTab === 'details' ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <FileText size={16} /> Entry Details
                            </button>
                            <button
                                onClick={() => setActiveTab('checklist')}
                                className={`flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-lg transition-all ${activeTab === 'checklist' ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <CheckSquare size={16} />
                                Subtask
                                {subtasks.length > 0 && (
                                    <span className="bg-sada-red text-white text-[10px] font-black px-2 py-0.5 rounded-full">{subtasks.length}</span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('files')}
                                className={`flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-lg transition-all ${activeTab === 'files' ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Paperclip size={16} />
                                Files
                                <span className="bg-sada-red text-white text-[10px] font-black px-2 py-0.5 rounded-full">1</span>
                            </button>
                        </div>
                    </div>

                    {/* TAB CONTENT */}
                    <div className="p-6 overflow-y-auto max-h-[60vh] min-h-[350px]">
                        {activeTab === 'details' && (
                            <div className="space-y-6">
                                {/* ROW 1: Project & Task */}
                                <div className="flex flex-col md:flex-row gap-5">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[13px] font-bold text-foreground">Project <span className="text-sada-red">*</span></label>
                                        <Select
                                            value={data.project_id ? String(data.project_id) : ''}
                                            onValueChange={(v) => setData({ ...data, project_id: v, task_id: '' })}
                                        >
                                            <SelectTrigger className={`h-12 bg-muted/20 border-border/50 rounded-xl text-[13px] font-medium shadow-sm transition-colors ${errors.project_id ? 'border-sada-red ring-1 ring-sada-red/50' : 'hover:bg-muted/30 focus:border-sada-red'}`}>
                                                <SelectValue placeholder="Select project *" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border/50 rounded-xl">
                                                {projects?.map((p: any) => (
                                                    <SelectItem key={p.id} value={String(p.id)} className="font-medium text-[13px] text-foreground">{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex-1 flex items-end gap-3">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[13px] font-bold text-foreground">Task</label>
                                            <Select
                                                disabled={!selectedProj}
                                                value={data.task_id ? String(data.task_id) : ''}
                                                onValueChange={(v) => setData('task_id', v)}
                                            >
                                                <SelectTrigger className="h-12 bg-muted/20 border-border/50 rounded-xl text-[13px] font-medium shadow-sm transition-colors hover:bg-muted/30 focus:border-sada-red disabled:opacity-50">
                                                    <SelectValue placeholder="No task" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-popover border-border/50 rounded-xl">
                                                    {selectedProj?.tasks?.map((t: any) => (
                                                        <SelectItem key={t.id} value={String(t.id)} className="font-medium text-[13px] text-foreground">{t.title}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* TOMBOL ADD TASK (+) */}
                                        <div className="flex flex-col items-center gap-2">
                                            <label className="text-[13px] font-bold text-foreground">Add</label>
                                            <button
                                                type="button"
                                                onClick={() => setIsCreateTaskOpen(true)}
                                                disabled={!selectedProj}
                                                className="h-12 w-12 flex items-center justify-center bg-muted/20 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors disabled:opacity-50 shadow-sm"
                                            >
                                                <Plus size={18} className="text-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* ROW 2: Times */}
                                <div className="flex flex-col md:flex-row gap-5">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[13px] font-bold text-foreground">Start Time</label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={data.start_time}
                                                onChange={(e) => setData('start_time', e.target.value)}
                                                className="w-full h-12 pl-4 pr-10 bg-muted/20 border border-border/50 rounded-xl text-[13px] font-medium text-foreground outline-none focus:border-sada-red focus:ring-1 focus:ring-sada-red/30 shadow-sm transition-all"
                                            />
                                            <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[13px] font-bold text-foreground">End Time</label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={data.end_time}
                                                onChange={(e) => setData('end_time', e.target.value)}
                                                className="w-full h-12 pl-4 pr-10 bg-muted/20 border border-border/50 rounded-xl text-[13px] font-medium text-foreground outline-none focus:border-sada-red focus:ring-1 focus:ring-sada-red/30 shadow-sm transition-all"
                                            />
                                            <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* ROW 3: Description */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-foreground">Work Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Describe the work done in this time entry..."
                                        className="w-full h-32 bg-muted/20 border border-border/50 rounded-xl p-4 text-[13px] font-medium text-foreground outline-none focus:border-sada-red focus:ring-1 focus:ring-sada-red/30 resize-none shadow-sm transition-all placeholder:text-muted-foreground/50"
                                    />
                                    {errors.description && <p className="text-xs text-sada-red">{errors.description}</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'checklist' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {selectedTsk ? (
                                    <>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-[13px] font-bold text-muted-foreground">
                                                <span>Progress</span>
                                                <span className="text-foreground">{completedCount}/{subtasks.length} completed</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/50">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-700 ease-out shadow-sm"
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 mt-6">
                                            {subtasks.length > 0 ? (
                                                subtasks.map((sub: any) => (
                                                    <SubTaskItem
                                                        key={sub.id}
                                                        sub={sub}
                                                        workspace={selectedProj?.workspace}
                                                        project={selectedProj}
                                                        task={selectedTsk}
                                                    />
                                                ))
                                            ) : (
                                                <div className="py-10 text-center text-muted-foreground text-[13px] font-medium border border-dashed border-border/50 rounded-xl bg-muted/10">
                                                    No checklist items found.
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10 border border-dashed border-border/50 rounded-xl">
                                        <CheckSquare size={32} className="opacity-30 mb-3" />
                                        <p className="text-[13px] font-medium">Select a task first to view its checklist.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'files' && (
                             <div className="py-20 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10 border border-dashed border-border/50 rounded-xl">
                                <Paperclip size={32} className="opacity-30 mb-3" />
                                <p className="text-[13px] font-medium">Attachment feature is currently under construction.</p>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="p-6 pt-0 flex justify-end gap-3 mt-auto border-t border-border/50">
                        <Button variant="ghost" onClick={() => setIsOpen(false)} className="px-6 h-12 rounded-xl text-[13px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 mt-4">
                            Cancel
                        </Button>
                        <Button onClick={submitEntry} disabled={processing} className="px-8 h-12 bg-sada-red text-white hover:bg-red-600 rounded-xl text-[13px] font-bold shadow-lg shadow-sada-red/20 transition-all active:scale-95 mt-4">
                            {processing ? 'Saving...' : 'Save Entry'}
                        </Button>
                    </div>

                </DialogContent>
            </Dialog>

            {/* --- MODAL TAMBAH TASK (DARI SCREENSHOT 3) --- */}
            <CreateTaskModal
                isOpen={isCreateTaskOpen}
                setIsOpen={setIsCreateTaskOpen}
                project={selectedProj}
                workspace={selectedProj?.workspace}
            />
        </>
    );
}