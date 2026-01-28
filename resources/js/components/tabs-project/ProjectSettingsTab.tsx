import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Save, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';

/* =======================
   TYPES
======================= */
interface Project {
    id: number;
    name: string;
    description?: string;
    status?: string;
    slug: string;
}

interface Workspace {
    id: number;
    slug: string;
}

interface ProjectSettingsTabProps {
    project: Project;
    workspace: Workspace;
    isSuperAdmin: boolean;
}

/* =======================
   COMPONENT
======================= */
export default function ProjectSettingsTab({
    project,
    workspace,
    isSuperAdmin,
}: ProjectSettingsTabProps) {

    // Form untuk Update Info
    const { data, setData, patch, processing, errors } = useForm<{
        workspace_id: number;
        name: string;
        description: string;
        status: string;
    }>({
        workspace_id: workspace.id,
        name: project.name ?? '',
        description: project.description ?? '',
        status: project.status ?? 'active',
    });

    // Form khusus Delete
    const { delete: destroy, processing: deleting } = useForm();

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        patch(`/workspaces/${workspace.slug}/projects/${project.slug}`);
    };

    const handleDelete = () => {
        if (
            confirm(
                'PROTOKOL PENGHAPUSAN: Semua data task dalam project ini akan dimusnahkan. Lanjutkan?'
            )
        ) {
            destroy(`/workspaces/${workspace.slug}/projects/${project.slug}`);
        }
    };

    return (
        <div className="w-full max-w-3xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* SECTION 1: GENERAL CONFIGURATION */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="size-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
                        <Save size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em]">
                            Project Identity
                        </h2>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">
                            Update core project parameters
                        </p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-5">
                    <div className="grid gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                            Project Name
                        </Label>
                        <Input
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="h-12 rounded-xl border-border bg-card font-bold uppercase tracking-tight focus:ring-zinc-900/10 focus:border-zinc-900"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                            Mission Briefing (Description)
                        </Label>
                        <Textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="min-h-[120px] rounded-xl border-border bg-card font-medium italic focus:ring-zinc-900/10 focus:border-zinc-900"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <Button
                        disabled={processing}
                        className="h-12 px-10 bg-zinc-900 hover:bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95"
                    >
                        {processing ? 'Syncing...' : 'Commit Changes'}
                    </Button>
                </form>
            </section>

            {/* SECTION 2: DANGER ZONE */}
            <section className="p-8 rounded-[32px] border-2 border-dashed border-red-500/20 bg-red-500/5 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                        <AlertTriangle size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-red-600">
                            Danger Zone
                        </h2>
                        <p className="text-[10px] text-red-500/60 uppercase font-bold">
                            Irreversible sector decommissioning
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-red-500/20">
                    <div className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase tracking-tight">
                            Purge This Project
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-medium">
                            Once deleted, all objectives and data are lost forever.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        variant="destructive"
                        className="h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 flex items-center gap-2"
                    >
                        <Trash2 size={14} />
                        {deleting ? 'Purging...' : 'Delete Project'}
                    </Button>
                </div>
            </section>
        </div>
    );
}
