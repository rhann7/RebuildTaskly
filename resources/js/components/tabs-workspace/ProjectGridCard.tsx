import { FolderKanban, MoreVertical } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ProjectGridCard({ project, workspaceSlug }: any) {
    return (
        <div className="bg-card p-6 rounded-[32px] border border-border hover:border-red-600/30 transition-all group relative shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div className={`size-12 rounded-2xl bg-gradient-to-br ${project.color || 'from-zinc-800 to-black'} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <FolderKanban size={22} strokeWidth={2.5} />
                </div>
                <button className="text-muted-foreground hover:text-foreground"><MoreVertical size={20} /></button>
            </div>

            <div className="space-y-2 text-left mb-4">
                <Link href={`/workspaces/${workspaceSlug}/projects/${project.slug}`} className="font-black text-[15px] uppercase tracking-tight text-foreground hover:text-red-600 transition-colors inline-block">
                    {project.name}
                </Link>
                <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 italic opacity-80">{project.description || 'No operational brief...'}</p>
            </div>

            <div className="pt-4 border-t border-border/50 flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">{project.status || 'ACTIVE'}</span>
            </div>
        </div>
    );
}