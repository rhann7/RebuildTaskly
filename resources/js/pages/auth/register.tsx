import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, ChangeEvent } from 'react';

import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = {
    id: number;
    name: string;
};

export default function Register({ categories }: { categories: Category[] }) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        company_logo: null as File | null,
        company_name: '',
        company_phone: '',
        company_address: '',
        company_category_id: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('company_logo', file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setLogoPreview(null);
        }
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register', {
            forceFormData: true,
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Register Company"
            description="Create your company account to get started"
        >
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-6">
                <div className="flex flex-col items-center gap-4 space-y-2">
                    <Label htmlFor="company_logo" className="self-start">Company Logo (Optional)</Label>
                    <div className="flex w-full items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xs text-muted-foreground text-center p-1">No Logo</span>
                            )}
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Input
                                id="company_logo"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                JPG, PNG (Max. 2MB)
                            </p>
                        </div>
                    </div>
                    <InputError message={errors.company_logo} className="self-start" />
                </div>

                <div className="grid gap-2">
                    <div className="grid gap-2">
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                            id="company_name"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            required
                            autoFocus
                            placeholder="Legal company name"
                        />
                        <InputError message={errors.company_name} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="company_address">Company Address</Label>
                    <Input
                        id="company_address"
                        value={data.company_address}
                        onChange={(e) => setData('company_address', e.target.value)}
                        required
                        placeholder="Street address, City, Postal Code"
                    />
                    <InputError message={errors.company_address} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="company_phone">Business Phone</Label>
                        <Input
                            id="company_phone"
                            value={data.company_phone}
                            onChange={(e) => setData('company_phone', e.target.value)}
                            required
                            placeholder="WhatsApp enabled"
                        />
                        <InputError message={errors.company_phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Business Category</Label>
                        <Select 
                            onValueChange={(value) => setData('company_category_id', value)}
                            defaultValue={data.company_category_id}
                        >
                            <SelectTrigger className="w-full text-black dark:text-white">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.company_category_id} />
                    </div>
                </div>
                
                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Account Credentials
                        </span>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        placeholder="name@company.com"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="Min. 8 characters"
                        />
                        <InputError message={errors.password} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="Retype password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing && <Spinner className="mr-2" />}
                    Create Account
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href="/login">Log in</TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}