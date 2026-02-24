import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem, PaginatedData } from '@/types';
import { Search, Eye } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';

type Invoice = {
    id: number;
    number: string;
    plan_name: string;
    amount: number;
    formatted_amount: string;
    plan_duration: number;
    status: 'unpaid' | 'paid' | 'expired' | 'canceled';
    due_date: string;
    paid_at: string | null;
    is_payable: boolean;
    company: { id: number; name: string } | null;
    plan: { id: number; name: string } | null;
};

type PageProps = {
    invoices: PaginatedData<Invoice>;
    filters: { search?: string; status?: string };
    pageConfig: PageConfig;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Product Management', href: '#' },
    { title: 'Invoices', href: route('invoices.index') },
];

const StatusBadge = ({ status }: { status: Invoice['status'] }) => {
    if (status === 'paid') return (
        <span className="inline-flex items-center rounded-md bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">Paid</span>
    );
    if (status === 'unpaid') return (
        <span className="inline-flex items-center rounded-md bg-yellow-50 border border-yellow-200 px-2 py-0.5 text-xs font-medium text-yellow-700">Unpaid</span>
    );
    if (status === 'expired') return (
        <span className="inline-flex items-center rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-700">Expired</span>
    );
    return (
        <span className="inline-flex items-center rounded-md bg-zinc-50 border border-dashed border-zinc-300 px-2 py-0.5 text-xs text-zinc-500">Canceled</span>
    );
};

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export default function InvoiceIndex({ invoices, filters, pageConfig }: PageProps) {
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth?.user?.roles?.includes('super-admin');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleFilterChange = (key: string, value: string) => {
        const params: any = { ...filters, search: searchQuery, [key]: value };
        Object.keys(params).forEach(k => { if (params[k] === 'all' || !params[k]) delete params[k]; });
        router.get(route('invoices.index'), params, { preserveState: true, replace: true });
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search invoice number..."
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
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    if (!isSuperAdmin) {
        return (
            <ResourceListLayout
                title={pageConfig.title}
                description={pageConfig.description}
                breadcrumbs={[
                    { title: 'Dashboard', href: route('dashboard') },
                    { title: 'Invoices', href: route('invoices.index') },
                ]}
                filterWidget={FilterWidget}
                pagination={invoices}
                isEmpty={invoices.data.length === 0}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Invoice Number</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {invoices.data.map((invoice, i) => (
                            <TableRow key={invoice.id} className="group hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground tabular-nums">{invoices.from + i}</TableCell>
                                <TableCell>
                                    <span className="font-mono text-xs font-medium">{invoice.number}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{invoice.plan_name}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-sm font-semibold">{invoice.formatted_amount}</span>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={invoice.status} />
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs text-muted-foreground">{formatDate(invoice.due_date)}</span>
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <Link href={route('invoices.show', { invoice: invoice.id })}>
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

    return (
        <ResourceListLayout
            title={pageConfig.title}
            description={pageConfig.description}
            breadcrumbs={breadcrumbs}
            filterWidget={FilterWidget}
            pagination={invoices}
            isEmpty={invoices.data.length === 0}
        >
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableHead className="w-[50px] text-center">#</TableHead>
                        <TableHead>Invoice Number</TableHead>
                        {isSuperAdmin && <TableHead>Company</TableHead>}
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right px-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {invoices.data.map((invoice, i) => (
                        <TableRow key={invoice.id} className="group hover:bg-muted/30">
                            <TableCell className="text-center text-muted-foreground tabular-nums">{invoices.from + i}</TableCell>
                            <TableCell>
                                <span className="font-mono text-xs font-medium">{invoice.number}</span>
                            </TableCell>
                            {isSuperAdmin && (
                                <TableCell>
                                    <span className="text-sm">{invoice.company?.name ?? '-'}</span>
                                </TableCell>
                            )}
                            <TableCell>
                                <span className="text-sm">{invoice.plan_name}</span>
                            </TableCell>
                            <TableCell>
                                <span className="font-mono text-sm font-semibold">{invoice.formatted_amount}</span>
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={invoice.status} />
                            </TableCell>
                            <TableCell>
                                <span className="text-xs text-muted-foreground">{formatDate(invoice.due_date)}</span>
                            </TableCell>
                            <TableCell className="text-right px-6">
                                <Link href={route('invoices.show', { invoice: invoice.id })}>
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