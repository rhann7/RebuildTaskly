import { useForm } from '@inertiajs/react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, CheckCircle2, Flag, Calendar, Plus, Trash2, ListTodo, X } from 'lucide-react';
import InputError from '@/components/input-error';

export default function CreateTaskModal({ isOpen, setIsOpen, project, workspace }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        // --- FIELD BARU: ARRAY SUBTASKS ---
        subtasks: [{ title: '' }],
    });

    // Logika Enter Otomatis
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Biar form utamanya gak ke-submit

            // Cek apakah baris sekarang ada isinya (biar gak spam baris kosong)
            if (data.subtasks[index].title.trim() !== '') {
                addSubtaskField();

                // Pindahkan fokus ke input baru di render berikutnya
                setTimeout(() => {
                    const inputs = document.querySelectorAll('.subtask-input');
                    (inputs[index + 1] as HTMLInputElement)?.focus();
                }, 0);
            }
        }
    };

    // Fungsi menambah baris subtask kosong
    const addSubtaskField = () => {
        setData('subtasks', [...data.subtasks, { title: '' }]);
    };

    // Fungsi menghapus baris subtask
    const removeSubtaskField = (index: number) => {
        const newSubtasks = [...data.subtasks];
        newSubtasks.splice(index, 1);
        setData('subtasks', newSubtasks);
    };

    // Fungsi update teks subtask berdasarkan index
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

            // Ganti baris yang di-paste dengan baris-baris baru
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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-none bg-card p-0 rounded-[32px] shadow-2xl">
                <div className="bg-zinc-900 p-8 text-white relative sticky top-0 z-10">
                    <X size={20} className="absolute right-4 top-4 cursor-pointer" onClick={() => setIsOpen(false)} />
                    <DialogTitle className="text-3xl font-black uppercase tracking-widest">
                        Create New Task
                    </DialogTitle>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid gap-5">
                        {/* Task Title */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Main Objective</Label>
                            <Input
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                placeholder="E.G. DEVELOP AUTH SYSTEM"
                                className="h-12 rounded-2xl border-border bg-muted/30 font-bold focus:ring-sada-red/20"
                            />
                            <InputError message={errors.title} />
                        </div>

                        {/* Row: Status & Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Status</Label>
                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 uppercase text-[10px] font-black">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">TO-DO</SelectItem>
                                        <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                                        <SelectItem value="done">DONE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Priority</Label>
                                <Select value={data.priority} onValueChange={(val) => setData('priority', val)}>
                                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 uppercase text-[10px] font-black">
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
                        <div className="space-y-4 pt-4 border-t border-dashed border-border">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-sada-red flex items-center gap-2">
                                    <ListTodo size={14} /> Add Sub-Tasks
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addSubtaskField}
                                    className="h-8 rounded-lg border-sada-red/20 text-[9px] font-black uppercase hover:bg-sada-red hover:text-white transition-all"
                                >
                                    <Plus size={12} className="mr-1" /> Sub-Task
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {data.subtasks.map((sub, index) => (
                                    <div key={index} className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-300">
                                        <div className="size-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400 shrink-0">
                                            {index + 1}
                                        </div>
                                        <Input
                                            value={sub.title}
                                            onChange={(e) => handleSubtaskChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            onPaste={(e) => handlePaste(e, index)}
                                            placeholder={`Sub-Task ${index + 1}...`}
                                            className="h-10 rounded-xl bg-muted/10 text-[11px] font-bold"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSubtaskField(index)}
                                            className="size-10 text-muted-foreground hover:text-sada-red shrink-0"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                                {data.subtasks.length === 0 && (
                                    <p className="text-[10px] italic text-muted-foreground text-center py-2 opacity-50">No sub-tasks added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-6 gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-black uppercase text-[10px]">
                            <Trash2 size={12} className="mr-1" /> Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-12 px-8 bg-zinc-900 hover:bg-black text-white rounded-xl font-black uppercase text-[10px] flex items-center gap-2 shadow-xl"
                        >
                            {processing ? 'Processing...' : <><CheckCircle2 size={16} /> Submit</>}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}