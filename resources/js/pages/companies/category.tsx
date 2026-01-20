import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Pencil, Search, Tag, Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type Category = {
    id: number;
    name: string;
    slug: string;
    companies_count: number;
    created_at: string;
};

type PageProps = {
    categories: {
        data: Category[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number;
        to: number;
        total: number;
    };
    filters: { search?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Company Categories', href: '/company-management/categories' },
];

export default function CategoryIndex({ categories, filters }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({ 
        name: '', 
    });

    const openCreateModal = () => { 
        setIsEditing(false); 
        setCurrentSlug(null); 
        setData({ name: '' }); 
        clearErrors(); 
        setIsOpen(true); 
    };
    
    const openEditModal = (c: Category) => { 
        setIsEditing(true); 
        setCurrentSlug(c.slug); 
        setData({ name: c.name }); 
        clearErrors(); 
        setIsOpen(true); 
    };
    
    const handleDelete = (slug: string) => { 
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/company-management/categories/${slug}`, {
                preserveScroll: true,
            }); 
        }
    };
    
    const handleSubmit: FormEventHandler = (e) => { 
        e.preventDefault(); 
        
        const options = { 
            onSuccess: () => { 
                setIsOpen(false); 
                reset(); 
            } 
        };

        if (isEditing && currentSlug) {
            put(`/company-management/categories/${currentSlug}`, options);
        } else {
            post('/company-management/categories', options);
        }
    };
    
    const handleSearch = () => { 
        router.get('/company-management/categories', 
            { search: searchQuery }, 
            { preserveState: true, replace: true }
        ); 
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search categories..."
                    className="pl-9 bg-background h-9 border-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
        </div>
    );
    
    const HeaderActions = (
        <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
        </Button>
    );

    return (
        <>
            <ResourceListLayout
                title="Company Categories"
                description="Manage business sectors and classifications."
                breadcrumbs={breadcrumbs}
                filterWidget={FilterWidget}
                headerActions={HeaderActions}
                pagination={categories}
                isEmpty={categories.data.length === 0}
                config={{
                    showFilter: true,
                    showPagination: true,
                    showPaginationInfo: true,
                    showHeaderActions: true,
                    showShadow: true,
                    showBorder: true,
                    emptyStateIcon: <Tag className="h-6 w-6 text-muted-foreground/60" />,
                    emptyStateTitle: 'No categories found',
                    emptyStateDescription: 'Add your first business category to start organizing.',
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="text-center">Usage</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {categories.data.map((category, i) => (
                            <TableRow key={category.id} className="group hover:bg-muted/30 transition-colors">
                                <TableCell className="text-center text-muted-foreground tabular-nums text-xs">
                                    {categories.from + i}
                                </TableCell>
                                <TableCell className="font-medium text-foreground">
                                    {category.name}
                                </TableCell>
                                <TableCell>
                                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                                        {category.slug}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center items-center gap-1.5 text-xs text-muted-foreground">
                                        <Building2 className="h-3.5 w-3.5 opacity-60" />
                                        {category.companies_count} Companies
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {new Date(category.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEditModal(category)}>
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => handleDelete(category.slug)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResourceListLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Category' : 'New Category'}</DialogTitle>
                        <DialogDescription>Define a business sector name.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input 
                                id="name"
                                value={data.name} 
                                onChange={(e) => setData('name', e.target.value)} 
                                placeholder="e.g. Technology" 
                                autoFocus 
                            />
                            <InputError message={errors.name} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {isEditing ? 'Save Changes' : 'Create Category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}