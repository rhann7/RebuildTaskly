import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { NavUser } from './nav-user';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            {/* Kiri: Navigasi & Search */}
            <div className="flex flex-1 items-center gap-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    {/* <div className="hidden h-4 w-px bg-border md:block" /> Separator halus */}
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            {/* Kanan: Actions & Profile */}
            <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center">
                    <NavUser />
                </div>
            </div>
        </header>
    );
}
