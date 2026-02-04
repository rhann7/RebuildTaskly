import { LucideIcon } from 'lucide-react';
import { Config, RouteName, RouteParams } from 'ziggy-js';

declare global {
    var route: (
        name?: RouteName,
        params?: RouteParams<RouteName>,
        absolute?: boolean,
        config?: Config
    ) => string;
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | string | null;
    isActive?: boolean;
    items?: {
        title: string;
        href: string;
        isActive?: boolean;
    }[];
}

export interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
}

export interface SelectOption {
    label: string;
    value: string | number;
}

export interface FilterParams {
    search?: string;
    [key: string]: string | undefined;
}

export interface PageConfig {
    title: string;
    description: string;
    can_manage: boolean;
    options?: Record<string, SelectOption[]>;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}