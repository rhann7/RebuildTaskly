import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { useForm, router } from '@inertiajs/react';
import { ChevronLeft, Plus, Trash2, ShieldCheck, Box, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

type Permission = {
    id: number;
    name: string;
};

type PageProps = {
    module: {
        id: number;
        name: string;
        slug: string;
        type: string;
        permissions: Permission[];
    };
    homeless_permissions: Permission[];
};

export default function ModuleShow({ module, homeless_permissions }: PageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, reset } = useForm({
        permissions: [] as number[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Modules', href: route('product-management.modules.index') },
        { title: module.name, href: '#' },
    ];

    const togglePermission = (id: number) => {
        const current = [...data.permissions];
        const index = current.indexOf(id);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(id);
        }
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
            title={module.name}
            description={`Manage features and permissions for ${module.name} module.`}
            breadcrumbs={breadcrumbs}
            headerActions={
                <Button variant="outline" onClick={() => router.get(route('product-management.modules.index'))}>
                    <ChevronLeft className="h-4 w-4 mr-2" /> Kembali
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Box className="h-5 w-5 text-blue-600" /> Informasi Modul
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-muted-foreground">Tipe</label>
                            <p className="font-medium capitalize">{module.type}</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-muted-foreground">Total Fitur</label>
                            <p className="text-2xl font-bold">{module.permissions.length}</p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex gap-2">
                            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-800">
                                Harga modul akan otomatis terupdate setiap kali Anda menambah atau menghapus fitur (Total Harga Fitur - 5%).
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Daftar Fitur (Permissions)</CardTitle>
                            <CardDescription>Izin akses yang dibundel dalam modul ini.</CardDescription>
                        </div>
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Tambah Fitur</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tambah Fitur ke {module.name}</DialogTitle>
                                </DialogHeader>
                                <div className="max-h-[300px] overflow-y-auto border rounded-md p-2 space-y-1">
                                    {homeless_permissions.length > 0 ? (
                                        homeless_permissions.map((p) => (
                                            <div key={p.id} className="flex items-center space-x-2 p-2 hover:bg-zinc-50 rounded-sm">
                                                <Checkbox 
                                                    id={`p-${p.id}`} 
                                                    checked={data.permissions.includes(p.id)}
                                                    onCheckedChange={() => togglePermission(p.id)}
                                                />
                                                <label htmlFor={`p-${p.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                                                    {p.name}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center py-4 text-sm text-muted-foreground">Tidak ada fitur "homeless" tersedia.</p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                    <Button onClick={handleAssign} disabled={processing || data.permissions.length === 0}>
                                        Tambahkan ({data.permissions.length})
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Permission</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {module.permissions.length > 0 ? (
                                    module.permissions.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="h-4 w-4 text-green-600" />
                                                    {p.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-red-600" 
                                                    onClick={() => handleRemove(p.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center py-10 text-muted-foreground">
                                            Belum ada fitur yang ditambahkan ke modul ini.
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