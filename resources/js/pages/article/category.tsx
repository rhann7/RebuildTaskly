import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Pencil, Search, Tag, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type Category = {
    id: number;
    name: string;
    articles_count: number;
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
    { title: 'Article Management', href: '#' },
    { title: 'Categories', href: '/article-management/category' },
];

export default function ArticleCategoryIndex({ categories, filters }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
    });

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentId(null);
        setData({ name: '' });
        clearErrors();
        setIsOpen(true);
    };

    const openEditModal = (c: Category) => {
        setIsEditing(true);
        setCurrentId(c.id);
        setData({ name: c.name });
        clearErrors();
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/article-management/category/${id}`);
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const action = isEditing && currentId ? put : post;
        const url = isEditing && currentId
            ? `/article-management/category/${currentId}`
            : '/article-management/category';

        action(url, {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            }
        });
    };

    const handleSearch = () => {
        router.get('/article-management/category',
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
                title="Article Categories"
                description="Manage article categories and classifications."
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
                    emptyStateDescription: 'Add your first article category to start organizing.',
                }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[50px] text-center">#</TableHead>
                            <TableHead>Category Name</TableHead>
                            <TableHead className="text-center">Usage</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {categories.data.map((category, i) => (
                            <TableRow key={category.id} className="group hover:bg-muted/30 transition-colors">
                                <TableCell className="text-center text-muted-foreground tabular-nums">
                                    {categories.from + i}
                                </TableCell>
                                <TableCell className="font-medium text-foreground">
                                    {category.name}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center items-center gap-1 text-xs text-muted-foreground">
                                        <FileText className="h-3.5 w-3.5" />
                                        {category.articles_count} Articles
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {new Date(category.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(category)}>
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(category.id)}>
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
                        <DialogDescription>Define an article category name.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Technology, Business, Lifestyle"
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
