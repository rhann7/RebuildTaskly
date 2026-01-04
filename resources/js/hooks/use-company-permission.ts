import { usePage } from '@inertiajs/react';

export function useCompanyPermission() {
    const { auth } = usePage().props as any;
    const permissions = (auth.company_permissions as string[]) || [];

    const can = (permissionName: string): boolean => {
        return permissions.includes(permissionName);
    };

    const canAny = (permissionNames: string[]): boolean => {
        return permissionNames.some((p) => permissions.includes(p));
    };

    return { can, canAny, permissions };
}