import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, X } from 'lucide-react';
import InputError from '@/components/input-error';
import { useEffect } from 'react';

export default function EditTaskModal({ isOpen, setIsOpen, project, workspace, task }: any) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'todo',
        priority: task?.priority || 'medium',
        due_date: task?.due_date ? task.due_date.split('T')[0] : '', // Format YYYY-MM-DD
    });

    // Reset form dengan data terbaru jika task berubah (karena navigasi)
    useEffect(() => {
        if (task && isOpen) {
            setData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'todo',
                priority: task.priority || 'medium',
                due_date: task.due_date ? task.due_date.split('T')[0] : '',
            });
        }
    }, [task, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const wSlug = workspace?.slug;
        const pSlug = project?.slug;
        const tSlug = task?.slug;

        if (!wSlug || !pSlug || !tSlug) return;

        // Gunakan metode PUT untuk update data
        put(`/workspaces/${wSlug}/projects/${pSlug}/tasks/${tSlug}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[500px] border border-border bg-card p-0 rounded-[32px] shadow-2xl flex flex-col">
                
                {/* Header */}
                <div className="bg-muted/30 border-b border-border p-8 relative">
                    <button 
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="absolute right-6 top-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                    <DialogTitle className="text-2xl font-black uppercase tracking-widest text-foreground flex flex-col gap-1">
                        Edit Task
                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest">
                            ID: {task?.id || '---'}
                        </span>
                    </DialogTitle>
                </div>

                {/* Form Body */}
                <div className="p-8 flex-1 overflow-y-auto">
                    <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                Task Title
                            </Label>
                            <Input
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="h-11 rounded-xl border-border bg-background font-bold focus:ring-sada-red/20 focus:border-sada-red"
                                required
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                Description
                            </Label>
                            <Textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="min-h-[100px] rounded-xl border-border bg-background focus:ring-sada-red/20 focus:border-sada-red resize-none"
                                placeholder="Enter mission parameters..."
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Status</Label>
                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                    <SelectTrigger className="h-11 rounded-xl bg-background border-border uppercase text-[10px] font-black">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">TO-DO</SelectItem>
                                        <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                                        <SelectItem value="done">DONE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Priority</Label>
                                <Select value={data.priority} onValueChange={(val) => setData('priority', val)}>
                                    <SelectTrigger className="h-11 rounded-xl bg-background border-border uppercase text-[10px] font-black">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">LOW</SelectItem>
                                        <SelectItem value="medium">MEDIUM</SelectItem>
                                        <SelectItem value="high">HIGH</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                Due Date
                            </Label>
                            <Input
                                type="date"
                                value={data.due_date}
                                onChange={e => setData('due_date', e.target.value)}
                                className="h-11 rounded-xl border-border bg-background text-sm font-bold uppercase focus:ring-sada-red/20 focus:border-sada-red"
                            />
                            <InputError message={errors.due_date} />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 bg-muted/30 border-t border-border flex justify-end gap-3 shrink-0">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-black uppercase text-[10px] h-11 hover:bg-muted">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="edit-task-form"
                        disabled={processing}
                        className="h-11 px-8 bg-zinc-900 dark:bg-white dark:text-black hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                    >
                        {processing ? 'Updating...' : <><CheckCircle2 size={16} /> Update Task</>}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}