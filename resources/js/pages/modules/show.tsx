import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState } from 'react';
import { type BreadcrumbItem, type PageConfig } from '@/types';
import { useForm, router } from '@inertiajs/react';
import { ChevronLeft, Plus, Trash2, ShieldCheck, Box, Info, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

const MODULE_UI_CONFIG = {
    standard: {
        label: 'Standard',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Box
    },
    addon: {
        label: 'Add-on',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Zap
    }
} as const;

interface Permission {
    id: number;
    name: string;
    type: string;
    price_fmt: string;
}

interface ModuleData {
    id: number;
    name: string;
    slug: string;
    type: 'standard' | 'addon';
    is_active: boolean;
    price_fmt: string;
    permissions_count: number;
    permissions: Permission[];
}

interface PageProps {
    module: ModuleData;
    homeless_permissions: { id: number; name: string }[];
    pageConfig: PageConfig;
}

export default function ModuleShow({ module, homeless_permissions, pageConfig }: PageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const ui = MODULE_UI_CONFIG[module.type];
    const ModuleIcon = ui.icon;

    const { data, setData, post, processing, reset } = useForm({
        permissions: [] as number[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Modules', href: route('product-management.modules.index') },
        { title: module.name, href: '#' },
    ];

    const togglePermission = (id: number) => {
        const current = data.permissions.includes(id)
            ? data.permissions.filter(pId => pId !== id)
            : [...data.permissions, id];
        setData('permissions', current);
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('product-management.modules.permissions.assign', { module: module.id }), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const handleRemove = (permissionId: number) => {
        if (confirm('Lepas fitur ini dari modul? Harga modul akan dikalkulasi ulang.')) {
            router.delete(route('product-management.modules.permissions.remove', { permission: permissionId }));
        }
    };

    return (
        <ResourceListLayout
            title={pageConfig.title}
            description={pageConfig.description}
            breadcrumbs={breadcrumbs}
            headerActions={
                <Button variant="outline" size="sm" onClick={() => router.get(route('product-management.modules.index'))}>
                    <ChevronLeft className="h-4 w-4 mr-2" /> Kembali
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 h-fit border-zinc-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ModuleIcon className="h-5 w-5 text-blue-600" /> Informasi Modul
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 text-sm">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Tipe Modul</label>
                            <div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ui.color}`}>
                                    {ui.label}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Status & Total Fitur</label>
                            <div className="flex items-center gap-3">
                                <p className={`font-semibold ${module.is_active ? 'text-green-600' : 'text-zinc-400'}`}>
                                    {module.is_active ? 'Active' : 'Draft'}
                                </p>
                                <span className="text-zinc-300">|</span>
                                <p className="font-semibold">{module.permissions_count} Fitur</p>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-100">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Estimasi Harga Modul</label>
                            <p className="text-2xl font-black text-zinc-900 mt-1">{module.price_fmt}</p>
                        </div>

                        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex gap-3">
                            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed text-blue-700">
                                Harga modul dihitung berdasarkan total akumulasi harga fitur yang aktif di dalamnya secara otomatis.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-zinc-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-lg">Daftar Fitur (Permissions)</CardTitle>
                            <CardDescription className="text-xs">Daftar izin akses yang dibundel dalam paket ini.</CardDescription>
                        </div>
                        
                        {pageConfig.can_manage && (
                            <Dialog open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if(!val) reset(); }}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-1.5" /> Tambah Fitur
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Tambah Fitur ke {module.name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="max-h-[350px] overflow-y-auto border border-zinc-100 rounded-lg p-2 mt-4 space-y-1">
                                        {homeless_permissions.length > 0 ? (
                                            homeless_permissions.map((p) => (
                                                <div 
                                                    key={p.id} 
                                                    className="flex items-center space-x-3 p-2.5 hover:bg-zinc-50 rounded-md transition-colors cursor-pointer"
                                                    onClick={() => togglePermission(p.id)}
                                                >
                                                    <Checkbox 
                                                        id={`p-${p.id}`} 
                                                        checked={data.permissions.includes(p.id)}
                                                        onCheckedChange={() => togglePermission(p.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <label htmlFor={`p-${p.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                                                        {p.name}
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-sm text-muted-foreground">Tidak ada fitur yang tersedia.</p>
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                        <Button 
                                            onClick={handleAssign} 
                                            disabled={processing || data.permissions.length === 0}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? 'Memproses...' : `Tambahkan ${data.permissions.length} Fitur`}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-50/50">
                                <TableRow>
                                    <TableHead className="pl-6 w-[60%] text-[11px] uppercase tracking-wider font-bold">Nama Permission</TableHead>
                                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Harga</TableHead>
                                    {pageConfig.can_manage && <TableHead className="text-right pr-6 text-[11px] uppercase tracking-wider font-bold">Aksi</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {module.permissions.length > 0 ? (
                                    module.permissions.map((p) => (
                                        <TableRow key={p.id} className="group transition-colors">
                                            <TableCell className="pl-6 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                                                        <ShieldCheck className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <span className="text-sm text-zinc-700">{p.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm font-medium text-zinc-500">
                                                {p.price_fmt}
                                            </TableCell>
                                            {pageConfig.can_manage && (
                                                <TableCell className="text-right pr-6">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50" 
                                                        onClick={() => handleRemove(p.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={pageConfig.can_manage ? 3 : 2} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-2">
                                                <ShieldCheck className="h-10 w-10 text-zinc-200" />
                                                <p className="text-sm text-muted-foreground italic">Belum ada fitur yang dibundel.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </ResourceListLayout>
    );
}