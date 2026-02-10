import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import FloatingChatButton from '@/components/chatbot/floating-chat-button';
import {
    ArrowLeft,
    Eye,
    Calendar,
    Tag,
    Clock,
    BookOpen,
    Share2,
    ThumbsUp,
    MessageSquare,
    ChevronRight
} from 'lucide-react';
import DOMPurify from 'dompurify';

type Article = {
    id: number;
    name: string;
    tag_code: string;
    status: string;
    view_count: number;
    device_type: string;
    created_at: string;
    updated_at: string;
    category: {
        id: number;
        name: string;
    };
    detail: {
        description: string;
        images: Array<{
            id: number;
            url_image: string;
            type_image: string;
        }>;
    };
    keySummaries?: Array<{
        keyword: {
            id: number;
            name: string;
            rate_keyword: number;
        };
    }>;
};

type PageProps = {
    article: Article;
    relatedArticles: Article[];
};

export default function ArticleCenterDetail({ article, relatedArticles }: PageProps) {
    const handleBack = () => {
        router.visit('/article-center');
    };

    const handleRelatedArticleClick = (articleId: number) => {
        router.visit(`/article-center/${articleId}`);
    };

    const getSanitizedContent = (html: string) => {
        return { __html: DOMPurify.sanitize(html) };
    };

    const getFormattedDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getReadingTime = (content: string) => {
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min read`;
    };

    const truncateText = (text: string, maxLength: number) => {
        const stripped = text.replace(/<[^>]*>/g, '');
        return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped;
    };

    const getFirstImage = (article: Article) => {
        return article.detail?.images?.[0]?.url_image || '/images/placeholder-article.png';
    };

    const headerActions = (
        <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
        </Button>
    );

    return (
        <>
            <Head title={article.name} />
            <div className="min-h-screen bg-background">
                {/* Header with Back Button */}
                <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" onClick={handleBack}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Help Center
                            </Button>
                            <Badge variant="secondary">
                                {article.category.name}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Main Container */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{/* Article Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold tracking-tight mb-4">
                            {article.name}
                        </h1>

                        {/* Article Metadata */}
                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-6 border-b">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Published on {getFormattedDate(article.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>{article.view_count.toLocaleString()} views</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{getReadingTime(article.detail?.description || '')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                <span>{article.tag_code}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Article Content */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="p-8">
                                    {/* Featured Image */}
                                    {article.detail?.images && article.detail.images.length > 0 && (
                                        <div className="mb-8 rounded-lg overflow-hidden border">
                                            <img
                                                src={getFirstImage(article)}
                                                alt={article.name}
                                                className="w-full h-auto object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/placeholder-article.png';
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Article Body */}
                                    <div
                                        className="article-content prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-img:rounded-lg"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.detail?.description) }}
                                    />

                                    {/* Keywords */}
                                    {article.keySummaries && article.keySummaries.length > 0 && (
                                        <div className="mt-8 pt-8 border-t">
                                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <Tag className="h-4 w-4" />
                                                Related Keywords
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {article.keySummaries.map((summary, index) => (
                                                    <Badge key={index} variant="outline" className="text-sm">
                                                        {summary.keyword.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Feedback Section */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">Was this article helpful?</CardTitle>
                                    <CardDescription>
                                        Let us know if you found this article useful
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1">
                                            <ThumbsUp className="h-4 w-4 mr-2" />
                                            Yes, this helped
                                        </Button>
                                        <Button variant="outline" className="flex-1">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Need more help
                                        </Button>
                                        <Button variant="outline">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Article Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Article Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-sm">
                                        <div>
                                            <div className="font-medium mb-2 text-muted-foreground">Category</div>
                                            <Badge variant="secondary" className="text-sm">
                                                {article.category.name}
                                            </Badge>
                                        </div>
                                        <Separator />
                                        <div>
                                            <div className="font-medium mb-2 text-muted-foreground">Last Updated</div>
                                            <div className="text-sm">
                                                {getFormattedDate(article.updated_at)}
                                            </div>
                                        </div>
                                        <Separator />
                                        <div>
                                            <div className="font-medium mb-2 text-muted-foreground">Total Views</div>
                                            <div className="text-sm font-semibold">
                                                {article.view_count.toLocaleString()}
                                            </div>
                                        </div>
                                        <Separator />
                                        <div>
                                            <div className="font-medium mb-2 text-muted-foreground">Article ID</div>
                                            <div className="text-sm font-mono">
                                                #{article.tag_code}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Related Articles */}
                                {relatedArticles.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Related Articles</CardTitle>
                                            <CardDescription>
                                                More from {article.category.name}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {relatedArticles.map((related) => (
                                                <div
                                                    key={related.id}
                                                    className="group cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors border"
                                                    onClick={() => handleRelatedArticleClick(related.id)}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-muted">
                                                            <img
                                                                src={getFirstImage(related)}
                                                                alt={related.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/images/placeholder-article.png';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                                                {related.name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Eye className="h-3 w-3" />
                                                                <span>{related.view_count.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Need More Help */}
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="text-base">Need More Help?</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            variant="default"
                                            className="w-full"
                                            onClick={handleBack}
                                        >
                                            <BookOpen className="h-4 w-4 mr-2" />
                                            Browse More Articles
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Contact Support
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Chat Button */}
                <FloatingChatButton />
            </div>
        </>
    );
}