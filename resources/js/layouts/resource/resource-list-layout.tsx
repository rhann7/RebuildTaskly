import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { ReactNode } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface PaginationProps {
    data: any[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
}

interface LayoutConfig {
    showFilter?: boolean;
    showPagination?: boolean;
    showPaginationInfo?: boolean;
    showHeaderActions?: boolean;
    showShadow?: boolean;
    showBorder?: boolean;
    containerClassName?: string;
    emptyStateIcon?: ReactNode;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
}

interface ResourceListLayoutProps {
    title: string;
    description?: string;
    breadcrumbs: BreadcrumbItem[];
    headerActions?: ReactNode;
    filterWidget?: ReactNode;
    pagination?: PaginationProps;
    children: ReactNode;
    isEmpty?: boolean;
    isLoading?: boolean;
    config?: LayoutConfig;
}

export default function ResourceListLayout({
    title,
    description,
    breadcrumbs,
    headerActions,
    filterWidget,
    pagination,
    children,
    isEmpty = false,
    isLoading = false,
    config = {}
}: ResourceListLayoutProps) {
    const layoutConfig: LayoutConfig = {
        showFilter: true,
        showPagination: true,
        showPaginationInfo: true,
        showHeaderActions: true,
        showShadow: true,
        showBorder: true,
        containerClassName: '',
        emptyStateIcon: <Inbox className="h-6 w-6 text-muted-foreground/60" />,
        emptyStateTitle: 'No data found',
        emptyStateDescription: 'Try adjusting your filters or search query.',
        ...config
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>
                    {layoutConfig.showHeaderActions && headerActions && (
                        <div className="flex items-center gap-2">{headerActions}</div>
                    )}
                </div>

                {layoutConfig.showFilter && filterWidget && (
                    <div className="flex flex-col md:flex-row gap-3 items-center rounded-xl border border-border bg-sidebar p-4 shadow-sm">
                        {filterWidget}
                    </div>
                )}

                <div className={`relative flex-1 overflow-hidden rounded-xl flex flex-col ${
                    layoutConfig.showBorder ? 'border border-border/50' : ''
                } ${
                    layoutConfig.showShadow ? 'shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]' : ''
                } bg-background ${layoutConfig.containerClassName}`}>
                    
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    <div className="flex-1 overflow-auto">
                        {isEmpty ? (
                            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                                <div className="rounded-full bg-muted p-3">
                                    {layoutConfig.emptyStateIcon}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{layoutConfig.emptyStateTitle}</p>
                                    <p className="text-xs text-muted-foreground">{layoutConfig.emptyStateDescription}</p>
                                </div>
                            </div>
                        ) : (
                            children
                        )}
                    </div>

                    {layoutConfig.showPagination && pagination && pagination.links && pagination.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-border/50 bg-zinc-50/30 px-6 py-4 dark:bg-zinc-900/30">
                            {layoutConfig.showPaginationInfo && (
                                <div className="hidden text-xs text-muted-foreground md:block">
                                    Showing <span className="font-medium text-foreground">{pagination.from}</span> to{" "}
                                    <span className="font-medium text-foreground">{pagination.to}</span> of{" "}
                                    <span className="font-medium text-foreground">{pagination.total}</span> results
                                </div>
                            )}
                            
                            <div className={`flex items-center gap-1 ${
                                layoutConfig.showPaginationInfo ? 'w-full justify-center md:w-auto' : 'w-full justify-center'
                            }`}>
                                {pagination.links.map((link, i) => {
                                    const isNext = link.label.includes('Next');
                                    const isPrev = link.label.includes('Previous');
                                    
                                    return link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            preserveScroll
                                            className={`flex h-8 min-w-[32px] items-center justify-center rounded-md px-2 text-xs font-medium transition-colors ${
                                                link.active 
                                                ? 'bg-foreground text-background shadow-sm' 
                                                : 'bg-background border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : link.label}
                                        </Link>
                                    ) : (
                                        <span
                                            key={i}
                                            className="flex h-8 min-w-[32px] items-center justify-center rounded-md border border-transparent px-2 text-xs text-muted-foreground/40 opacity-50"
                                        >
                                            {isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : link.label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}