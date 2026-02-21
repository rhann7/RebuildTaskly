import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from './app-logo';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
    const page = usePage();
    const { auth } = page.props as any;
    const mainNavItems = auth.user.menu;
    const { state } = useSidebar();
    const isCompanyUser = auth.user.company !== null && !auth.user.roles.includes('super-admin');

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="flex flex-col">
                <NavMain items={mainNavItems} />

                {isCompanyUser && <div className="flex-1" />}

                {isCompanyUser && state === 'expanded' && (
                    <div className="p-3">
                        <div className="rounded-lg border border-sidebar-border p-3">
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                                    <p className="text-xs font-semibold text-sidebar-foreground">Upgrade Plan</p>
                                </div>

                                <p className="text-[11px] leading-relaxed text-sidebar-foreground/50">
                                    Get access to advanced features and priority support.
                                </p>

                                <Button asChild size="sm" variant="outline" className="h-7 w-full border-sidebar-border bg-transparent text-[11px] font-medium text-sidebar-foreground hover:bg-sidebar-accent">
                                    <Link href={route('plans.pricing')}>
                                        Upgrade Now
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {isCompanyUser && state === 'collapsed' && (
                    <div className="px-2 pb-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Upgrade Plan">
                                    <Link href={route('plans.pricing')}>
                                        <Sparkles className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span>Upgrade Plan</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}