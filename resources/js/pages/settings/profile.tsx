import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, usePage, useForm } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

interface ProfileForm {
    company_name: string;
    company_email: string;
    company_phone: string;
    company_address: string;
    company_category_id: string | number;
    company_logo: File | null;
    _method: string;
}

export default function Profile({
    mustVerifyEmail,
    status,
    categories,
    company
}: {
    mustVerifyEmail: boolean;
    status?: string;
    categories: { id: number; name: string }[];
    company: any;
}) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, post, processing, recentlySuccessful, errors } = useForm<ProfileForm>({
        company_name: company?.name || '',
        company_email: company?.email || '',
        company_phone: company?.phone || '',
        company_address: company?.address || '',
        company_category_id: company?.company_category_id || '',
        company_logo: null,
        _method: 'PATCH',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(ProfileController.update.url(), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />
            <SettingsLayout>
                <div className="space-y-12">
                    <form onSubmit={submit} className="space-y-12">
                        <div className="space-y-6">
                            <HeadingSmall
                                title="Business Profile"
                                description="Update your company's information. This will also update your login credentials."
                            />
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="company_name">Company Name</Label>
                                    <Input 
                                        id="company_name" 
                                        value={data.company_name} 
                                        onChange={(e) => setData('company_name', e.target.value)} 
                                        required 
                                        className="bg-transparent"
                                    />
                                    <InputError message={errors.company_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="company_category_id">Industry</Label>
                                    <select 
                                        id="company_category_id" 
                                        value={data.company_category_id}
                                        onChange={(e) => setData('company_category_id', e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                    >
                                        <option value="">Select Industry</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id} className="dark:bg-zinc-950">{cat.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.company_category_id} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="company_logo">Company Logo</Label>
                                <Input 
                                    id="company_logo" 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setData('company_logo', e.target.files?.[0] || null)}
                                    className="bg-transparent file:bg-zinc-200 dark:file:bg-zinc-800 file:text-xs file:border-0 file:rounded file:px-2 file:mr-4 file:cursor-pointer cursor-pointer"
                                />
                                <p className="text-[10px] text-zinc-500">Square logo recommended. Max 2MB.</p>
                                <InputError message={errors.company_logo} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="company_email">Business Email (Login Email)</Label>
                                    <Input 
                                        id="company_email" 
                                        type="email" 
                                        value={data.company_email} 
                                        onChange={(e) => setData('company_email', e.target.value)} 
                                        required 
                                        className="bg-transparent"
                                    />
                                    <InputError message={errors.company_email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="company_phone">Phone Number</Label>
                                    <Input 
                                        id="company_phone" 
                                        value={data.company_phone} 
                                        onChange={(e) => setData('company_phone', e.target.value)} 
                                        className="bg-transparent"
                                    />
                                    <InputError message={errors.company_phone} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="company_address">Address</Label>
                                <Textarea 
                                    id="company_address" 
                                    value={data.company_address} 
                                    onChange={(e) => setData('company_address', e.target.value)} 
                                    rows={3} 
                                    className="bg-transparent"
                                />
                                <InputError message={errors.company_address} />
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded border border-zinc-200 dark:border-zinc-800">
                                    <p className="text-sm">
                                        Your business email is unverified. 
                                        <Button variant="link" onClick={() => send()} className="p-0 h-auto font-bold underline ml-1">
                                            Resend verification link.
                                        </Button>
                                    </p>
                                    {status === 'verification-link-sent' && (
                                        <p className="mt-2 text-xs font-medium text-green-600">Verification link has been sent.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} className="px-8">Save Changes</Button>
                            <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                <p className="text-sm text-zinc-500">Profile updated.</p>
                            </Transition>
                        </div>
                    </form>

                    <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800">
                        <DeleteUser />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}