import { Head } from '@inertiajs/react';
import { useState, useEffect, FormEventHandler } from 'react';
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
    FileText,
    Moon,
    Sun
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
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        setIsDarkMode(shouldBeDark);
        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

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
        return article.detail?.images?.[0]?.url_image || '/assets/bg-card-article.jpg';
    };

    // Search Navbar - Shown when in search mode
    const searchNavbar = (
        <div
            className="relative border-b shadow-lg mb-8 sticky top-0 z-50 overflow-hidden"
            style={{
                backgroundImage: 'url(/assets/bg-article.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Button
                variant="secondary"
                size="sm"
                onClick={toggleDarkMode}
                className="bg-white/90 hover:bg-white text-gray-900 flex-shrink-0"
            >
                {isDarkMode ? (
                    <Sun className="h-4 w-4" />
                ) : (
                    <Moon className="h-4 w-4" />
                )}
            </Button>

            {/* 
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70 backdrop-blur-sm"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-4">
                    {/* Logo/Back to Home */}
                    <button
                        onClick={() => router.get('/article-center')}
                        className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                    >
                        <BookOpen className="h-6 w-6" />
                        <span className="font-semibold hidden md:inline">Help Center</span>
                    </button>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search for something"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 h-10 text-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-lg"
                            />
                        </div>
                    </form>

                    {/* Clear Search Button */}
                    {filters.search && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={clearSearch}
                            className="bg-white/90 hover:bg-white text-gray-900"
                        >
                            Clear
                        </Button>
                    )}
                </div>

                {/* Search Results Info */}
                {filters.search && (
                    <div className="mt-3 text-sm text-white/90">
                        Showing results for: <span className="font-semibold text-white">"{filters.search}"</span>
                    </div>
                )}
            </div>
        </div>
    );

    // Hero Section with Search - Adobe Style
    const heroSection = (
        <div
            className="relative rounded-lg overflow-hidden mb-8"
            style={{
                backgroundImage: 'url(/assets/bg-article.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '500px',
            }}
        >
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 min-h-[500px]">
                {/* Logo/Icon */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                        <BookOpen className="h-10 w-10 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-white text-center">
                    Article Help Center
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-white/90 mb-10 text-center max-w-2xl">
                    Search for answers or find help for your product
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative w-full max-w-3xl mx-auto mb-12">
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search for something"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-14 pr-4 h-16 text-base bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-full focus-visible:ring-2 focus-visible:ring-white/50"
                        />
                    </div>
                </form>

                {/* Dark Mode Toggle Button */}
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleDarkMode}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm mb-12"
                >
                    {isDarkMode ? (
                        <>
                            <Sun className="h-4 w-4 mr-2" />
                            Light Mode
                        </>
                    ) : (
                        <>
                            <Moon className="h-4 w-4 mr-2" />
                            Dark Mode
                        </>
                    )}
                </Button>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-white/80">
                        <button
                            onClick={() => router.get('/article-center')}
                            className="hover:text-white transition-colors border-b-2 border-transparent hover:border-white pb-1"
                        >
                            FEATURED PRODUCTS
                        </button>
                        {popularCategories.slice(0, 3).map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className="hover:text-white transition-colors border-b-2 border-transparent hover:border-white pb-1"
                            >
                                {category.name.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {filters.search && (
                    <div className="mt-6 text-sm text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                        Showing results for: <span className="font-semibold">"{filters.search}"</span>
                        <Button
                            variant="link"
                            size="sm"
                            onClick={clearSearch}
                            className="ml-2 text-white hover:text-white/80"
                        >
                            Clear search
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    // Popular Topics Section - Adobe Style Grid
    const popularTopicsSection = (
        <div className="mb-16">
            {/* Section Title */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3">Browse Popular Topics</h2>
                <p className="text-muted-foreground text-lg">
                    Find help articles organized by category
                </p>
            </div>

            {/* First Row - 4 columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 max-w-5xl mx-auto">
                {popularCategories.slice(0, 4).map((category, index) => {
                    const icons = [BookOpen, FileText, Grid3x3, HelpCircle];
                    const Icon = icons[index % icons.length];
                    const iconColors = [
                        'text-red-500',
                        'text-blue-500',
                        'text-orange-500',
                        'text-purple-500',
                    ];
                    const bgColors = [
                        'bg-red-50 dark:bg-red-950/20',
                        'bg-blue-50 dark:bg-blue-950/20',
                        'bg-orange-50 dark:bg-orange-950/20',
                        'bg-purple-50 dark:bg-purple-950/20',
                    ];

                    return (
                        <Card
                            key={category.id}
                            className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border bg-card"
                            onClick={() => handleCategoryClick(category.id)}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <div className={`inline-flex items-center justify-center w-16 h-16 ${bgColors[index % bgColors.length]} rounded-lg mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`h-8 w-8 ${iconColors[index % iconColors.length]}`} />
                                </div>
                                <h3 className="text-base font-semibold">{category.name}</h3>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Second Row - 2 columns centered */}
            {popularCategories.length > 4 && (
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {popularCategories.slice(4, 6).map((category, index) => {
                        const icons = [MessageSquare, Calendar];
                        const Icon = icons[index % icons.length];
                        const iconColors = [
                            'text-green-500',
                            'text-indigo-500',
                        ];
                        const bgColors = [
                            'bg-green-50 dark:bg-green-950/20',
                            'bg-indigo-50 dark:bg-indigo-950/20',
                        ];

                        return (
                            <Card
                                key={category.id}
                                className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border bg-card"
                                onClick={() => handleCategoryClick(category.id)}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 ${bgColors[index % bgColors.length]} rounded-lg mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className={`h-8 w-8 ${iconColors[index % iconColors.length]}`} />
                                    </div>
                                    <h3 className="text-base font-semibold">{category.name}</h3>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
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
                            className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                            onClick={() => handleArticleClick(article.id)}
                        >
                            {/* Article Image */}
                            <div className="relative h-48 overflow-hidden bg-muted flex-shrink-0">
                                <img
                                    src={getFirstImage(article)}
                                    alt={article.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        e.currentTarget.src = '/assets/bg-card-article.jpg';
                                    }}
                                />
                                <div className="absolute top-3 right-3">
                                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                                        {article.category.name}
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader className="pb-3">
                                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-base">
                                    {article.name}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 text-sm mt-2">
                                    {article.detail?.description
                                        ? truncateText(article.detail.description, 100)
                                        : 'No description available'}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pt-0 mt-auto">
                                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>{article.view_count.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                </div>
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
                {/* Show Search Navbar when in search mode */}
                {hasSearch && searchNavbar}

                {/* Main Container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Hero Section with Search - Only shown when NOT searching */}
                    {!hasSearch && heroSection}

                    {/* Show popular topics when NOT searching */}
                    {!hasSearch && popularTopicsSection}

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