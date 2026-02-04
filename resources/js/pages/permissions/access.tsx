import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { ShieldCheck, Star, Zap, Search, Plus, X, Filter, Shield, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Permission = { 
    id: number; 
    name: string; 
    type: string; 
    scope: string;
};

type Company = { 
    id: number; 
    name: string; 
    permissions?: Permission[]; 
};

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
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [isGranting, setIsGranting] = useState(false);
    const [selectedGrantPermissionId, setSelectedGrantPermissionId] = useState<string>('');
    const [isSyncing, setIsSyncing] = useState(false);

    const { data, setData } = useForm({
        permissions: [] as number[],
    });

    const openManageModal = (company: Company) => { 
        setSelectedCompany(company); 
        setData('permissions', company.permissions?.map(p => p.id) || []);
        setIsGranting(false); 
        setSelectedGrantPermissionId(''); 
        setIsOpen(true); 
    };

    const handleSyncToBackend = (newPermissions: number[]) => {
        if (!selectedCompany) return;

        setIsSyncing(true);
        router.post(`/access-control/company-access/${selectedCompany.id}`, {
            permissions: newPermissions
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                const updatedList = (page.props.companies as any).data as Company[];
                const updated = updatedList.find(c => c.id === selectedCompany.id);
                if (updated) setSelectedCompany(updated);
            },
            onFinish: () => setIsSyncing(false)
        });
    };

    const handleToggle = (permissionId: number, isEnabled: boolean) => {
        let newPermissions = [...data.permissions];
        if (isEnabled) {
            newPermissions.push(permissionId);
        } else {
            newPermissions = newPermissions.filter(id => id !== permissionId);
        }

        setData('permissions', newPermissions);
        handleSyncToBackend(newPermissions);
    };

    const handleGrantAccess = () => {
        if (!selectedGrantPermissionId) return;
        
        const pId = parseInt(selectedGrantPermissionId);
        const newPermissions = [...data.permissions, pId];

        setData('permissions', newPermissions);
        handleSyncToBackend(newPermissions);
        setIsGranting(false);
        setSelectedGrantPermissionId('');
    };

    const assignablePermissions = uniquePermissions.filter(
        avail => !data.permissions.includes(avail.id)
    );

    const handleSearch = () => {
        router.get('/access-control/company-access', { search: searchQuery, type: typeFilter }, { preserveState: true, replace: true });
    };

    const handleTypeChange = (val: string) => {
        setTypeFilter(val);
        router.get('/access-control/company-access', { search: searchQuery, type: val }, { preserveState: true, replace: true });
    };

    const PermissionItem = ({ permission, isUnique = false }: { permission: Permission; isUnique?: boolean }) => {
        const isEnabled = data.permissions.includes(permission.id);
        const scopeBadgeColor = permission.scope === 'workspace' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-amber-50 text-amber-700 border-amber-200';

        return (
            <div className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                isUnique ? 'bg-purple-50/50 border-purple-100' : 'bg-muted/30 border-border'
            }`}>
                <div className="flex flex-col gap-1">
                    <span className="font-medium">{permission.name}</span>
                    <span className={`text-[9px] font-bold uppercase w-fit px-1.5 rounded border shadow-sm ${scopeBadgeColor}`}>
                        {permission.scope}
                    </span>
                </div>

                <Switch
                    checked={isEnabled}
                    disabled={isSyncing}
                    onCheckedChange={(checked) => handleToggle(permission.id, checked)}
                    className={isUnique ? 'data-[state=checked]:bg-purple-600' : ''}
                />
            </div>
        );
    };

    return (
        <>
            <ResourceListLayout
                title="Company Access Distribution"
                description="Manage permissions (General & Unique) for each registered company."
                breadcrumbs={breadcrumbs}
                filterWidget={
                    <div className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search companies..."
                                className="pl-9 h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-[200px] h-9">
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
                }
                pagination={companies}
                isEmpty={companies.data.length === 0}
                config={{
                    showFilter: true,
                    showPagination: true,
                    showHeaderActions: false,
                    showShadow: true,
                    showBorder: true,
                    emptyStateIcon: <Shield className="h-6 w-6 text-muted-foreground/60" />,
                    emptyStateTitle: 'No companies found',
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center font-bold">#</TableHead>
                            <TableHead className="font-bold">Company</TableHead>
                            <TableHead className="font-bold text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.data.map((company, index) => (
                            <TableRow key={company.id}>
                                <TableCell className="text-center">{(companies.from || 1) + index}</TableCell>
                                <TableCell className="font-semibold">{company.name}</TableCell>
                                <TableCell className="text-right px-6">
                                    <Button variant="outline" size="sm" onClick={() => openManageModal(company)}>
                                        Manage Access
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResourceListLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5 text-primary" />} 
                            Manage Access
                        </DialogTitle>
                        <DialogDescription>Configure capabilities for {selectedCompany?.name}.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-2 space-y-6">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-2 flex items-center gap-2">
                                <Zap className="h-3 w-3 fill-zinc-400" /> General Permissions
                            </h4>
                            <div className="grid gap-2">
                                {generalPermissions.map(p => <PermissionItem key={p.id} permission={p} />)}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-600 flex items-center gap-2">
                                    <Star className="h-3 w-3 fill-purple-400" /> Unique Permissions
                                </h4>
                                {!isGranting && (
                                    <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold" onClick={() => setIsGranting(true)}>
                                        <Plus className="mr-1 h-3 w-3" /> Grant Access
                                    </Button>
                                )}
                            </div>

                            {isGranting && (
                                <div className="rounded-md bg-purple-50/50 p-3 border border-purple-100 flex gap-2 animate-in fade-in zoom-in-95 duration-200">
                                    <Select value={selectedGrantPermissionId} onValueChange={setSelectedGrantPermissionId}>
                                        <SelectTrigger className="h-9 w-full bg-background text-xs">
                                            <SelectValue placeholder="Select feature..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assignablePermissions.length > 0 ? (
                                                assignablePermissions.map(perm => (
                                                    <SelectItem key={perm.id} value={perm.id.toString()}>{perm.name}</SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-xs text-center text-muted-foreground">No more features available</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <Button size="sm" onClick={handleGrantAccess} disabled={!selectedGrantPermissionId || isSyncing}>Add</Button>
                                    <Button size="icon" variant="ghost" onClick={() => setIsGranting(false)} className="h-9 w-9"><X className="h-4 w-4" /></Button>
                                </div>
                            )}

                            <div className="grid gap-2">
                                {uniquePermissions.filter(p => data.permissions.includes(p.id)).map(p => (
                                    <PermissionItem key={p.id} permission={p} isUnique={true} />
                                ))}
                                {uniquePermissions.filter(p => data.permissions.includes(p.id)).length === 0 && !isGranting && (
                                    <div className="text-center py-4 border border-dashed rounded-md text-xs text-muted-foreground">
                                        No unique permissions granted.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}