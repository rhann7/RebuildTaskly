import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ChevronLeft, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

type PageProps = {
    hasActivePlan: boolean;
    pageConfig: { title: string; description: string; can_manage: boolean };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Tickets', href: route('tickets.index') },
    { title: 'Create Ticket', href: '#' },
];

export default function TicketCreate({ hasActivePlan, pageConfig }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        title:       '',
        description: '',
        type:        'bug_report' as 'feature_request' | 'bug_report',
        priority:    'medium' as 'low' | 'medium' | 'high' | 'critical',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tickets.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-2xl">
                {/* Header */}
                <div>
                    <Link href={route('tickets.index')} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Tickets
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight">{pageConfig.title}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{pageConfig.description}</p>
                </div>

                {/* Feature request restriction notice */}
                {!hasActivePlan && (
                    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Feature requests require an active paid plan. You can still submit bug reports.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                <form onSubmit={submit} className="space-y-5">
                    {/* Type */}
                    <div className="space-y-1.5">
                        <Label htmlFor="type">Ticket Type</Label>
                        <Select
                            value={data.type}
                            onValueChange={(v) => setData('type', v as typeof data.type)}
                        >
                            <SelectTrigger id="type" className={errors.type ? 'border-destructive' : ''}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug_report">Bug Report</SelectItem>
                                <SelectItem value="feature_request" disabled={!hasActivePlan}>
                                    Feature Request {!hasActivePlan ? '(requires paid plan)' : ''}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                    </div>

                    {/* Priority */}
                    <div className="space-y-1.5">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                            value={data.priority}
                            onValueChange={(v) => setData('priority', v as typeof data.priority)}
                        >
                            <SelectTrigger id="priority" className={errors.priority ? 'border-destructive' : ''}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.priority && <p className="text-xs text-destructive">{errors.priority}</p>}
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Brief summary of the issue or request"
                            className={errors.title ? 'border-destructive' : ''}
                        />
                        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Describe the issue or feature request in detail..."
                            rows={6}
                            className={errors.description ? 'border-destructive' : ''}
                        />
                        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Submitting...' : 'Submit Ticket'}
                        </Button>
                        <Link href={route('tickets.index')}>
                            <Button type="button" variant="ghost">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
