import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Eye, Tag, FileText } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

type Article = {
    id: number;
    name: string;
    tag_code: string;
    status: string;
    view_count: number;
    device_type: string;
    created_at: string;
    category?: string;
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
    categories: Category[];
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

export default function ArticleShow({ article, detail, categories }: PageProps) {
    return (
        <ResourceListLayout
            title={article.name}
            badge={<Badge className={statusColors[article.status] || statusColors.draft}>
                {article.status}
            </Badge>}
            description={article.tag_code}
            breadcrumbs={breadcrumbs}
            config={{
                showHeaderActions: false,
                showShadow: true,
                showBorder: true,
                emptyStateIcon: <FileText className="h-6 w-6 text-muted-foreground/60" />,
                emptyStateTitle: 'No article found',
                emptyStateDescription: 'Article detail not available.',
            }}
        >
            <div className="max-w-2xl mx-auto p-4">

            </div>
        </ResourceListLayout>
    );
}
