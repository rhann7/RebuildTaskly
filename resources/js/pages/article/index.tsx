import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, Search, FileText, Grid3x3, List, Eye, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

type Article = {
    id: number;
    name: string;
    tag_code: string;
    status: string;
    view_count: number;
    device_type: string;
    created_at: string;
    category: string
};

type Category = {
    id: number;
    name: string;
};

type PageProps = {
    articles: {
        data: Article[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        category_id?: string;
    };
    categories?: Category[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Article Management', href: '#' },
    { title: 'Articles', href: '/article-management/article' },
];

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
};

export default function ArticleIndex({ articles, filters, categories = [] }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        category_article_id: '',
    });

    const openCreateModal = () => {
        router.visit('/article-management/article/create');
    };

    const goToEditPage = (article: Article) => {
        router.visit(`/article-management/article/${article.id}/edit`);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this article?')) {
            router.delete(`/article-management/article/${id}`);
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const action = isEditing && currentId ? put : post;
        const url = isEditing && currentId
            ? `/article-management/article/${currentId}`
            : '/article-management/article';

        action(url, {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            }
        });
    };

    const handleFilter = () => {
        router.get('/article-management/article', {
            search: searchQuery,
            status: statusFilter,
            category_id: categoryFilter,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setCategoryFilter('');
        router.get('/article-management/article', {}, { preserveState: true, replace: true });
    };

    const FilterWidget = (
        <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search articles..."
                    className="pl-9 bg-background h-9 border-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
            </Select>
            <Select value={categoryFilter || 'all'} onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={handleFilter} variant="secondary" size="sm" className="h-9">
                Filter
            </Button>
            {(searchQuery || statusFilter || categoryFilter) && (
                <Button onClick={clearFilters} variant="ghost" size="sm" className="h-9">
                    Clear
                </Button>
            )}
        </div>
    );

    const HeaderActions = (
        <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md">
                <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={() => setViewMode('grid')}
                >
                    <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={() => setViewMode('list')}
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>
            <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Article
            </Button>
        </div>
    );

    return (
        <>
            <ResourceListLayout
                title="Articles"
                description="Manage your articles and content."
                breadcrumbs={breadcrumbs}
                filterWidget={FilterWidget}
                headerActions={HeaderActions}
                pagination={articles}
                isEmpty={articles.data.length === 0}
                config={{
                    showFilter: true,
                    showPagination: true,
                    showPaginationInfo: true,
                    showHeaderActions: true,
                    showShadow: true,
                    showBorder: true,
                    emptyStateIcon: <FileText className="h-6 w-6 text-muted-foreground/60" />,
                    emptyStateTitle: 'No articles found',
                    emptyStateDescription: 'Create your first article to get started.',
                }}
            >
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {articles.data.map((article) => (
                            <Card key={article.id} className="group hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-base truncate mb-1">
                                                {article.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                {article.tag_code}
                                            </p>
                                        </div>
                                        <Badge className={statusColors[article.status] || statusColors.draft}>
                                            {article.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Tag className="h-3.5 w-3.5" />
                                            <span className="truncate">{article.category ?? '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>{article.view_count.toLocaleString()} views</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(article.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-3 border-t">
                                    <div className="flex justify-end gap-2 w-full">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8"
                                            onClick={() => goToEditPage(article)}
                                        >
                                            <Pencil className="h-3.5 w-3.5 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 hover:text-red-600"
                                            onClick={() => handleDelete(article.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                                            Delete
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-blue-600"
                                            onClick={() => router.visit(`/article-management/article/${article.id}`)}
                                        >
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            View
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="divide-y">
                        {articles.data.map((article) => (
                            <div key={article.id} className="p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-base">
                                                {article.name}
                                            </h3>
                                            <Badge className={statusColors[article.status] || statusColors.draft}>
                                                {article.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                            <span className="font-mono">{article.tag_code}</span>
                                            <div className="flex items-center gap-1">
                                                <Tag className="h-3.5 w-3.5" />
                                                {article.category ?? '-'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3.5 w-3.5" />
                                                {article.view_count.toLocaleString()} views
                                            </div>
                                            <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => goToEditPage(article)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:text-red-600"
                                            onClick={() => handleDelete(article.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-600"
                                            onClick={() => router.visit(`/article-management/article/${article.id}`)}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ResourceListLayout>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Article' : 'New Article'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Update article information.' : 'Create a new article.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Title</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter article title"
                                autoFocus
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={data.category_article_id}
                                onValueChange={(value) => setData('category_article_id', value)}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_article_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Enter article content"
                                rows={6}
                            />
                            <InputError message={errors.description} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {isEditing ? 'Save Changes' : 'Create Article'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}