import { useForm } from '@inertiajs/react';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, CheckCircle2, Flag, Calendar } from 'lucide-react';
import InputError from '@/components/input-error';

export default function CreateTaskModal({ isOpen, setIsOpen, project, workspace }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium', // Field baru
        due_date: '',       // Field baru
    });

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
            <DialogContent className="sm:max-w-[550px] border-none bg-card p-0 overflow-hidden rounded-[32px] shadow-2xl">
                <div className="bg-zinc-900 p-8 text-white relative">
                    <Zap className="absolute right-6 top-6 opacity-20 size-12" />
                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                        Initialize Task
                    </DialogTitle>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid gap-4">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Objective Title</Label>
                            <Input 
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                placeholder="E.G. CORE ENGINE SYNC"
                                required
                                className="h-11 rounded-xl border-border bg-muted/30 font-bold focus:ring-zinc-900/10 focus:border-zinc-900 uppercase tracking-tight"
                            />
                            <InputError message={errors.title} />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Task Briefing</Label>
                            <Textarea 
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="min-h-[80px] rounded-xl border-border bg-muted/30 font-medium"
                            />
                            <InputError message={errors.description} />
                        </div>

                        {/* Row: Status & Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Status</Label>
                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                    <SelectTrigger className="h-11 rounded-xl border-border bg-muted/30 font-bold uppercase text-[10px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl font-bold uppercase text-[10px]">
                                        <SelectItem value="todo">TO-DO</SelectItem>
                                        <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                                        <SelectItem value="done">DONE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Priority</Label>
                                <Select value={data.priority} onValueChange={(val) => setData('priority', val)}>
                                    <SelectTrigger className="h-11 rounded-xl border-border bg-muted/30 font-bold uppercase text-[10px]">
                                        <div className="flex items-center gap-2">
                                            <Flag size={12} className="text-muted-foreground" />
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl font-bold uppercase text-[10px]">
                                        <SelectItem value="low">LOW</SelectItem>
                                        <SelectItem value="medium">MEDIUM</SelectItem>
                                        <SelectItem value="high">HIGH</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Objective Deadline</Label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                <Input 
                                    type="date"
                                    value={data.due_date}
                                    onChange={e => setData('due_date', e.target.value)}
                                    className="h-11 pl-11 rounded-xl border-border bg-muted/30 font-bold uppercase text-[10px]"
                                />
                            </div>
                            <InputError message={errors.due_date} />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 gap-3">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setIsOpen(false)} 
                            className="rounded-xl font-black uppercase text-[10px] tracking-widest"
                        >
                            Abort
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="h-12 px-8 bg-zinc-900 hover:bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-zinc-900/20"
                        >
                            {processing ? 'Processing...' : <><CheckCircle2 size={16} /> Deploy Task</>}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}