import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CheckCircle2, X, Activity, Target } from 'lucide-react';
import InputError from '@/components/input-error';
import { useState, useEffect } from 'react';

interface LogTimeFormData {
    workspace_id: string | number;
    task_id: string;
    sub_task_id: string;
    note: string;
    start_at: string;
    end_at: string;
}

export default function LogTimeModal({ isOpen, setIsOpen, workspace, tasks }: any) {
    const { data, setData, post, processing, errors, reset } = useForm<LogTimeFormData>({
        workspace_id: workspace?.id || '',
        task_id: '',
        sub_task_id: '',
        note: '',
        start_at: '',
        end_at: '',
    });

    // State lokal untuk menampung subtasks dari task yang dipilih
    const [availableSubTasks, setAvailableSubTasks] = useState([]);

    // Effect untuk update subtasks saat task_id berubah
    useEffect(() => {
        if (data.task_id) {
            // Cari task yang ID-nya cocok (gunakan == untuk mengabaikan tipe data string/number)
            const selectedTask = tasks.find((t: any) => t.id == data.task_id);

            // Cek apakah relasi namanya subtasks atau sub_tasks
            const subTasks = selectedTask?.sub_tasks || selectedTask?.subtasks || [];

            setAvailableSubTasks(subTasks);
            setData('sub_task_id', ''); // Reset pilihan subtask
        } else {
            setAvailableSubTasks([]);
        }
    }, [data.task_id, tasks]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('timesheets.store', {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[500px] border-none bg-background p-0 overflow-hidden rounded-[40px] shadow-2xl">
                <form onSubmit={handleSubmit}>
                    {/* Header Style Sada */}
                    <div className="bg-zinc-900 p-10 text-white relative">
                        <X onClick={() => setIsOpen(false)} className="absolute top-5 right-5 cursor-pointer" />
                        <div className="flex items-center gap-2 mb-2">
                            <div className="size-2 rounded-full bg-sada-red animate-pulse" />
                            <span className="text-[10px] font-black text-sada-red uppercase tracking-[0.4em]">Timesheet</span>
                        </div>
                        <DialogTitle className="text-3xl font-black uppercase  leading-none">
                            Create Operation Log
                        </DialogTitle>
                    </div>

                    <div className="p-10 space-y-5">
                        {/* 1. Task Selection */}
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Task</Label>
                            <Select onValueChange={(val) => setData('task_id', val)}>
                                <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-border font-bold text-[10px] uppercase">
                                    <SelectValue placeholder="SELECT TASK SOURCE" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tasks?.map((task: any) => (
                                        <SelectItem key={task.id} value={task.id.toString()} className="uppercase font-bold text-[10px]">
                                            {task.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.task_id} />
                        </div>

                        {/* 2. Sub-Task Selection (Dynamic) */}
                        {availableSubTasks.length > 0 && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-sada-red ml-1 flex items-center gap-1">
                                    <Target size={10} /> Sub-Task (Optional)
                                </Label>
                                <Select onValueChange={(val) => setData('sub_task_id', val)} value={data.sub_task_id}>
                                    <SelectTrigger className="h-12 rounded-2xl bg-sada-red/5 border-sada-red/20 font-bold text-[10px] uppercase">
                                        <SelectValue placeholder="CHOOSE SUB-TASK" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSubTasks.map((sub: any) => (
                                            <SelectItem key={sub.id} value={sub.id.toString()} className="uppercase font-bold text-[10px]">
                                                {sub.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* 3. Time Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Time</Label>
                                <Input
                                    type="datetime-local"
                                    className="h-12 rounded-2xl bg-muted/20 border-border font-black text-[9px] uppercase"
                                    onChange={e => setData('start_at', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Time</Label>
                                <Input
                                    type="datetime-local"
                                    className="h-12 rounded-2xl bg-muted/20 border-border font-black text-[9px] uppercase"
                                    onChange={e => setData('end_at', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 4. Note */}
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Note</Label>
                            <Textarea
                                placeholder="Add any relevant details about this log entry..."
                                className="min-h-[80px] rounded-2xl bg-muted/20 border-border font-medium text-xs"
                                onChange={e => setData('note', e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 h-12 rounded-xl font-black uppercase text-[9px] tracking-widest">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 h-12 bg-sada-red hover:bg-red-700 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-sada-red/20"
                            >
                                {processing ? 'Syncing...' : 'Commit Log'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}