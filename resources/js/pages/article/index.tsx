import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useState, FormEventHandler, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, Search, FileText, Grid3x3, List, Eye, Tag, RefreshCcw, InfoIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

// Type untuk response dari API
type SyncInfo = {
    sync_status: {
        needs_sync: boolean;
        reason: string;
        recommendation: string;
    };
    last_sync: {
        synced_at: string | null;
        pdf_file: string | null;
        total_articles_synced: number;
        vector_memories_count: number;
        time_ago: string;
    };
    current_state: {
        total_articles_now: number;
        unsynced_count: number;
        unsynced_articles_preview: Array<{
            id: number;
            title: string;
            created_at: string;
            updated_at: string;
        }>;
        vector_memory_stats: {
            total_memories: number;
            namespace: string;
        };
    };
    statistics: {
        total_sync_history: number;
        successful_syncs: number;
        failed_syncs: number;
    };
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

    // State untuk sync info
    const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLoadingSyncInfo, setIsLoadingSyncInfo] = useState(true);

    // Fetch sync info saat component mount dan setiap 30 detik
    useEffect(() => {
        const fetchSyncInfo = async () => {
            try {
                setIsLoadingSyncInfo(true);
                const res = await fetch('/article-management/sync-info');

                if (res.ok) {
                    const data: SyncInfo = await res.json();
                    setSyncInfo(data);
                    console.log('Sync Info:', data);
                } else {
                    console.error('Failed to fetch sync info:', res.statusText);
                }
            } catch (e) {
                console.error('Error fetching sync info:', e);
            } finally {
                setIsLoadingSyncInfo(false);
            }
        };

        // Fetch pertama kali
        fetchSyncInfo();

        // Auto refresh setiap 30 detik
        const interval = setInterval(fetchSyncInfo, 30000);

        // Cleanup
        return () => clearInterval(interval);
    }, []);

    // Refresh sync info setelah create/update/delete article
    const refreshSyncInfo = async () => {
        try {
            const res = await fetch('/article-management/sync-info');
            if (res.ok) {
                const data: SyncInfo = await res.json();
                setSyncInfo(data);
            }
        } catch (e) {
            console.error('Error refreshing sync info:', e);
        }
    };

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
            router.delete(`/article-management/article/${id}`, {
                onSuccess: () => {
                    // Refresh sync info setelah delete
                    refreshSyncInfo();
                }
            });
        }
    };

    const handleSync = async () => {
        if (!confirm('Are you sure you want to sync articles to AI Agent?')) {
            return;
        }

        setIsSyncing(true);

        try {
            router.post('/article-management/sync', {}, {
                onSuccess: (page) => {
                    // Refresh sync info setelah sync berhasil
                    setTimeout(() => {
                        refreshSyncInfo();
                    }, 1000);
                },
                onError: (errors) => {
                    console.error('Sync failed:', errors);
                    alert('Failed to sync articles. Please try again.');
                },
                onFinish: () => {
                    setIsSyncing(false);
                }
            });
        } catch (e) {
            console.error('Sync error:', e);
            setIsSyncing(false);
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
                // Refresh sync info setelah create/update
                refreshSyncInfo();
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

    const syncWidget = (
        <div className="flex items-center gap-2">
            <Button
                variant="secondary"
                disabled={isSyncing || isLoadingSyncInfo || !syncInfo?.sync_status.needs_sync}
                onClick={handleSync}
                className="relative"
            >
                <RefreshCcw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync to AI'}
                {syncInfo?.current_state.unsynced_count > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0">
                        {syncInfo.current_state.unsynced_count}
                    </Badge>
                )}
            </Button>
        </div>
    );

    const alertWidget = (
        <div className="space-y-3">
            {/* Loading state */}
            {isLoadingSyncInfo && (
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                    <AlertTitle className="text-blue-900 dark:text-blue-100">
                        Loading sync information...
                    </AlertTitle>
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                        Please wait while we check for unsynced articles.
                    </AlertDescription>
                </Alert>
            )}

            {/* Needs sync - Warning alert (HANYA MUNCUL JIKA ADA YANG PERLU SYNC) */}
            {!isLoadingSyncInfo && syncInfo?.sync_status.needs_sync && (
                <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <AlertTitle className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                        {syncInfo.current_state.unsynced_count} Article{syncInfo.current_state.unsynced_count > 1 ? 's' : ''} Need{syncInfo.current_state.unsynced_count === 1 ? 's' : ''} to be Synced
                    </AlertTitle>
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200 space-y-2">
                        <p className="font-medium">{syncInfo.sync_status.reason}</p>
                        <p className="text-sm">{syncInfo.sync_status.recommendation}</p>

                        {/* Last sync info */}
                        {syncInfo.last_sync.synced_at && (
                            <p className="text-xs mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                                Last synced: {syncInfo.last_sync.time_ago}
                                {' '}({syncInfo.last_sync.total_articles_synced} articles)
                            </p>
                        )}

                        {/* Preview unsynced articles */}
                        {syncInfo.current_state.unsynced_articles_preview.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800">
                                <p className="text-sm font-semibold mb-2">Recent unsynced articles:</p>
                                <ul className="text-xs space-y-1 ml-4 list-disc">
                                    {syncInfo.current_state.unsynced_articles_preview.slice(0, 5).map((article) => (
                                        <li key={article.id} className="truncate">
                                            {article.title}
                                            <span className="text-yellow-600 dark:text-yellow-400 ml-2">
                                                ({new Date(article.updated_at).toLocaleDateString()})
                                            </span>
                                        </li>
                                    ))}
                                    {syncInfo.current_state.unsynced_articles_preview.length > 5 && (
                                        <li className="italic">
                                            ... and {syncInfo.current_state.unsynced_articles_preview.length - 5} more
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}

                    </AlertDescription>
                </Alert>
            )}

            {/* Up to date - Hanya tampilkan info sederhana (TIDAK PAKAI ALERT BOX) */}
            {!isLoadingSyncInfo && syncInfo && !syncInfo.sync_status.needs_sync && syncInfo.last_sync.synced_at && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span>
                        Last synced: <span className="font-medium">{syncInfo.last_sync.time_ago}</span>
                        {' '}({syncInfo.last_sync.total_articles_synced} articles)
                    </span>
                </div>
            )}

            {/* Sync in progress */}
            {isSyncing && (
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700">
                    <RefreshCcw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                    <AlertTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        Syncing Articles...
                    </AlertTitle>
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                        Please wait while we sync your articles to the AI Agent. This may take a few moments.
                    </AlertDescription>
                </Alert>
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
                syncWidget={syncWidget}
                alertWidget={alertWidget}
                headerActions={HeaderActions}
                pagination={articles}
                isEmpty={articles.data.length === 0}
                config={{
                    showFilter: true,
                    showsSyncArticle: true,
                    showPagination: true,
                    showPaginationInfo: true,
                    showHeaderActions: true,
                    showShadow: true,
                    showBorder: true,
                    showAlert: true,
                    emptyStateIcon: <FileText className="h-6 w-6 text-muted-foreground/60" />,
                    emptyStateTitle: 'No articles found',
                    emptyStateDescription: 'Create your first article to get started.',
                }}
            >
                {/* Grid/List view code tetap sama seperti sebelumnya */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {articles.data.map((article) => (
                            <Card key={article.id} className="group hover:shadow-md transition-shadow">
                                {/* Card content tetap sama */}
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

            {/* Dialog tetap sama */}
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