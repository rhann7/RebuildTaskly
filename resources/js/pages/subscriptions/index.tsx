import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem, PaginatedData } from '@/types';
import { Search, CreditCard, Clock } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Subscription = {
    id: number;
    company_name: string;
    plan_name: string;
    billing_cycle: string;
    starts_at: string;
    ends_at: string;
    status: string;
    is_expiring: boolean;
    is_free: boolean;
    is_active: boolean;
    remaining_days: number;
};

type PageProps = {
    subscriptions: PaginatedData<Subscription>;
    filters: { search?: string; status?: string; cycle?: string; };
    pageConfig: PageConfig;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Subscription Monitoring', href: route('product-management.subscriptions.index') },
];

export default function SubscriptionIndex({ subscriptions, filters, pageConfig }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleFilterChange = (key: string, value: string) => {
        const params: any = {
            search: searchQuery,
            status: filters.status,
            cycle: filters.cycle,
            [key]: value
        };

        Object.keys(params).forEach(k => {
            if (params[k] === 'all' || !params[k]) delete params[k];
        });

        router.get(route('product-management.subscriptions.index'), params, { 
            preserveState: true, 
            replace: true 
        });
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search companies or plans..."
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
                </SelectContent>
            </Select>

            <Select value={filters.cycle || 'all'} onValueChange={(val) => handleFilterChange('cycle', val)}>
                <SelectTrigger className="w-[130px] h-9 bg-background"><SelectValue placeholder="Cycle" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Cycle</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
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
        config={{ 
            showFilter: true, showPagination: true, showPaginationInfo: true, 
            showHeaderActions: false, showShadow: true, showBorder: true, 
            emptyStateIcon: <CreditCard className="h-6 w-6 text-muted-foreground/60" /> 
        }}
    >
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                    <TableHead className="w-[50px] text-center">#</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {subscriptions.data.map((sub, i) => (
                    <TableRow key={sub.id} className="group hover:bg-muted/30">
                        <TableCell className="text-center text-muted-foreground tabular-nums">
                            {subscriptions.from + i}
                        </TableCell>
                        
                        <TableCell>
                            <div className="flex items-center gap-2 font-medium text-foreground">
                                {sub.company_name}
                            </div>
                        </TableCell>

                        <TableCell>
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm">{sub.plan_name}</span>
                                {sub.is_free && (
                                    <span className="text-[9px] bg-zinc-100 px-1 rounded uppercase font-bold text-zinc-500">Free</span>
                                )}
                            </div>
                        </TableCell>

                        <TableCell>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-medium capitalize flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-zinc-400" /> {sub.billing_cycle}
                                </span>
                            </div>
                        </TableCell>

                        <TableCell>
                            <div className="flex flex-col text-xs">
                                <span className="text-muted-foreground">{sub.starts_at} — {sub.ends_at}</span>
                                {sub.is_active && (
                                    <span className={`text-[10px] mt-0.5 font-bold uppercase ${sub.is_expiring ? 'text-amber-500' : 'text-zinc-400'}`}>
                                        {sub.remaining_days} days left
                                    </span>
                                )}
                            </div>
                        </TableCell>

                        <TableCell>
                            <div className="flex flex-col gap-1 items-start">
                                {sub.is_active ? (
                                    <span className="text-sm font-medium">
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-sm font-bold text-red-700">
                                        EXPIRED
                                    </span>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </ResourceListLayout>
);
}