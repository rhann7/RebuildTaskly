import { useForm } from '@inertiajs/react';
import { UserPlus2, UserMinus2, ShieldCheck, Mail } from 'lucide-react';

interface Props {
    project: any;
    workspace: any;
    members: any[];
    availableEmployees: any[];
}

export default function ProjectMemberTab({ project, workspace, members, availableEmployees }: Props) {
    const { data, setData, post, delete: destroy, processing, reset } = useForm({
        user_id: '',
        project_role: 'Specialist'
    });

    const handleDeploy = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/workspaces/${workspace.slug}/projects/${project.id}/members`, {
            onSuccess: () => reset('user_id'),
        });
    };

    const handleWithdraw = (userId: number) => {
        if (confirm('Are you sure to withdraw this personnel from the project?')) {
            destroy(`/workspaces/${workspace.slug}/projects/${project.id}/members/${userId}`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section & Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                        Personnel Deployment
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Assign specialists from the <span className="text-sada-red font-bold">{workspace.name}</span> workspace to this project archive.
                    </p>
                </div>

                <div className="lg:col-span-2">
                    <form 
                        onSubmit={handleDeploy} 
                        className="flex flex-col md:flex-row gap-4 p-6 rounded-[24px] bg-card border border-border shadow-sm"
                    >
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Select Personnel
                            </label>
                            <select
                                value={data.user_id}
                                onChange={(e) => setData('user_id', e.target.value)}
                                className="w-full bg-background border border-border rounded-xl text-xs text-foreground focus:ring-sada-red focus:border-sada-red transition-all h-11 px-4"
                            >
                                <option value="" className="text-muted-foreground">Identify Subject...</option>
                                {availableEmployees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} — {emp.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="w-full md:w-48 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Designated Role
                            </label>
                            <input
                                type="text"
                                value={data.project_role}
                                onChange={(e) => setData('project_role', e.target.value)}
                                placeholder="e.g. Lead Dev"
                                className="w-full bg-background border border-border rounded-xl text-xs text-foreground focus:ring-sada-red focus:border-sada-red transition-all h-11 px-4 placeholder:text-muted-foreground/50"
                            />
                        </div>
                        
                        <div className="flex items-end">
                            <button
                                disabled={processing || !data.user_id}
                                className="w-full h-11 md:w-auto px-8 bg-sada-red text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 shadow-md hover:shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Processing...' : 'Deploy'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Personnel List Table */}
            <div className="rounded-[24px] border border-border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Personnel</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status/Role</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {members.length > 0 ? (
                            members.map((member) => (
                                <tr key={member.id} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-sada-red shadow-sm">
                                                {member.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground group-hover:text-sada-red transition-colors">
                                                    {member.name}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                                    <Mail size={10} /> {member.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border shadow-sm">
                                            <ShieldCheck size={12} className="text-sada-red" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                                                {member.project_role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {!member.is_manager ? (
                                            <button
                                                onClick={() => handleWithdraw(member.id)}
                                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Withdraw Personnel"
                                            >
                                                <UserMinus2 size={18} />
                                            </button>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase text-sada-red opacity-60 px-2">
                                                Immutable
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                                        <UserPlus2 className="mb-4" size={48} strokeWidth={1.5} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                            No personnel deployed to this project
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}