import { Link } from '@inertiajs/react';
import { ExternalLink, Settings2, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const WorkspaceTable = ({ workspaces, isSuperAdmin, canManage, onEdit, onDelete }: any) => (
    <Table>
        <TableHeader>
            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                <TableHead className="w-[50px] text-center">#</TableHead>
                {isSuperAdmin && <TableHead>Company</TableHead>}
                <TableHead>Workspace Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {workspaces.data.map((workspace: any, i: number) => (
                <TableRow key={workspace.id} className="group hover:bg-muted/30">
                    <TableCell className="text-center text-muted-foreground tabular-nums">{workspaces.from + i}</TableCell>
                    {isSuperAdmin && <TableCell className="font-medium">{workspace.company?.name}</TableCell>}
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{workspace.name}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{workspace.description || 'No description'}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={workspace.status === 'active' ? 'outline' : 'destructive'} className="capitalize text-[10px] h-5">
                            {workspace.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" asChild>
                                            <Link href={`/workspaces/${workspace.slug}`}><ExternalLink className="h-4 w-4" /></Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Manage Workspace</TooltipContent>
                                </Tooltip>
                                {canManage && (
                                    <>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(workspace)}><Settings2 className="h-4 w-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Workspace</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => onDelete(workspace.slug)}><Trash2 className="h-4 w-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-red-600 text-white">Delete Workspace</TooltipContent>
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