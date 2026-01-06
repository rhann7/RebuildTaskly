import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    // Active Style: Menggunakan Sada Red dengan latar transparan yang elegan
    const activeClass = "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-white-500 font-bold shadow-sm ring-1 ring-red-500/20";

    return (
        <SidebarGroup className="px-2 py-0">
            {/* Label menggunakan style font-black agar konsisten dengan SidebarHeader */}
            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
                Main Menu
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const active = page.url.startsWith(resolveUrl(item.href));

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={`h-11 rounded-xl transition-all duration-300 px-3 hover:bg-muted group ${active ? activeClass : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Link href={item.href} prefetch className="flex items-center gap-3">
                                    {item.icon && (
                                        <item.icon className={`size-4.5 transition-colors ${active ? "text-red-600 dark:text-red-500" : "group-hover:text-foreground"}`} />
                                    )}
                                    <span className="text-sm tracking-tight">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export function NavManagement({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const activeClass = "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-white-500 font-bold shadow-sm ring-1 ring-red-500/20";

    return (
        <SidebarGroup className="px-2 py-0 mt-4">
            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
                Management
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const active = page.url.startsWith(resolveUrl(item.href));

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={`h-11 rounded-xl transition-all duration-300 px-3 hover:bg-muted group ${active ? activeClass : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Link href={item.href} prefetch className="flex items-center gap-3">
                                    {item.icon && (
                                        <item.icon className={`size-4.5 transition-colors ${active ? "text-red-600 dark:text-red-500" : "group-hover:text-foreground"}`} />
                                    )}
                                    <span className="text-sm tracking-tight">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}