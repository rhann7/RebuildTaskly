import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Briefcase, ArrowRight, Info, Calendar, CheckCircle, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Project {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
}

interface Workspace {
    id: number;
    name: string;
    slug: string;
}

interface PageProps {
    workspace: Workspace;
    project: Project;
}

export default function ProjectShow({ workspace, project }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Workspaces', href: '/workspaces' },
        { title: workspace.name, href: `/workspaces/${workspace.slug}` },
        { title: 'Projects', href: `/workspaces/${workspace.slug}/projects` },
        { title: project.name, href: '#' },
    ];

    // Definisi modul project untuk menyimpan route
    const projectModules = [
        {
            title: 'Timesheets',
            description: 'Track work hours and logs for this project.',
            icon: Calendar,
            href: `/projects/${project.slug}/timesheets`,
            active: false, // Ubah ke true jika route sudah siap
        },
        {
            title: 'Tasks',
            description: 'Manage tasks and project progress.',
            icon: CheckCircle,
            href: `/workspaces/${workspace.slug}/projects/${project.slug}/tasks`,
            active: true,
        },
        {
            title: 'Members',
            description: 'Manage team members assigned to this project.',
            icon: Users,
            href: `/projects/${project.slug}/members`,
            active: false,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} · Project`} />

            <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b pb-6 gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            {project.name}
                        </h1>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5 font-medium">
                                <Briefcase className="h-4 w-4" />
                                <span>Project in {workspace.name}</span>
                            </div>
                            <span className="text-zinc-300">|</span>
                            <Badge
                                variant={project.status === 'active' ? 'outline' : 'destructive'}
                                className="capitalize font-bold"
                            >
                                {project.status}
                            </Badge>
                        </div>

                        {project.description && (
                            <p className="italic text-muted-foreground max-w-2xl text-base leading-relaxed">
                                "{project.description}"
                            </p>
                        )}
                    </div>

                    <Button variant="outline" size="sm" className="shrink-0" asChild>
                        <Link href={`/workspaces/${workspace.slug}/projects`}>
                            <ArrowRight className="rotate-180 h-4 w-4 mr-2" />
                            Back to Projects
                        </Link>
                    </Button>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {projectModules.map((module) => (
                        <Card key={module.title} className="transition-all hover:border-primary/50">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <module.icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <CardTitle className="text-xl">{module.title}</CardTitle>
                                </div>
                                <CardDescription>
                                    {module.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {module.active ? (
                                    <Button className="w-full group" asChild>
                                        <Link href={module.href}>
                                            <span>Open Module</span>
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button disabled variant="secondary" className="w-full">
                                        Coming Soon
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Footer info */}
                <div className="flex items-center gap-2 justify-center border border-dashed rounded-xl p-4 bg-muted/30 text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        Project status: <span className="font-semibold">{project.status}</span>
                    </span>
                </div>
            </div>
        </AppLayout>
    );
}