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
        priority: 'medium', // Default
        due_date: '',       // Default empty
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
            <DialogContent className="bg-card border border-border rounded-xl p-8 sm:max-w-[500px] outline-none shadow-2xl transition-all duration-300">
                <DialogHeader className="mb-6 text-left">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-foreground flex items-center gap-3">
                        {/* Icon menggunakan Sada Red sesuai @theme */}
                        <div className="size-10 rounded-lg bg-sada-red flex items-center justify-center shadow-lg shadow-sada-red/20">
                            <Plus size={20} strokeWidth={4} color="white" />
                        </div>
                        Add New Project
                    </DialogTitle>
                    <DialogDescription className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground pt-2">
                        Deploying new project to <span className="text-foreground">{workspace.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6 text-left">
                    {/* Input Project Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Project Name
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full h-12 bg-muted/30 border border-border rounded-lg px-5 text-foreground font-bold text-sm focus:ring-2 focus:ring-sada-red/20 focus:border-sada-red outline-none transition-all placeholder:text-muted-foreground/30"
                            placeholder="Project Name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-sada-red text-[9px] font-black uppercase mt-1 ml-1 tracking-wider">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Input Brief Brief */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Project Description
                        </label>
                        <textarea
                            className="w-full bg-muted/30 border border-border rounded-lg p-5 text-foreground font-medium text-sm focus:ring-2 focus:ring-sada-red/20 focus:border-sada-red outline-none transition-all min-h-[120px] resize-none placeholder:text-muted-foreground/30"
                            placeholder="Project Description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Priority</label>
                            <select 
                                value={data.priority}
                                onChange={e => setData('priority', e.target.value)}
                                className="w-full h-12 bg-muted/30 border border-border rounded-lg px-4 text-foreground font-bold text-sm outline-none"
                            >
                                <option value="low">LOW</option>
                                <option value="medium">MEDIUM</option>
                                <option value="high">HIGH</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Deadline</label>
                            <input 
                                type="date"
                                value={data.due_date}
                                onChange={e => setData('due_date', e.target.value)}
                                className="w-full h-12 bg-muted/30 border border-border rounded-lg px-4 text-foreground font-bold text-sm outline-none"
                            />
                        </div>
                    </div>
                    {/* Submit Button - High Contrast */}
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-[0.98] shadow-xl disabled:opacity-50 cursor-pointer"
                    >
                        {processing ? 'LOADING...' : 'CREATE PROJECT'}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}