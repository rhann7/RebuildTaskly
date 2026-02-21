// resources/js/components/timesheet/TimeEntryModals.tsx

import { Layout, Clock, Upload, Save, Send, Briefcase, FolderKanban, Target } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "../ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

export function TimeEntryModal({ isOpen, setIsOpen, data, setData, submitEntry, workspaces }: any) {

    // Local state untuk filtering dropdown
    const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    // Sync data awal jika sedang mode EDIT
    useEffect(() => {
        if (data.workspace_id) {
            const ws = workspaces.find((w: any) => w.id == data.workspace_id);
            setSelectedWorkspace(ws);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
            <DialogContent className="max-w-2xl bg-background border border-border rounded-[32px] p-0 overflow-hidden shadow-2xl">
                {/* HEADER */}
                <DialogHeader className="p-8 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="size-2 bg-sada-red rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-sada-red uppercase tracking-[0.3em]">Operational Entry</span>
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Log Work Parameters</DialogTitle>
                </DialogHeader>

                <form className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                                <FolderKanban size={12} className="text-sada-red" /> Project
                            </label>
                            <Select
                                disabled={!selectedWorkspace}
                                value={data.project_id?.toString()}
                                onValueChange={(val) => {
                                    const proj = selectedWorkspace?.projects?.find((p: any) => p.id == val);
                                    setSelectedProject(proj);
                                    setData('project_id', val);
                                }}
                            >
                                <SelectTrigger className="h-12 bg-muted/50 border-border rounded-xl font-bold text-xs uppercase">
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedWorkspace?.projects?.map((p: any) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                                <Layout size={12} className="text-sada-red" /> Task
                            </label>
                            <Select
                                disabled={!selectedProject}
                                value={data.task_id?.toString()}
                                onValueChange={(val) => {
                                    const task = selectedProject?.tasks?.find((t: any) => t.id == val);
                                    setSelectedTask(task);
                                    setData('task_id', val);
                                }}
                            >
                                <SelectTrigger className="h-12 bg-muted/50 border-border rounded-xl font-bold text-xs uppercase">
                                    <SelectValue placeholder="Select Task" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedProject?.tasks?.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                                <Target size={12} className="text-sada-red" /> Objective (Sub-Task)
                            </label>
                            <Select
                                disabled={!selectedTask}
                                value={data.sub_task_id?.toString()}
                                onValueChange={(val) => setData('sub_task_id', val)}
                            >
                                <SelectTrigger className="h-12 bg-muted/50 border-border rounded-xl font-bold text-xs uppercase text-sada-red">
                                    <SelectValue placeholder="Select Objective" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedTask?.subtasks?.map((st: any) => (
                                        <SelectItem key={st.id} value={st.id.toString()}>
                                            {st.is_completed ? '✅ ' : '⭕ '}{st.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 3. WORK DESCRIPTION (Note) */}
                    <div className="space-y-2 pt-4">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Log Report / Note</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="What did you achieve in this window?"
                            rows={3}
                            className="w-full bg-muted/20 border border-border rounded-2xl p-4 text-xs font-medium focus:ring-1 focus:ring-sada-red outline-none transition-all"
                        />
                    </div>
                </form>

                <DialogFooter className="p-8 bg-muted/20 border-t border-border flex gap-3">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl text-[10px] font-black uppercase tracking-widest">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => submitEntry()}
                        className="flex-1 h-12 rounded-xl bg-sada-red text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 shadow-lg shadow-sada-red/20 flex gap-2"
                    >
                        <Send size={14} /> Commit Entry
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}