import { useForm } from '@inertiajs/react';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, CheckCircle2 } from 'lucide-react';
import InputError from '@/components/input-error';

export default function CreateTaskModal({ isOpen, setIsOpen, project, workspace }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        status: 'todo', 
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Validasi Slug biar gak undefined
        const wSlug = workspace?.slug;
        const pSlug = project?.slug;

        if (!wSlug || !pSlug) {
            console.error("CRITICAL ERROR: Slugs are missing!", { workspace, project });
            alert("Error: Workspace or Project data not loaded properly.");
            return;
        }

        const url = `/workspaces/${wSlug}/projects/${pSlug}/tasks`;
        console.log("SENDING POST TO:", url);

        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("DEPLOY SUCCESS");
                setIsOpen(false);
                reset();
            },
            onError: (err) => {
                console.error("DEPLOY ERROR:", err);
            }
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

                {/* Form dipastikan membungkus semua input dan button submit */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid gap-5">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Objective Title</Label>
                            <Input 
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                placeholder="E.G. CORE ENGINE SYNC"
                                required
                                className="h-12 rounded-xl border-border bg-muted/30 font-bold focus:ring-zinc-900/10 focus:border-zinc-900 uppercase tracking-tight"
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Task Briefing</Label>
                            <Textarea 
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="min-h-[100px] rounded-xl border-border bg-muted/30 font-medium"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Status</Label>
                            <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                <SelectTrigger className="h-12 rounded-xl border-border bg-muted/30 font-bold uppercase text-[10px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="todo">TO-DO</SelectItem>
                                    <SelectItem value="in_progress">IN PROGRESS</SelectItem>
                                    <SelectItem value="done">DONE</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 gap-3">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setIsOpen(false)} 
                            className="rounded-xl font-black uppercase text-[10px]"
                        >
                            Abort
                        </Button>
                        <Button 
                            type="submit" // PASTIKAN TYPE SUBMIT
                            disabled={processing}
                            className="h-12 px-8 bg-zinc-900 hover:bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                        >
                            {processing ? 'Processing...' : <><CheckCircle2 size={16} /> Deploy Task</>}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}