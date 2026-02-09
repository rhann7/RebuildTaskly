import { Head } from '@inertiajs/react';
import { useState, FormEventHandler } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FloatingChatButton from '@/components/chatbot/floating-chat-button';
import {
    Search,
    BookOpen,
    Eye,
    Calendar,
    MessageSquare,
    HelpCircle,
    ArrowRight,
    Grid3x3,
    FileText
} from 'lucide-react';

type Article = {
    id: number;
    name: string;
    tag_code: string;
    status: string;
    view_count: number;
    device_type: string;
    created_at: string;
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
};

type Category = {
    id: number;
    name: string;
};

type PageProps = {
    articles: {
        data: Article[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    popularCategories: Category[];
    allCategories: Category[];
    filters: {
        search?: string;
        category?: string;
    };
    hasSearch: boolean;
};

export default function ArticleCenter({ articles, popularCategories, allCategories, filters, hasSearch }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        if (search.trim()) {
            router.get('/article-center', { search: search.trim() }, {
                preserveState: true,
            });
        }
    };

    const handleCategoryClick = (categoryId: number) => {
        router.get('/article-center', { category: categoryId });
    };

    const handleArticleClick = (articleId: number) => {
        router.visit(`/article-center/${articleId}`);
    };

    const clearSearch = () => {
        setSearch('');
        router.get('/article-center');
    };

    const truncateText = (text: string, maxLength: number) => {
        const stripped = text.replace(/<[^>]*>/g, '');
        return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped;
    };

    const getFirstImage = (article: Article) => {
        return article.detail?.images?.[0]?.url_image || '/images/placeholder-article.png';
    };

    // Hero Section with Search
    const heroSection = (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-12 mb-8">
            <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                    <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                    How can we help you today?
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Search our knowledge base for answers and helpful guides
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search for articles, topics, or keywords..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 pr-32 h-14 text-base shadow-lg border-2 focus-visible:ring-2"
                        />
                        <Button
                            type="submit"
                            size="lg"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10"
                        >
                            Search Now
                        </Button>
                    </div>
                </form>

                {filters.search && (
                    <div className="mt-4 text-sm text-muted-foreground">
                        Showing results for: <span className="font-semibold">"{filters.search}"</span>
                        <Button variant="link" size="sm" onClick={clearSearch} className="ml-2">
                            Clear search
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    // Proceed Options Section
    const proceedSection = (
        <div className="mb-12">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">How Do You Want To Proceed?</h2>
                <p className="text-muted-foreground">
                    Explore our comprehensive help resources or chat with our team
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Help Desk Card */}
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
                    <CardHeader className="text-center pb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-lg mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <HelpCircle className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl">Help Desk</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground mb-6">
                            Search our extensive knowledge base for instant help
                        </p>
                        <Button
                            variant="secondary"
                            className="w-full bg-white dark:bg-gray-800"
                            onClick={() => {
                                const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                                searchInput?.focus();
                                searchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                        >
                            Browse All Topics
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Live Chat Card */}
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 border-green-200 dark:border-green-800">
                    <CardHeader className="text-center pb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-lg mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl">Live Chat</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground mb-6">
                            Connect with our support team for personalized help
                        </p>
                        <Button
                            variant="secondary"
                            className="w-full bg-white dark:bg-gray-800"
                        >
                            Go To Live Chat
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    // Popular Topics Section
    const popularTopicsSection = (
        <div className="mb-12">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Browse For Popular Help Topics</h2>
                <p className="text-muted-foreground">
                    Explore our most accessed support articles and guides
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularCategories.map((category, index) => {
                    const icons = [BookOpen, FileText, Grid3x3, HelpCircle];
                    const Icon = icons[index % icons.length];
                    const colors = [
                        'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-700',
                        'from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-700',
                        'from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-700',
                        'from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50 border-teal-200 dark:border-teal-700',
                    ];
                    const iconColors = [
                        'bg-blue-500',
                        'bg-purple-500',
                        'bg-orange-500',
                        'bg-teal-500',
                    ];

                    return (
                        <Card
                            key={category.id}
                            className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br ${colors[index % colors.length]}`}
                            onClick={() => handleCategoryClick(category.id)}
                        >
                            <CardHeader className="text-center pb-3">
                                <div className={`inline-flex items-center justify-center w-14 h-14 ${iconColors[index % iconColors.length]} text-white rounded-lg mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                                    <Icon className="h-7 w-7" />
                                </div>
                                <CardTitle className="text-lg">{category.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <Button
                                    variant="link"
                                    className="text-sm group-hover:translate-x-1 transition-transform"
                                >
                                    Learn More
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );

    // Articles Grid (shown when searching)
    const articlesGrid = (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Search Results</h2>
                <div className="text-sm text-muted-foreground">
                    Found {articles.total} {articles.total === 1 ? 'article' : 'articles'}
                </div>
            </div>

            {articles.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.data.map((article) => (
                        <Card
                            key={article.id}
                            className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                            onClick={() => handleArticleClick(article.id)}
                        >
                            {/* Article Image */}
                            <div className="relative h-48 overflow-hidden bg-muted">
                                <img
                                    src={getFirstImage(article)}
                                    alt={article.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        e.currentTarget.src = '/images/placeholder-article.png';
                                    }}
                                />
                                <div className="absolute top-3 right-3">
                                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                                        {article.category.name}
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader>
                                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                    {article.name}
                                </CardTitle>
                                <CardDescription className="line-clamp-3">
                                    {article.detail?.description
                                        ? truncateText(article.detail.description, 120)
                                        : 'No description available'}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex items-center justify-between text-sm text-muted-foreground pt-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Eye className="h-3.5 w-3.5" />
                                        <span>{article.view_count.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                    <p className="text-muted-foreground mb-4">
                        Try different keywords or browse by category
                    </p>
                    <Button onClick={clearSearch} variant="outline">
                        Clear search
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <>
            <Head title="Help Center" />
            <div className="min-h-screen bg-background">
                {/* Main Container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Hero Section with Search - Always visible */}
                    {heroSection}

                    {/* Show proceed and popular topics when NOT searching */}
                    {!hasSearch && (
                        <>
                            {proceedSection}
                            {popularTopicsSection}
                        </>
                    )}

                    {/* Show articles grid when searching */}
                    {hasSearch && articlesGrid}

                    {/* Pagination for search results */}
                    {hasSearch && articles.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            {articles.links.map((link, index) => {
                                if (!link.url) return null;

                                return (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => router.visit(link.url!)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Floating Chat Button for AI Agent */}
                <FloatingChatButton />
            </div>
        </>
    );
}