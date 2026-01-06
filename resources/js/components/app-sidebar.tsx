import { NavFooter } from '@/components/nav-footer';
import { NavMain, NavManagement } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BugIcon, Building2, ChartColumnIncreasing, Clock, FileTextIcon, Folder, FolderKanban, LayoutGrid, MessageCircleQuestionIcon, Settings, ShieldCheck, SquareCheck, Users } from 'lucide-react';
import AppLogo from './app-logo';


const footerNavItems: NavItem[] = [
    { title: 'Settings', href: '/settings-company', icon: Settings },
    { title: 'Help & Support', href: '/support', icon: MessageCircleQuestionIcon },
];

export function AppSidebar() {
    const page = usePage();
    const currentUrl = page.url;
    const { auth } = page.props as any;
    const userRoles = auth.user.roles || [];

    // --- 1. MAIN NAVIGATION ---
    // Fokus pada operasional harian: Dashboard, Workspace, Project, Task
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            isActive: currentUrl === '/dashboard',
        },
        // Admin Arsitektur (Super Admin)
        ...(userRoles.includes('admin') ? [
            {
                title: 'Company Management',
                href: '#',
                icon: Building2,
                isActive: currentUrl.startsWith('/company-management'),
                items: [
                    { title: 'Categories', href: '/company-management/categories' },
                    { title: 'Company List', href: '/company-management/companies' },
                ],
            },
            {
                title: 'Access Control',
                href: '#',
                icon: ShieldCheck,
                isActive: currentUrl.startsWith('/access-control'),
                items: [
                    { title: 'Permissions', href: '/access-control/permissions' },
                    { title: 'Company Access', href: '/access-control/company-access' },
                ],
            },
        ] : []),
        // Company Owner Operasional
        ...(userRoles.includes('company-owner') ? [
            {
                title: 'Workspace',
                href: '#',
                icon: Building2,
                isActive: currentUrl.startsWith('/workspace'),
                items: [
                    { title: 'Workspace List', href: '/workspace/workspaces' },
                ]
            },
            {
                title: 'Projects',
                href: '#',
                icon: FolderKanban,
                isActive: currentUrl.startsWith('/project'),
                items: [
                    { title: 'Project List', href: '/project/projects' },
                ]
            },
            {
                title: 'Tasks',
                href: '#',
                icon: SquareCheck,
                isActive: currentUrl.startsWith('/tasks'),
                items: [
                    { title: 'Task List', href: '/tasks/list' },
                    { title: 'Board', href: '/tasks/board' },
                ]
            },
        ] : []),
    ];

    // --- 2. MANAGEMENT NAVIGATION ---
    // Fokus pada administratif, monitoring, dan keuangan
    const managementNavItems: NavItem[] = [
        ...(userRoles.includes('company-owner') || userRoles.includes('member') ? [
            {
                title: 'Bug & Request',
                href: '/bug-request',
                icon: BugIcon,
                isActive: currentUrl.startsWith('/bug-request')
            },
            {
                title: 'Timesheets',
                href: '/timesheets',
                icon: Clock,
                isActive: currentUrl.startsWith('/timesheets')
            },
            {
                title: 'Reports',
                href: '/reports',
                icon: ChartColumnIncreasing,
                isActive: currentUrl.startsWith('/reports')
            },
            {
                title: 'Invoices',
                href: '/invoices',
                icon: FileTextIcon,
                isActive: currentUrl.startsWith('/invoices')
            }
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
                <NavManagement items={managementNavItems} />

            </SidebarContent>

            <SidebarFooter className="border-t border-border/50 p-2 gap-2 shrink-0">
                <NavFooter items={footerNavItems} />
            </SidebarFooter>
        </Sidebar>
    );
}