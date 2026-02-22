import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Smartphone,
    TrendingUp,
    Users,
    FileText,
    AlertTriangle,
    Download,
    Clock
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface TopKeyword {
    id: number;
    name: string;
    rate: number;
    search_count: number;
}

interface DeviceIssue {
    device_type: string;
    search_count: number;
    unique_keywords: number;
    top_keyword: string | null;
    top_keyword_count: number;
}

interface KeywordSearch {
    id: number;
    keyword: string;
    keyword_rate: number;
    user_name: string;
    device_type: string;
    search_at: string;
    search_at_human: string;
}

interface Stats {
    total_searches: number;
    total_keywords: number;
    total_unique_users: number;
    avg_keyword_rate: number;
}

interface PageProps {
    topKeywords: TopKeyword[];
    deviceIssues: DeviceIssue[];
    keywordSearches: {
        data: KeywordSearch[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number;
        to: number;
        total: number;
    };
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Article Management', href: '#' },
    { title: 'Analytics', href: '/article-management/analytics' },
];

const getDeviceIcon = (deviceType: string) => {
    const device = deviceType?.toLowerCase() || '';
    if (device.includes('mobile') || device.includes('android') || device.includes('iphone')) {
        return '📱';
    } else if (device.includes('tablet') || device.includes('ipad')) {
        return '💊';
    } else if (device.includes('desktop') || device.includes('windows') || device.includes('mac')) {
        return '💻';
    }
    return '🖥️';
};

const getDeviceColor = (searchCount: number) => {
    if (searchCount > 100) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    if (searchCount > 50) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    if (searchCount > 20) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
};

export default function ArticleAnalytic({ topKeywords, deviceIssues, keywordSearches, stats }: PageProps) {
    const handleExport = () => {
        window.location.href = '/article-management/analytics/export';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Article Analytics" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            Article Analytics
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Monitor keyword searches, user behavior, and device insights.
                        </p>
                    </div>
                    <Button onClick={handleExport} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export Data
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard
                        title="Total Searches"
                        value={String(stats.total_searches)}
                        icon={Search}
                        description="All keyword searches"
                    />
                    <StatCard
                        title="Total Keywords"
                        value={String(stats.total_keywords)}
                        icon={FileText}
                        description="Unique keywords tracked"
                    />
                    <StatCard
                        title="Unique Users"
                        value={String(stats.total_unique_users)}
                        icon={Users}
                        description="Users who searched"
                    />
                    <StatCard
                        title="Avg. Keyword Rate"
                        value={(stats.avg_keyword_rate ?? 0).toFixed(2)}
                        icon={TrendingUp}
                        description="Average keyword rating"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Top Keywords Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Top Keywords
                            </CardTitle>
                            <CardDescription>
                                Most frequently searched keywords by rate
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topKeywords.length > 0 ? (
                                    topKeywords.map((keyword, index) => (
                                        <div
                                            key={keyword.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{keyword.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {keyword.search_count} searches
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="font-mono">
                                                {keyword.rate.toFixed(2)}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No keyword data available</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Device Issues Alert Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                Device Activity Monitor
                            </CardTitle>
                            <CardDescription>
                                Devices with high search activity (potential issues)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {deviceIssues.length > 0 ? (
                                    deviceIssues.map((device, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                                        >
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="text-2xl mt-0.5">
                                                    {getDeviceIcon(device.device_type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-sm truncate">
                                                            {device.device_type || 'Unknown Device'}
                                                        </p>
                                                        <Badge className={getDeviceColor(device.search_count)}>
                                                            {device.search_count} searches
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                        {device.unique_keywords} unique keywords searched
                                                    </p>
                                                    {device.top_keyword && (
                                                        <p className="text-xs font-medium text-primary">
                                                            Top: "{device.top_keyword}" ({device.top_keyword_count}x)
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No device data available</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Keyword Search History DataTable */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-primary" />
                            Keyword Search History
                        </CardTitle>
                        <CardDescription>
                            Detailed log of all keyword searches by users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Keyword</TableHead>
                                        <TableHead>Rate</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Device</TableHead>
                                        <TableHead className="text-right">Search Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {keywordSearches.data.length > 0 ? (
                                        keywordSearches.data.map((search) => (
                                            <TableRow key={search.id}>
                                                <TableCell className="font-medium">
                                                    {search.keyword}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono">
                                                        {search.keyword_rate.toFixed(2)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{search.user_name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span>{getDeviceIcon(search.device_type)}</span>
                                                        <span className="text-sm">{search.device_type}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm">{search.search_at_human}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {search.search_at}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Search className="h-8 w-8 opacity-50" />
                                                    <p className="text-sm">No search history available</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {keywordSearches.total > 0 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {keywordSearches.from} to {keywordSearches.to} of {keywordSearches.total} results
                                </div>
                                <div className="flex gap-1">
                                    {keywordSearches.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && (window.location.href = link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}