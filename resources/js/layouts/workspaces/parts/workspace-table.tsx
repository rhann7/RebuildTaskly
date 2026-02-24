import { Link } from '@inertiajs/react';
import { ExternalLink, Settings2, Trash2, Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const WorkspaceTable = ({ workspaces, isSuperAdmin, canManage, onEdit, onDelete }: any) => {
    return (
        <Table className="border-collapse">
            <TableHeader>
                <TableRow className="bg-muted/30 border-b border-border/50 hover:bg-muted/30">
                    <TableHead className="w-[60px] text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">ID</TableHead>
                    {isSuperAdmin && <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Company</TableHead>}
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Workspace Designation</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Status</TableHead>
                    <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">Operations</TableHead>
                </TableRow>
            </TableHeader>
            
            <TableBody>
                {workspaces.data.map((workspace: any, i: number) => {
                    const serialNumber = (workspaces.from + i).toString().padStart(2, '0');
                    const isActive = workspace.status === 'active';

                    return (
                        <TableRow key={workspace.id} className="group hover:bg-sada-red/[0.02] border-b border-border/30 transition-colors">
                            {/* ID CELL */}
                            <TableCell className="text-center text-[10px] font-black text-muted-foreground/40 tabular-nums align-middle">
                                {serialNumber}
                            </TableCell>

                            {/* COMPANY CELL */}
                            {isSuperAdmin && (
                                <TableCell className="align-middle">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-sada-red bg-sada-red/5 px-2.5 py-1 rounded border border-sada-red/10">
                                        {workspace.company?.name}
                                    </span>
                                </TableCell>
                            )}

                            {/* WORKSPACE DESIGNATION CELL (Styled like your new snippet) */}
                            <TableCell className="align-middle py-3">
                                <div className="flex items-center gap-4">
                                    {/* Gradient Icon Box */}
                                    <div className="size-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-sada-red to-red-600 shadow-lg shadow-sada-red/20 group-hover:shadow-sada-red/40 transition-all duration-300 border border-white/5 ring-1 ring-white/10">
                                        <Building2 className="size-5 text-white shadow-sm" />
                                    </div>
                                    
                                    {/* Text Content */}
                                    <Link 
                                        href={`/workspaces/${workspace.slug}`} 
                                        className="flex flex-col gap-1 group/link w-fit no-underline"
                                    >
                                        <span className="font-black text-foreground text-[13px] group-hover/link:text-sada-red transition-colors uppercase tracking-tight leading-none">
                                            {workspace.name}
                                        </span>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 max-w-[280px] italic leading-relaxed font-medium m-0">
                                            {workspace.description || 'No description provided for this workspace.'}
                                        </p>
                                    </Link>
                                </div>
                            </TableCell>

                            {/* STATUS CELL */}
                            <TableCell className="text-center align-middle">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                                    isActive 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                    : 'bg-sada-red/10 border-sada-red/20 text-sada-red'
                                }`}>
                                    <div className={`size-1 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-sada-red'}`} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.1em]">{workspace.status}</span>
                                </div>
                            </TableCell>

                            {/* OPERATIONS CELL */}
                            <TableCell className="text-right px-8 align-middle">
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
                    );
                })}
            </TableBody>
        </Table>
    );
};