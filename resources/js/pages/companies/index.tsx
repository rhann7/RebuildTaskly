import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import {  Search, Pencil, Trash2, Phone, MapPin, Building2, Filter, Plus, Fingerprint } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface Category {
    id: number;
    name: string;
}

interface PageProps {
    companies: {
        data: Company[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number;
        to: number;
        total: number;
    };
    categories: Category[];
    filters: { search?: string; category?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Company List', href: '/company-management/companies' },
];

export default function CompanyIndex({ companies, categories, filters }: PageProps) {
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
            alert('Error: Akun user untuk owner ini tidak ditemukan (user_id null).');
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
                    {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    const HeaderActions = (
        <Button asChild>
            <Link href="/company-management/companies/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Company
            </Link>
        </Button>
    );

    return (
        <ResourceListLayout
            title="Manage Companies"
            description="Manage registered companies and their status."
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
                emptyStateIcon: <Building2 className="h-6 w-6 text-muted-foreground/60" />,
                emptyStateTitle: 'No companies found',
                emptyStateDescription: 'Start by adding your first company or adjust your search filters.',
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
                            className="group cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => router.visit(`/company-management/companies/${company.slug}`)}
                        >
                            <TableCell className="text-center text-muted-foreground tabular-nums">
                                {companies.from + i}
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium leading-tight">
                                        {company.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {company.company_owner?.name || 'No Owner'}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <Badge variant="outline" className="font-normal capitalize border-border">
                                    {company.company_category?.name || 'Uncategorized'}
                                </Badge>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="h-3 w-3 opacity-70" /> {company.phone}
                                    </span>
                                    <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                                        <MapPin className="h-3 w-3 opacity-70" /> {company.email}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <Badge
                                    variant={company.is_active ? 'default' : 'destructive'}
                                    className={!company.is_active ? 'bg-red-500/10 text-red-600 border-red-200' : ''}
                                >
                                    {company.is_active ? 'Active' : 'Suspended'}
                                </Badge>
                            </TableCell>

                            <TableCell
                                className="text-right px-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        title="Masuk sebagai company ini"
                                        onClick={(e) => handleImpersonate(e, company)}
                                    >
                                        <Fingerprint className="h-3.5 w-3.5" />
                                    </Button>

                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    >
                                        <Link href={`/company-management/companies/${company.id}/edit`}>
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(company.id);
                                        }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ResourceListLayout>
    );
}