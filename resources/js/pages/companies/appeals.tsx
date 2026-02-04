import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, Head, router } from '@inertiajs/react';
import { MessageSquare, Search, CheckCircle, XCircle, Mail, ExternalLink, AlertCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Appeal {
    id: number;
    company_id: number;
    email: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    reason?: string;
    created_at: string;
    company: {
        name: string;
        slug: string;
    };
}

interface PageProps {
    appeals: {
        data: Appeal[];
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
    { title: 'Company Appeals', href: '/company-management/appeals' },
];

export default function AppealIndex({ appeals, filters, pageConfig }: PageProps) {
    const [isActionOpen, setIsActionOpen] = useState(false);
    const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const actionForm = useForm({
        status: '',
        reason: '',
    });

    const handleFilterChange = (search?: string, status?: string) => {
        router.get('/company-management/appeals', {
            search: search ?? searchQuery,
            status: status ?? statusFilter
        }, { preserveState: true, replace: true });
    };

    const openActionModal = (appeal: Appeal, status: 'approved' | 'rejected') => {
        setSelectedAppeal(appeal);
        actionForm.setData({
            status: status,
            reason: '',
        });
        setIsActionOpen(true);
    };

    const handleActionSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedAppeal) return;
        
        actionForm.put(`/company-management/appeals/${selectedAppeal.id}`, {
            onSuccess: () => {
                setIsActionOpen(false);
                actionForm.reset();
            }
        });
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search company or email..."
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
                    <SelectItem value="all">All Appeals</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <>
            <Head title="Banding Perusahaan" />
            <ResourceListLayout
                title={pageConfig.title || "Company Appeals"}
                description={pageConfig.description || "Review and process account reactivation requests."}
                breadcrumbs={breadcrumbs}
                filterWidget={FilterWidget}
                pagination={appeals}
                isEmpty={appeals.data.length === 0}
                config={{ 
                    showFilter: true, 
                    showPagination: true, 
                    showPaginationInfo: true, 
                    showHeaderActions: false,
                    showShadow: true, 
                    showBorder: true,
                    emptyStateIcon: <MessageSquare className="h-6 w-6 text-muted-foreground/60" /> 
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead className="w-[250px]">Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[250px]">Reason</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appeals.data.map((appeal, i) => (
                            <TableRow key={appeal.id} className="group hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground tabular-nums">
                                    {appeals.from + i}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{appeal.company.name}</span>
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                                            <Mail className="h-3 w-3" /> {appeal.email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                                        "{appeal.message}"
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={
                                            appeal.status === 'approved' ? 'default' : 
                                            appeal.status === 'rejected' ? 'destructive' : 'outline'
                                        } 
                                        className="text-[10px] uppercase font-bold"
                                    >
                                        {appeal.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                                        "{appeal.reason}"
                                    </p>
                                </TableCell>
                                <TableCell className="text-[11px] text-muted-foreground">
                                    {new Date(appeal.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell className="text-right px-6 space-x-1">
                                    {appeal.status === 'pending' ? (
                                        <>
                                            <Button 
                                                variant="ghost" size="icon" 
                                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                onClick={() => openActionModal(appeal, 'approved')}
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" size="icon" 
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={() => openActionModal(appeal, 'rejected')}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button 
                                            variant="ghost" size="icon" 
                                            className="h-8 w-8"
                                            onClick={() => router.get(`/company-management/companies/${appeal.company.slug}`)}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResourceListLayout>

            <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {actionForm.data.status === 'approved' ? (
                                <><CheckCircle className="h-5 w-5 text-emerald-500" /> Approve Appeal</>
                            ) : (
                                <><XCircle className="h-5 w-5 text-destructive" /> Reject Appeal</>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Tinjau pesan banding dari <b>{selectedAppeal?.company.name}</b> sebelum mengambil keputusan.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleActionSubmit} className="space-y-5 pt-4">
                        <div className="p-4 bg-muted/50 rounded-lg border border-dashed space-y-2">
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">User Message</Label>
                            <p className="text-sm italic leading-relaxed">"{selectedAppeal?.message}"</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason" className="flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Admin Response / Note
                            </Label>
                            <Textarea 
                                id="reason"
                                placeholder={
                                    actionForm.data.status === 'approved' 
                                    ? "Contoh: Banding diterima, akun Anda telah diaktifkan kembali." 
                                    : "Contoh: Mohon lampirkan bukti identitas yang lebih jelas."
                                }
                                className="min-h-[120px] resize-none"
                                value={actionForm.data.reason}
                                onChange={e => actionForm.setData('reason', e.target.value)}
                                required={actionForm.data.status === 'rejected'}
                            />
                            <InputError message={actionForm.errors.reason} />
                        </div>

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsActionOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={actionForm.processing}
                                variant={actionForm.data.status === 'rejected' ? 'destructive' : 'default'}
                                className={actionForm.data.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                            >
                                {actionForm.processing ? 'Processing...' : `Confirm ${actionForm.data.status}`}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}