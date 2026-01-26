import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Building2, Search, Plus, Pencil, Trash2, Fingerprint, Phone, MapPin, Eye } from 'lucide-react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Company {
    id: number;
    name: string;
    slug: string;
    email: string;
    phone: string;
    is_active: boolean;
    reason?: string;
    category?: { name: string };
    user?: { name: string; id: number };
}

interface PageProps {
    companies: {
        data: Company[];
        links: any[];
        from: number;
        to: number;
        total: number;
    };
    filters: { search?: string; status?: string };
    pageConfig: any;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Company List', href: '/company-management/companies' },
];

export default function CompanyIndex({ companies, filters, pageConfig }: PageProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const createForm = useForm({
        company_name: '',
        email: '',
        category_id: '',
    });

    const editForm = useForm({
        is_active: false,
        reason: '',
    });

    const handleFilterChange = (search?: string, status?: string) => {
        router.get('/company-management/companies', {
            search: search ?? searchQuery,
            status: status ?? statusFilter
        }, { preserveState: true, replace: true });
    };

    const openEditModal = (company: Company) => {
        setSelectedCompany(company);
        editForm.setData({
            is_active: !!company.is_active,
            reason: company.reason || '',
        });
        setIsEditOpen(true);
    };

    const handleCreateSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        createForm.post('/company-management/companies', {
            onSuccess: () => { 
                setIsCreateOpen(false); 
                createForm.reset(); 
            }
        });
    };

    const handleUpdateStatus: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedCompany) return;
        editForm.put(`/company-management/companies/${selectedCompany.slug}`, {
            onSuccess: () => setIsEditOpen(false)
        });
    };

    const handleDelete = (slug: string) => {
        if (confirm('Delete this company and its associated account permanently?')) {
            router.delete(`/company-management/companies/${slug}`);
        }
    };

    const handleImpersonate = (company: Company) => {
        const userId = company.user?.id;
        if (!userId) return alert('User account not found.');
        if (confirm(`Login as ${company.name}?`)) router.get(`/impersonate/take/${userId}`);
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search name or email..."
                    className="pl-9 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
                />
            </div>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); handleFilterChange(undefined, val); }}>
                <SelectTrigger className="w-[150px] h-9">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="1">Active Only</SelectItem>
                    <SelectItem value="0">Inactive Only</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <>
            <ResourceListLayout
                title={pageConfig.title}
                description={pageConfig.description}
                breadcrumbs={breadcrumbs}
                filterWidget={FilterWidget}
                headerActions={
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Company
                    </Button>
                }
                pagination={companies}
                isEmpty={companies.data.length === 0}
                config={{ 
                    showFilter: true, showPagination: true, showPaginationInfo: true, 
                    showHeaderActions: true, showShadow: true, showBorder: true,
                    emptyStateIcon: <Building2 className="h-6 w-6 text-muted-foreground/60" /> 
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
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
                            <TableRow key={company.id} className="group hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground tabular-nums">
                                    {companies.from + i}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{company.name}</span>
                                        <span className="text-[11px] text-muted-foreground">{company.user?.name || 'No Owner'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-mono text-[10px]">
                                        {company.category?.name || 'Uncategorized'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {company.phone || '-'}</span>
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {company.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={company.is_active ? 'default' : 'destructive'} className="text-[10px] uppercase">
                                        {company.is_active ? 'Active' : 'Suspended'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right px-6 space-x-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => router.get(`/company-management/companies/${company.slug}`)}>
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleImpersonate(company)}>
                                        <Fingerprint className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(company)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(company.slug)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResourceListLayout>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>Register New Company</DialogTitle>
                        <DialogDescription>Input data esensial. Detail lainnya akan dilengkapi oleh pemilik perusahaan.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input id="company_name" placeholder="PT. Nama Perusahaan" value={createForm.data.company_name} onChange={e => createForm.setData('company_name', e.target.value)} />
                            <InputError message={createForm.errors.company_name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Official Email</Label>
                            <Input id="email" type="email" placeholder="company@email.com" value={createForm.data.email} onChange={e => createForm.setData('email', e.target.value)} />
                            <InputError message={createForm.errors.email} />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select onValueChange={val => createForm.setData('category_id', val)}>
                                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                <SelectContent>
                                    {pageConfig.options?.categories?.map((c: any) => (
                                        <SelectItem key={c.value} value={String(c.value)}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={createForm.errors.category_id} />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="submit" className="w-full" disabled={createForm.processing}>Create Company</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Manage Access</DialogTitle>
                        <DialogDescription>Update status aktif untuk <b>{selectedCompany?.name}</b></DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateStatus} className="space-y-6 pt-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-dashed">
                            <div className="space-y-0.5">
                                <Label className="text-base">Account Status</Label>
                                <p className="text-xs text-muted-foreground">
                                    {editForm.data.is_active ? 'Access is granted' : 'Access is blocked'}
                                </p>
                            </div>
                            <Switch 
                                checked={editForm.data.is_active} 
                                onCheckedChange={(val) => {
                                    editForm.setData('is_active', val);
                                    if(val) editForm.setData('reason', '');
                                }} 
                            />
                        </div>

                        {!editForm.data.is_active && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="reason" className="text-destructive font-medium flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                                    Deactivation Reason
                                </Label>
                                <Textarea 
                                    id="reason"
                                    placeholder="Berikan alasan kenapa akun ini dinonaktifkan..."
                                    className="min-h-[100px] resize-none border-destructive/20 focus-visible:ring-destructive"
                                    value={editForm.data.reason}
                                    onChange={e => editForm.setData('reason', e.target.value)}
                                />
                                <InputError message={editForm.errors.reason} />
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button 
                                type="submit" 
                                disabled={editForm.processing}
                                variant={editForm.data.is_active ? 'default' : 'destructive'}
                            >
                                {editForm.processing ? 'Saving...' : (editForm.data.is_active ? 'Save Changes' : 'Suspend Account')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}