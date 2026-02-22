import { Link } from '@inertiajs/react';
import { ExternalLink, Settings2, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const WorkspaceTable = ({ workspaces, isSuperAdmin, canManage, onEdit, onDelete }: any) => (
    <Table className="border-collapse">
        <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/50 hover:bg-muted/30">
                <TableHead className="w-[60px] text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">ID</TableHead>
                {isSuperAdmin && <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Entity</TableHead>}
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Workspace Designation</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Status</TableHead>
                <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">Operations</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {workspaces.data.map((workspace: any, i: number) => (
                <TableRow key={workspace.id} className="group hover:bg-sada-red/[0.02] border-b border-border/30 transition-colors">
                    <TableCell className="text-center text-[10px] font-black text-muted-foreground/40 tabular-nums">
                        {(workspaces.from + i).toString().padStart(2, '0')}
                    </TableCell>
                    {isSuperAdmin && (
                        <TableCell>
                            <span className="text-[9px] font-black uppercase tracking-wider text-sada-red bg-sada-red/5 px-2.5 py-1 rounded border border-sada-red/10">
                                {workspace.company?.name}
                            </span>
                        </TableCell>
                    )}
                    <TableCell>
                        <Link 
                            href={`/workspaces/${workspace.slug}`} 
                            className="flex flex-col gap-0.5 group/link w-fit"
                        >
                            <span className="text-xs font-black uppercase tracking-tight text-foreground group-hover/link:text-sada-red transition-all duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-sada-red after:transition-all group-hover/link:after:w-full">
                                {workspace.name}
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter line-clamp-1 italic">
                                "{workspace.description || 'NO MISSION BRIEF RECORDED'}"
                            </span>
                        </Link>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                            workspace.status === 'active' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                            : 'bg-sada-red/10 border-sada-red/20 text-sada-red'
                        }`}>
                            <div className={`size-1 rounded-full ${workspace.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-sada-red'}`} />
                            <span className="text-[9px] font-black uppercase tracking-[0.1em]">{workspace.status}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                        <div className="flex justify-end items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-zinc-900 transition-all border border-transparent hover:border-white/10" asChild>
                                            <Link href={`/workspaces/${workspace.slug}`}>
                                                <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-zinc-900 border-white/10 text-[9px] font-black uppercase tracking-widest text-white">Enter Sector</TooltipContent>
                                </Tooltip>
                                
                                {canManage && (
                                    <>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-zinc-900 transition-all border border-transparent hover:border-white/10" onClick={() => onEdit(workspace)}>
                                                    <Settings2 className="h-3.5 w-3.5 text-zinc-400 hover:text-white" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-zinc-900 border-white/10 text-[9px] font-black uppercase tracking-widest text-white">Reconfigure</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-sada-red/20 transition-all border border-transparent hover:border-sada-red/50 text-zinc-400 hover:text-sada-red" onClick={() => onDelete(workspace.slug)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-sada-red text-white text-[9px] font-black uppercase tracking-widest">Terminate</TooltipContent>
                                        </Tooltip>
                                    </>
                                )}
                            </TooltipProvider>
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);