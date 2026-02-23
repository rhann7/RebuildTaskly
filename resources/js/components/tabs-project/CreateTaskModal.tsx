import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Plus, Trash2, ListTodo, X } from 'lucide-react';
import InputError from '@/components/input-error';

export default function CreateTaskModal({ isOpen, setIsOpen, project, workspace }: any) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        subtasks: [{ title: '' }],
    });

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (data.subtasks[index].title.trim() !== '') {
                addSubtaskField();
                setTimeout(() => {
                    const inputs = document.querySelectorAll('.subtask-input');
                    (inputs[index + 1] as HTMLInputElement)?.focus();
                }, 0);
            }
        }
    };

    const addSubtaskField = () => {
        setData('subtasks', [...data.subtasks, { title: '' }]);
    };

    const removeSubtaskField = (index: number) => {
        const newSubtasks = [...data.subtasks];
        newSubtasks.splice(index, 1);
        setData('subtasks', newSubtasks);
    };

    const handleSubtaskChange = (index: number, value: string) => {
        const newSubtasks = [...data.subtasks];
        newSubtasks[index].title = value;
        setData('subtasks', newSubtasks);
    };

    const handlePaste = (e: React.ClipboardEvent, index: number) => {
        const pasteData = e.clipboardData.getData('text');
        const lines = pasteData.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length > 1) {
            e.preventDefault();
            const newSubtasks = [...data.subtasks];
            const formattedLines = lines.map(line => ({ title: line }));
            newSubtasks.splice(index, 1, ...formattedLines);
            setData('subtasks', newSubtasks);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const wSlug = workspace?.slug;
        const pSlug = project?.slug;

        if (!wSlug || !pSlug) return;

        post(`/workspaces/${wSlug}/projects/${pSlug}/tasks`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    // Filter baris kosong agar tidak dikirim ke DB
    transform((data) => ({
        ...data,
        subtasks: data.subtasks.filter((sub) => sub.title.trim() !== '')
    }));

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden border border-border bg-card p-0 rounded-[32px] shadow-2xl flex flex-col">
                
                {/* --- HEADER DIPERBARUI DI SINI --- */}
                <div className="bg-muted/30 border-b border-border p-8 relative z-10 shrink-0">
                    <button 
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="absolute right-6 top-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                    <DialogTitle className="text-2xl md:text-3xl font-black uppercase tracking-widest text-foreground flex flex-col gap-1">
                        Create New Task
                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest">
                            Project: {project?.name || 'Unknown'}
                        </span>
                    </DialogTitle>
                </div>

                {/* Area Scrollable Form */}
                <div className="overflow-y-auto flex-1 p-8">
                    <form id="create-task-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6">
                            
                            {/* Task Title */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                    Main Objective
                                </Label>
                                <Input
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="E.G. DEVELOP AUTH SYSTEM"
                                    className="h-12 rounded-2xl border-border bg-background font-bold focus:ring-sada-red/20 focus:border-sada-red transition-all"
                                    autoFocus
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Row: Status & Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                        Status
                                    </Label>
                                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                        <SelectTrigger className="h-11 rounded-xl bg-background border-border uppercase text-[10px] font-black focus:ring-sada-red/20">
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
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                        Priority
                                    </Label>
                                    <Select value={data.priority} onValueChange={(val) => setData('priority', val)}>
                                        <SelectTrigger className="h-11 rounded-xl bg-background border-border uppercase text-[10px] font-black focus:ring-sada-red/20">
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

                            {/* --- SECTION: DYNAMIC SUBTASKS --- */}
                            <div className="space-y-4 pt-6 border-t border-dashed border-border mt-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                                        <ListTodo size={14} className="text-sada-red" /> Sub-Objectives
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addSubtaskField}
                                        className="h-8 rounded-lg border-border text-[9px] font-black uppercase hover:bg-sada-red hover:text-white hover:border-sada-red transition-all"
                                    >
                                        <Plus size={12} className="mr-1" /> Add Row
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {data.subtasks.map((sub, index) => (
                                        <div key={index} className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-300">
                                            <div className="size-8 rounded-xl bg-muted border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground shrink-0 shadow-sm">
                                                {index + 1}
                                            </div>
                                            <Input
                                                value={sub.title}
                                                onChange={(e) => handleSubtaskChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                onPaste={(e) => handlePaste(e, index)}
                                                placeholder="Type sub-task here..."
                                                className="subtask-input h-10 rounded-xl bg-background border-border text-[12px] font-medium focus:border-sada-red transition-all"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeSubtaskField(index)}
                                                className="size-10 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 shrink-0 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                    
                                    {data.subtasks.length === 0 && (
                                        <div className="py-6 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center bg-muted/20">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                                No sub-objectives active.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Terkunci (Sticky Bottom) */}
                <div className="p-6 bg-muted/30 border-t border-border flex justify-end gap-3 shrink-0">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setIsOpen(false)} 
                        className="rounded-xl font-black uppercase text-[10px] tracking-widest h-11 hover:bg-muted"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="create-task-form"
                        disabled={processing}
                        className="h-11 px-8 bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-200 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        {processing ? 'Deploying...' : <><CheckCircle2 size={16} /> Deploy Task</>}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}