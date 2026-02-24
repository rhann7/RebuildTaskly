import { Link } from '@inertiajs/react';
import { ExternalLink, Settings2, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const ProjectTable = ({ projects, workspaceSlug, isSuperAdmin, canManage, onEdit, onDelete }: any) => (
    <Table>
        <TableHeader>
            <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                <TableHead className="w-[50px] text-center">#</TableHead>
                {isSuperAdmin && <TableHead>Workspace</TableHead>}
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {projects.data.map((project: any, i: number) => (
                <TableRow key={project.id} className="group hover:bg-muted/30">
                    <TableCell className="text-center text-muted-foreground tabular-nums">
                        {projects.from + i}
                    </TableCell>
                    {isSuperAdmin && <TableCell className="font-medium">{project.workspace?.name}</TableCell>}
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{project.name}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                                {project.description || 'No description'}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={project.status === 'active' ? 'outline' : 'destructive'} className="capitalize text-[10px] h-5">
                            {project.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" asChild>
                                            <Link href={`/workspaces/${workspaceSlug}/projects/${project.slug}`}>
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Open Project</TooltipContent>
                                </Tooltip>
                                {canManage && (
                                    <>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(project)}>
                                                    <Settings2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Project</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => onDelete(project.slug)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-red-600 text-white">Delete Project</TooltipContent>
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