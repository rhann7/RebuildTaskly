import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem, PaginatedData } from '@/types';
import { Search, Eye } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Subscription = {
    id: number;
    plan_name: string;
    status: 'active' | 'expired' | 'overridden';
    starts_at: string;
    ends_at: string;
    is_valid: boolean;
    company: { id: number; name: string } | null;
    plan: { id: number; name: string } | null;
    invoice: { id: number; number: string } | null;
};

type PageProps = {
    subscriptions: PaginatedData<Subscription>;
    filters: { search?: string; status?: string; };
    pageConfig: PageConfig;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Subscription Management', href: route('product-management.subscriptions.index') },
];

const StatusBadge = ({ status }: { status: Subscription['status'] }) => {
    if (status === 'active') return (
        <span className="inline-flex items-center gap-1 rounded-md bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
    );
    if (status === 'expired') return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-700">Expired</span>
    );
    return (
        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-50 border border-dashed border-zinc-300 px-2 py-0.5 text-xs text-zinc-500">Overridden</span>
    );
};

export default function SubscriptionIndex({ subscriptions, filters, pageConfig }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleFilterChange = (key: string, value: string) => {
        const params: any = { ...filters, search: searchQuery, [key]: value };
        Object.keys(params).forEach(k => { if (params[k] === 'all' || !params[k]) delete params[k]; });

        router.get(route('product-management.subscriptions.index'), params, {
            preserveState: true, replace: true
        });
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search company..."
                    className="pl-9 bg-background h-9 border-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', searchQuery)}
                />
            </div>

            <Select value={filters.status || 'all'} onValueChange={(val) => handleFilterChange('status', val)}>
                <SelectTrigger className="w-[130px] h-9 bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="overridden">Overridden</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <ResourceListLayout
            title={pageConfig.title}
            description={pageConfig.description}
            breadcrumbs={breadcrumbs}
            filterWidget={FilterWidget}
            pagination={subscriptions}
            isEmpty={subscriptions.data.length === 0}
        >
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableHead className="w-[50px] text-center">#</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right px-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {subscriptions.data.map((subscription, i) => (
                        <TableRow key={subscription.id} className="group hover:bg-muted/30">
                            <TableCell className="text-center text-muted-foreground tabular-nums">{subscriptions.from + i}</TableCell>
                            <TableCell>
                                <span className="font-medium text-foreground">{subscription.company?.name ?? '-'}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm">{subscription.plan_name}</span>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(subscription.starts_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(subscription.ends_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="font-mono text-xs text-muted-foreground">
                                    {subscription.invoice?.number ?? '-'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={subscription.status} />
                            </TableCell>
                            <TableCell className="text-right px-6">
                                <Link href={route('product-management.subscriptions.show', { subscription: subscription.id })}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Detail">
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ResourceListLayout>
    );
}