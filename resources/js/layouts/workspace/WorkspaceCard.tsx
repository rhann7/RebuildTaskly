import { FolderKanban, Star, MoreVertical, Clock } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export const WorkspaceCard = ({ workspace, viewMode }: any) => {
    const isGrid = viewMode === 'grid';

    return (
        <div className={`group bg-card border border-border transition-all duration-300 hover:shadow-xl hover:shadow-sada-red/5 hover:border-sada-red/20
            ${isGrid
                ? 'rounded-[24px] p-6 flex flex-col h-full' // Layout mewah untuk grid
                : 'rounded-2xl p-4 flex flex-row items-center justify-between gap-6 h-auto min-h-[88px]' // Layout ringkas untuk list
            }`}
        >
            {/* Bagian 1: Ikon & Nama */}
            <div className={`flex items-center gap-4 ${isGrid ? 'mb-4' : 'flex-1 min-w-[200px]'}`}>
                <div className={`shrink-0 size-12 rounded-2xl bg-gradient-to-br ${workspace.gradient} flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                    <FolderKanban className="size-6 text-white" />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground truncate group-hover:text-sada-red transition-colors">
                            {workspace.name}
                        </span>
                        {workspace.isFavorite && (
                            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full w-fit tracking-wider
                            ${workspace.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-600' 
                                : 'bg-orange-500/10 text-orange-600'}
                        `}>
                            {workspace.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bagian 2: Deskripsi */}
            {isGrid ? (
                <p className="text-muted-foreground text-sm mb-6 line-clamp-2 leading-relaxed">
                    {workspace.description}
                </p>
            ) : (
                <p className="hidden xl:block text-muted-foreground text-xs w-1/4 line-clamp-1 italic">
                    {workspace.description}
                </p>
            )}

            {/* Bagian 3: Progress Bar */}
            <div className={`${isGrid ? 'mt-auto mb-6' : 'w-48 shrink-0 hidden md:block'}`}>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-2 font-bold uppercase tracking-widest">
                    <span>Progress</span>
                    <span className="text-foreground">{workspace.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                    <div
                        className={`h-full bg-gradient-to-r ${workspace.gradient} transition-all duration-1000 ease-out rounded-full`}
                        style={{ width: `${workspace.progress}%` }}
                    />
                </div>
            </div>

            {/* Bagian 4: Members & Last Activity */}
            <div className={`flex items-center justify-between ${!isGrid ? 'w-1/3 gap-8' : 'pt-4 border-t border-border'}`}>
                {/* Avatar Group */}
                <div className="flex items-center -space-x-3 shrink-0">
                    {workspace.members.slice(0, 3).map((m: any, i: number) => (
                        <ImageWithFallback 
                            key={i} 
                            src={m.avatar} 
                            alt={m.name} 
                            className="size-8 rounded-full border-2 border-card object-cover shadow-sm hover:z-10 transition-all hover:scale-110" 
                        />
                    ))}
                    {workspace.totalMembers > 3 && (
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-black border-2 border-card text-muted-foreground">
                            +{workspace.totalMembers - 3}
                        </div>
                    )}
                </div>

                {/* Last Activity */}
                <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground shrink-0">
                    <Clock className="size-3.5" />
                    <span className="whitespace-nowrap">{workspace.lastActivity}</span>
                </div>

                {/* Tombol Opsi (Hanya List) */}
                {!isGrid && (
                    <button className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground active:scale-90">
                        <MoreVertical className="size-4" />
                    </button>
                )}
            </div>
        </div>
    );
};