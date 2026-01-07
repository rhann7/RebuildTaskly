import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { type BreadcrumbItem, PageConfig } from '@/types';
import { Building2, Fingerprint, Filter, MapPin, Pencil, Phone, Plus, Search, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Company {
    id: number;
    name: string;
    slug: string;
    email: string;
    phone: string;
    is_active: boolean;
    company_category?: { name: string };
    company_owner?: { 
        name: string; 
        user_id: number;
    };
}

interface PageProps {
    companies: {
        data: Company[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number;
        to: number;
        total: number;
    };
    filters: { search?: string; category?: string };
    pageConfig: PageConfig;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Company List', href: '/company-management/companies' },
];

export default function CompanyIndex({ companies, filters, pageConfig }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');

    const handleSearch = () => {
        router.get(
            '/company-management/companies', 
            { search: searchQuery, category: categoryFilter }, 
            { preserveState: true, replace: true }
        );
    };

    const handleCategoryChange = (value: string) => {
        setCategoryFilter(value);
        router.get(
            '/company-management/companies', 
            { search: searchQuery, category: value }, 
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this company?')) {
            router.delete(`/company-management/companies/${id}`);
        }
    };

    const handleImpersonate = (e: React.MouseEvent, company: Company) => {
        e.stopPropagation();
        const targetUserId = company.company_owner?.user_id;

        if (!targetUserId) {
            alert('Error: Akun user untuk owner ini tidak ditemukan.');
            return;
        }

        if (confirm(`Masuk ke sistem sebagai ${company.name}?`)) {
            router.get(`/impersonate/take/${targetUserId}`);
        }
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search companies..."
                    className="pl-9 bg-background h-9 border-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>

            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[200px] h-9 bg-background">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="All Categories" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {pageConfig.options.categories.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    const HeaderActions = pageConfig.can_manage && (
        <Button asChild>
            <Link href="/company-management/companies/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Company
            </Link>
        </Button>
    );

    return (
        <ResourceListLayout
            title={pageConfig.title}
            description={pageConfig.description}
            breadcrumbs={breadcrumbs}
            filterWidget={FilterWidget}
            headerActions={HeaderActions}
            pagination={companies}
            isEmpty={companies.data.length === 0}
            config={{ 
                showFilter: true, 
                showPagination: true, 
                showPaginationInfo: true, 
                showHeaderActions: true, 
                showShadow: true, 
                showBorder: true, 
                emptyStateIcon: <Building2 className="h-6 w-6 text-muted-foreground/60" /> 
            }}
        >
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableHead className="w-[50px] text-center">#</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right px-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {companies.data.map((company, i) => (
                        <TableRow 
                            key={company.id} 
                            className="group hover:bg-muted/30 cursor-pointer"
                            onClick={() => router.visit(`/company-management/companies/${company.slug}`)}
                        >
                            <TableCell className="text-center text-muted-foreground tabular-nums">
                                {companies.from + i}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground leading-none">{company.name}</span>
                                    <span className="text-[11px] text-muted-foreground mt-1.5">{company.company_owner?.name || 'No Owner'}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="capitalize text-xs font-mono bg-muted/50 px-2 py-0.5 rounded border">
                                    {company.company_category?.name || 'Uncategorized'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {company.phone}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {company.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge 
                                    variant={company.is_active ? 'default' : 'destructive'}
                                    className={`text-[10px] uppercase tracking-wider font-bold ${!company.is_active ? 'bg-red-500/10 text-red-600 border-red-200' : ''}`}
                                >
                                    {company.is_active ? 'Active' : 'Suspended'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right px-6 space-x-1" onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={(e) => handleImpersonate(e, company)}>
                                    <Fingerprint className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                    <Link href={`/company-management/companies/${company.id}/edit`}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(company.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ResourceListLayout>
    );
}