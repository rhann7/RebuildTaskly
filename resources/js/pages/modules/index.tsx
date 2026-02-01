import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { PageConfig, type BreadcrumbItem, PaginatedData, SelectOption } from '@/types';
import { Plus, Trash2, Pencil, Search, Box, Zap, Settings2 } from 'lucide-react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type Module = {
    id: number;
    name: string;
    slug: string;
    ui: {
        type_label: string;
        type_color: string;
        type_icon: string;
        status_label: string;
        status_color: string;
        price_fmt: string;
        permissions_count: number;
    };
    form_default: {
        name: string;
        type: string;
        description: string;
        is_active: boolean;
    };
};

type PageProps = {
    modules: PaginatedData<Module>;
    filters: { search?: string; type?: string; };
    pageConfig: PageConfig; 
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Modules', href: route('product-management.modules.index') },
];

export default function ModuleIndex({ modules, filters, pageConfig }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'standard',
        description: '',
        is_active: true,
    });

    const handleFilterChange = (newSearch?: string, newType?: string) => {
        const params: any = {
            search: newSearch ?? searchQuery,
            type: newType ?? filters.type,
        };

        if (params.type === 'all') delete params.type;
        if (!params.search) delete params.search;

        router.get(route('product-management.modules.index'), params, { 
            preserveState: true, 
            replace: true 
        });
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentId(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const openEditModal = (m: Module) => {
        setIsEditing(true);
        setCurrentId(m.id);
        setData(m.form_default);
        clearErrors();
        setIsOpen(true);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        };

        if (isEditing && currentId) {
            put(route('product-management.modules.update', { module: currentId }), options);
        } else {
            post(route('product-management.modules.store'), options);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus modul ini? Permissions di dalamnya akan menjadi "homeless".')) {
            router.delete(route('product-management.modules.destroy', { module: id }));
        }
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Cari modul..."
                    className="pl-9 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
                />
            </div>
            <Select value={filters.type || 'all'} onValueChange={(val) => handleFilterChange(undefined, val)}>
                <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    {pageConfig.options?.types.map((opt: SelectOption) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                    ))}
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
                headerActions={<Button onClick={openCreateModal}><Plus className="h-4 w-4 mr-2" />Tambah Modul</Button>}
                pagination={modules}
                isEmpty={modules.data.length === 0}
                config={{ showFilter: true, showPagination: true, showPaginationInfo: true, showHeaderActions: true, showShadow: true, showBorder: true, emptyStateIcon: <Box className="h-6 w-6 text-muted-foreground/60" /> }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Nama Modul</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead>Harga (Disc 5%)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right px-6">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {modules.data.map((module, i) => (
                            <TableRow key={module.id} className="group hover:bg-muted/30">
                                <TableCell className="text-center text-muted-foreground tabular-nums">
                                    {modules.from + i}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{module.name}</span>
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{module.slug}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium ${module.ui.type_color}`}>
                                        {module.ui.type_icon === 'Zap' ? <Zap className="h-3 w-3" /> : <Box className="h-3 w-3" />}
                                        {module.ui.type_label}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-sm">{module.ui.price_fmt}</TableCell>
                                <TableCell>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${module.ui.status_color}`}>
                                        {module.ui.status_label}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right px-6 space-x-1">
                                    <Link href={route('product-management.modules.show', { module: module.slug })}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title="Kelola Permissions">
                                            <Settings2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(module)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(module.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResourceListLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Modul' : 'Buat Modul Baru'}</DialogTitle>
                        <DialogDescription>Nama modul akan otomatis dikonversi menjadi slug.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="name">Nama Modul</Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Contoh: Inventory Pro" />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipe</Label>
                                <Select value={data.type} onValueChange={(val: any) => setData('type', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="addon">Add-on</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} className="min-h-[80px]" placeholder="Penjelasan singkat fitur utama..." />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-md border border-zinc-200">
                            <div className="space-y-0.5">
                                <Label>Status Modul</Label>
                                <p className="text-[11px] text-muted-foreground">Aktifkan agar bisa dipilih di paket langganan.</p>
                            </div>
                            <Switch checked={data.is_active} onCheckedChange={val => setData('is_active', val)} />
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>
                                {isEditing ? 'Simpan Perubahan' : 'Simpan Modul'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}