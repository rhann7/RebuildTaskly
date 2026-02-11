import { useForm } from '@inertiajs/react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, CheckCircle2, X } from 'lucide-react';
import InputError from '@/components/input-error';

export default function AddSubTaskModal({ isOpen, setIsOpen, workspace, project, task }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Pastikan mengambil dari props yang di-passing
        const wSlug = workspace?.slug;
        const pSlug = project?.slug;
        const tSlug = task?.slug;

        console.log("Submitting with:", { wSlug, pSlug, tSlug });

        if (!wSlug || !pSlug || !tSlug) {
            // Beri alert agar kamu tahu mana yang kosong saat testing
            alert(`Missing: wSlug(${wSlug}), pSlug(${pSlug}), tSlug(${tSlug})`);
            return;
        }

        post(`/workspaces/${wSlug}/projects/${pSlug}/tasks/${tSlug}/subtasks`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };  

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[480px] border-none bg-background p-0 overflow-hidden rounded-[40px] shadow-2xl transition-all duration-500">

                {/* 1. Gabungkan Form untuk membungkus SELURUH konten Dialog agar tombol submit terdeteksi */}
                <form onSubmit={handleSubmit} className="flex flex-col">

                    {/* --- HEADER SECTION (Di dalam form agar tidak menghalangi event) --- */}
                    <div className="bg-white dark:bg-muted/10 border-b border-border p-10 relative">
                        <div className="absolute right-0 top-0 p-10 opacity-10 rotate-12 pointer-events-none">
                            <Target size={120} className="text-sada-red" />
                        </div>

                        <div className="relative z-10 flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-2 rounded-full bg-sada-red animate-pulse" />
                                <span className="text-[10px] font-black text-sada-red uppercase tracking-[0.4em]">SUB-TASK</span>
                            </div>
                            <DialogTitle className="text-3xl font-black uppercase leading-none">
                                Create Sub-Task
                            </DialogTitle>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
                                Task Ref: {task?.title || 'Unknown Task'}
                            </p>
                        </div>
                    </div>

                    {/* --- BODY SECTION --- */}
                    <div className="p-10 space-y-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1 flex items-center gap-2">
                                <Target size={12} className="text-sada-red" /> Sub-Task Title
                            </Label>
                            <Input
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                placeholder="E.G. DESIGN LANDING PAGE"
                                required
                                autoFocus
                                className="h-14 rounded-2xl border-border bg-muted/20 px-6 font-black text-[13px] uppercase  focus:ring-4 focus:ring-sada-red/5 focus:border-sada-red transition-all"
                            />
                            <InputError message={errors.title} />
                        </div>

                        {/* --- FOOTER ACTIONS --- */}
                        <div className="flex flex-row gap-4 pt-4 border-t border-border/50">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-muted transition-all"
                            >
                                <X size={14} className="mr-2" /> Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 h-14 bg-sada-red hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-sada-red/20 disabled:opacity-50"
                            >
                                {processing ? (
                                    <span className="animate-pulse ">Deploying...</span>
                                ) : (
                                    <>
                                        <CheckCircle2 size={16} strokeWidth={3} /> Create
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}