import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { Badge } from '@/components/ui/badge';
import { Eye, Tag, FileText, ArrowLeft, Pencil, ArchiveRestore, ArrowUpFromLine } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import DOMPurify from 'dompurify';

type Article = {
    id: number;
    name: string;
    tag_code: string;
    status: string;
    view_count: number;
    created_at: string;
    category?: Category;
};

type Category = {
    id: number;
    name: string;
};

type PageProps = {
    article: Article;
    detail: {
        description: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Article Management', href: '#' },
    { title: 'Articles', href: '/article-management/article' },
    { title: 'Detail', href: '#' },
];

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
};

export default function ArticleShow({ article, detail }: PageProps) {
    const handleCancel = () => {
        router.visit('/article-management/article');
    };

    const handleStatusChange = (status: 'published' | 'archived') => {
        router.put(
            `/article-management/article/${article.id}/status`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit(`/article-management/article/${article.id}`);
                },
            }
        );
    };

    const goToEditPage = (article: Article) => {
        router.visit(`/article-management/article/${article.id}/edit`);
    };

    return (
        <ResourceListLayout
            title={article.name}
            badge={
                <Badge className={statusColors[article.status] || statusColors.draft}>
                    {article.status}
                </Badge>
            }
            description={article.tag_code}
            breadcrumbs={breadcrumbs}
            headerActions={
                <Button onClick={handleCancel} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Articles
                </Button>
            }
            isEmpty={false}
            config={{
                showHeaderActions: true,
                showShadow: true,
                showBorder: true,
            }}
        >
            <div className="max-w-full mx-auto p-4">
                <div className="border-b w-full py-2 flex justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Tag className="h-3.5 w-3.5" />
                            <span>{article.category?.name ?? '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Eye className="h-3.5 w-3.5" />
                            <span>{article.view_count.toLocaleString()} views</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    <div className='flex items-center gap-3'>
                        <Button
                            variant="outline"
                            onClick={() => goToEditPage(article)}
                        >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                        </Button>
                        {article.status === 'published' ? (
                            <Button
                                variant="outline"
                                onClick={() => handleStatusChange('archived')}
                            >
                                <ArchiveRestore />
                                Archive
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => handleStatusChange('published')}
                            >
                                <ArrowUpFromLine />
                                Publish
                            </Button>
                        )}
                    </div>
                </div>

                <div
                    className="article-content prose max-w-none py-3"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(detail.description) }}
                />
            </div>
        </ResourceListLayout>
    );
}
