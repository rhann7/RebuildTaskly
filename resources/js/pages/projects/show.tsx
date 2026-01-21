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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} · Project`} />

            <div className="max-w-5xl mx-auto py-8 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold">
                            {project.name}
                        </h1>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span>Project in {workspace.name}</span>
                            <Badge
                                variant={project.status === 'active' ? 'outline' : 'destructive'}
                                className="capitalize font-bold"
                            >
                                {project.status}
                            </Badge>
                        </div>

                        {project.description && (
                            <p className="italic text-muted-foreground max-w-2xl">
                                "{project.description}"
                            </p>
                        )}
                    </div>

                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/workspaces/${workspace.slug}/projects`}>
                            <ArrowRight className="rotate-180 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* Modules */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Timesheets
                            </CardTitle>
                            <CardDescription>
                                Track work hours and logs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button disabled variant="secondary" className="w-full">
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                Tasks
                            </CardTitle>
                            <CardDescription>
                                Manage tasks and progress.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button disabled variant="secondary" className="w-full">
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Members
                            </CardTitle>
                            <CardDescription>
                                Manage team members.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button disabled variant="secondary" className="w-full">
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>

                </div>

                {/* Footer info */}
                <div className="flex items-center gap-2 justify-center border border-dashed rounded-xl p-4 text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span className="text-sm">
                        Semua aktivitas project terpusat di sini.
                    </span>
                </div>
            </div>
        </AppLayout>
    );
}
