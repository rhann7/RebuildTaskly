// resources/js/pages/workspaces/partials/workspace-header.tsx
import { Building2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export const WorkspaceHeader = ({ workspace }: { workspace: any }) => (
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
                    <Badge variant={workspace.status === 'active' ? 'outline' : 'destructive'}>
                        {workspace.status}
                    </Badge>
                </div>
            </div>
            {workspace.description && (
                <p className="text-base text-muted-foreground italic">"{workspace.description}"</p>
            )}
        </div>
        <Button variant="outline" size="icon" asChild>
            <Link href="/workspaces"><ArrowRight className="h-4 w-4 rotate-180" /></Link>
        </Button>
    </div>
);