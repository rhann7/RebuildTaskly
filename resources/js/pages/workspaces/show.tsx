import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Building2, ArrowRight, Users, Briefcase, ShieldAlert, Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Workspace {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
    company?: {
        id: number;
        name: string;
    };
}

interface PageProps {
    workspace: Workspace;
}

export default function WorkspaceShow({ workspace }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Workspaces', href: '/workspaces' },
        { title: workspace.name, href: `/workspaces/${workspace.slug}` },
    ];

    const modules = [
        {
            title: 'Projects',
            description: 'Workspace-specific projects and milestones.',
            icon: Briefcase,
        },
        {
            title: 'Team Members',
            description: 'Assign people and manage their presence.',
            icon: Users,
        },
        {
            title: 'Access Control',
            description: 'Permissions specific to this environment.',
            icon: ShieldAlert,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${workspace.name} · Workspace`} />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b pb-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {workspace.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="flex items-center gap-1.5 font-medium text-zinc-600 dark:text-zinc-400">
                                    <Building2 className="h-4 w-4" />
                                    {workspace.company?.name || 'No Company'}
                                </span>
                                <span className="text-zinc-300">|</span>
                                <Badge variant={workspace.status === 'active' ? 'outline' : 'destructive'} className="capitalize font-bold">
                                    {workspace.status}
                                </Badge>
                            </div>
                        </div>

                        {workspace.description && (
                            <p className="text-base text-muted-foreground max-w-3xl leading-relaxed italic">
                                "{workspace.description}"
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" asChild>
                                        <Link href="/workspaces">
                                            <ArrowRight className="h-4 w-4 rotate-180" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Back to List</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modules.map((module) => (
                        <Card key={module.title} className="group transition-all duration-300 shadow-sm hover:shadow-md hover:border-primary/50">
                            <CardHeader className="space-y-2 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-zinc-500/10 flex items-center justify-center shrink-0">
                                        <module.icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <CardTitle className="text-xl">{module.title}</CardTitle>
                                </div>
                                <CardDescription>
                                    {module.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="secondary" className="w-full opacity-60" disabled>
                                    <span>Coming Soon</span>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed bg-muted/30 text-muted-foreground animate-pulse">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        Workspace modules (projects, members, roles) will live inside this workspace context.
                    </span>
                </div>
            </div>
        </AppLayout>
    );
}