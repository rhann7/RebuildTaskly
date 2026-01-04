import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { ShieldCheck, Star, Zap, Search, Plus, X, Filter, Shield } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Permission = { id: number; name: string; type: string; };
type Company = { id: number; name: string; permissions?: Permission[]; };

type PageProps = {
    companies: {
        data: Company[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number;
        to: number;
        total: number;
    };
    generalPermissions: Permission[]; 
    uniquePermissions: Permission[]; 
    filters?: { search?: string; type?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Company Access', href: '/access-control/company-access' },
];

export default function CompanyAccess({ companies, generalPermissions = [], uniquePermissions = [], filters = {} }: PageProps) {
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [isGranting, setIsGranting] = useState(false);
    const [selectedGrantPermission, setSelectedGrantPermission] = useState<string>('');

    const activeUniquePermissions = selectedCompany?.permissions?.filter(p => p.type !== 'general') || [];
    const assignablePermissions = uniquePermissions.filter(
        avail => !selectedCompany?.permissions?.some(owned => owned.name === avail.name)
    );

    const openManageModal = (company: Company) => { 
        setSelectedCompany(company); 
        setIsGranting(false); 
        setSelectedGrantPermission(''); 
        setIsOpen(true); 
    };

    const submitUpdate = (permissionName: string, isEnabled: boolean) => {
        if (!selectedCompany) return;
        router.post(`/access-control/company-access/${selectedCompany.id}`, 
            { permission_name: permissionName, enabled: isEnabled }, 
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
                onSuccess: (page) => {
                    const updatedCompanyList = (page.props.companies as any).data as Company[];
                    const updatedCompany = updatedCompanyList.find(c => c.id === selectedCompany.id);
                    if (updatedCompany) setSelectedCompany(updatedCompany);
                }
            }
        );
    }

    const handleToggle = (permissionName: string, isEnabled: boolean) => {
        if (!selectedCompany) return;
        setProcessingId(permissionName);
        submitUpdate(permissionName, isEnabled);
    };

    const handleGrantAccess = () => {
        if (!selectedCompany || !selectedGrantPermission) return;
        setProcessingId('grant-action'); 
        submitUpdate(selectedGrantPermission, true);
        setIsGranting(false); 
        setSelectedGrantPermission('');
    };

    const handleSearch = () => {
        router.get('/access-control/company-access', { search: searchQuery, type: typeFilter }, { preserveState: true, replace: true });
    };

    const handleTypeChange = (val: string) => {
        setTypeFilter(val);
        router.get('/access-control/company-access', { search: searchQuery, type: val }, { preserveState: true, replace: true });
    };

    const hasPermission = (company: Company, permissionName: string): boolean => {
        return company.permissions?.some((p) => p.name === permissionName) ?? false;
    };

    const PermissionItem = ({ permission, isUnique = false }: { permission: Permission; isUnique?: boolean }) => {
        const isEnabled = selectedCompany ? hasPermission(selectedCompany, permission.name) : false;
        const isLoading = processingId === permission.name;

        return (
            <div
                className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                    isUnique
                        ? 'bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/30'
                        : 'bg-muted/30 border-border'
                }`}
            >
                <span className={`font-medium ${isLoading ? 'opacity-50' : ''}`}>
                    {permission.name}
                </span>

                <Switch
                    checked={isEnabled}
                    disabled={isLoading}
                    onCheckedChange={(checked) => handleToggle(permission.name, checked)}
                    className={isUnique ? 'data-[state=checked]:bg-purple-600' : ''}
                />
            </div>
        );
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

            <Select value={typeFilter} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[200px] h-9 bg-background">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Permission Type" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    <SelectItem value="unique">Has Unique Access</SelectItem>
                    <SelectItem value="general">General Only</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <>
            <ResourceListLayout
                title="Company Access Distribution"
                description="Manage permissions (General & Unique) for each registered company."
                breadcrumbs={breadcrumbs}
                filterWidget={FilterWidget}
                pagination={companies}
                isEmpty={companies.data.length === 0}
                config={{
                    showFilter: true,
                    showPagination: true,
                    showPaginationInfo: true,
                    showHeaderActions: false,
                    showShadow: true,
                    showBorder: true,
                    emptyStateIcon: <Shield className="h-6 w-6 text-muted-foreground/60" />,
                    emptyStateTitle: 'No companies found',
                    emptyStateDescription: 'Register companies to manage their access permissions.',
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Active Permissions</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {companies.data.map((company, index) => (
                            <TableRow key={company.id} className="group hover:bg-muted/30 transition-colors">
                                <TableCell className="text-center text-muted-foreground tabular-nums">
                                    {(companies.from || 1) + index}
                                </TableCell>

                                <TableCell>
                                    <span className="font-medium text-foreground">
                                        {company.name}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <span className="inline-flex rounded bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground border">
                                        {(company.permissions?.length ?? 0)} Active
                                    </span>
                                </TableCell>

                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs text-muted-foreground border hover:text-foreground hover:bg-muted"
                                            onClick={() => openManageModal(company)}
                                        >
                                            Manage Access
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResourceListLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Manage Access</DialogTitle>
                        <DialogDescription>Configure capabilities for <span className="font-semibold text-foreground">{selectedCompany?.name}</span>.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-2 space-y-6">
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b pb-2">
                                <Zap className="h-3 w-3" /> General (Basic)
                            </h4>
                            <div className="space-y-2">
                                {generalPermissions.length > 0 ? (
                                    generalPermissions.map(p => <PermissionItem key={p.id} permission={p} />)
                                ) : (
                                    <p className="text-xs text-muted-foreground italic pl-2">No General permissions defined.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-600/80 dark:text-purple-400 flex items-center gap-2">
                                    <Star className="h-3 w-3" /> Unique (Exclusive)
                                </h4>
                                {!isGranting && (
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-purple-600 hover:text-purple-700 hover:bg-purple-50" onClick={() => setIsGranting(true)}>
                                        <Plus className="mr-1 h-3 w-3" /> Grant Access
                                    </Button>
                                )}
                            </div>

                            {isGranting && (
                                <div className="rounded-md bg-purple-50/50 p-3 border border-purple-100 animate-in fade-in slide-in-from-top-1">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            {assignablePermissions.length > 0 ? (
                                                <Select value={selectedGrantPermission} onValueChange={setSelectedGrantPermission}>
                                                    <SelectTrigger className="h-9 w-full bg-background border border-input">
                                                        <SelectValue placeholder="Select a permission..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {assignablePermissions.map(perm => (
                                                            <SelectItem key={perm.id} value={perm.name}>{perm.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="text-xs text-muted-foreground h-9 flex items-center px-2 italic">No more unique permissions available.</div>
                                            )}
                                        </div>
                                        <Button size="sm" className="h-9 bg-purple-600 hover:bg-purple-700 text-white" disabled={!selectedGrantPermission || processingId === 'grant-action'} onClick={handleGrantAccess}>Add</Button>
                                        <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setIsGranting(false)}><X className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {activeUniquePermissions.length > 0 ? (
                                    activeUniquePermissions.map(p => <PermissionItem key={p.id} permission={p} isUnique={true} />)
                                ) : (
                                    !isGranting && <p className="text-xs text-muted-foreground italic pl-2">No exclusive access granted yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}