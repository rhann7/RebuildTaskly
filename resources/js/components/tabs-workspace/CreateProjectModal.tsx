import { FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    workspace: { slug: string; name: string };
}

export default function CreateProjectModal({ isOpen, setIsOpen, workspace }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/workspaces/${workspace.slug}/projects`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="bg-zinc-950 border border-white/10 rounded-[40px] p-10 sm:max-w-[500px] outline-none">
                <DialogHeader className="mb-8 text-left">
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-red-600 flex items-center justify-center">
                            <Plus size={20} strokeWidth={4} color="white" />
                        </div>
                        New Project Sector
                    </DialogTitle>
                    <DialogDescription className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 pt-2">
                        Deploying unit to {workspace.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6 text-left">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Sector Nomenclature</label>
                        <input
                            type="text"
                            required
                            className="w-full h-14 bg-zinc-900 border border-white/5 rounded-2xl px-6 text-white font-bold text-sm focus:ring-1 focus:ring-red-600 outline-none transition-all"
                            placeholder="E.G. OPERATION OVERLORD"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-red-500 text-[9px] font-bold uppercase mt-2">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Operational Brief</label>
                        <textarea
                            className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-6 text-white font-medium text-sm focus:ring-1 focus:ring-red-600 outline-none transition-all min-h-[120px] resize-none"
                            placeholder="Define objectives..."
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={processing}
                        className="w-full h-14 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95"
                    >
                        {processing ? 'INITIALIZING...' : 'CONFIRM DEPLOYMENT'}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}