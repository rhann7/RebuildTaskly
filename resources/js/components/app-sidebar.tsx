import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Building2, Folder, LayoutGrid, ShieldCheck } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const page = usePage();
    const currentUrl = page.url;
    const { auth } = page.props as any;
    const userRoles = auth.user.roles || [];

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            isActive: currentUrl === '/dashboard',
        },
        ...(userRoles.includes('super-admin') ? [
            {
                title: 'Company Management',
                href: '#',
                icon: Building2,
                isActive: currentUrl.startsWith('/company-management'),
                items: [
                    {
                        title: 'Company Categories',
                        href: '/company-management/categories',
                        isActive: currentUrl.startsWith('/company-management/categories'),
                    },
                    {
                        title: 'Company List',
                        href: '/company-management/companies',
                        isActive: currentUrl.startsWith('/company-management/companies'),
                    },
                ],
            },
            {
                title: 'Access Control',
                href: '#',
                icon: ShieldCheck,
                isActive: currentUrl.startsWith('/access-control'),
                items: [
                    {
                        title: 'Permissions List',
                        href: '/access-control/permissions',
                        isActive: currentUrl.startsWith('/access-control/permissions'),
                    },
                    {
                        title: 'Company Access',
                        href: '/access-control/company-access',
                        isActive: currentUrl.startsWith('/access-control/company-access'),
                    },
                ],
            },
        ] : []),
    ];

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

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}