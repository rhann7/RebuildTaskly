import AuthLayout from '@/layouts/auth-layout';
import { FormEvent } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Send, Clock, AlertCircle, RefreshCcw, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';

interface AppealProps {
    lastAppeal?: {
        status: 'pending' | 'approved' | 'rejected';
        message: string;
        reason: string;
    };
    reason: string;
}

export default function CompanyAppeal({ lastAppeal, reason }: AppealProps) {
    const { auth } = usePage().props as any;

    const { data, setData, post, processing, errors } = useForm({
        message: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/appeals');
    };

    return (
        <AuthLayout 
            title="Pusat Banding Akun" 
            description="Layanan pemulihan akses akun perusahaan"
        >
            <Head title="Ajukan Banding" />

            <div className="space-y-6">
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex gap-3 items-start">
                        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wider">Akses Ditangguhkan</p>
                            <p className="text-sm opacity-90 mt-1 leading-relaxed">
                                Akun Anda dinonaktifkan sementara oleh sistem karena: <span className="font-semibold italic">"{reason}"</span>
                            </p>
                        </div>
                    </div>
                </div>

                {lastAppeal?.status === 'pending' ? (
                    <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-2xl bg-muted/30 text-center animate-in zoom-in-95 duration-500">
                        <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                            <Clock className="h-7 w-7 text-yellow-600 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-bold">Banding Sedang Ditinjau</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-[300px] leading-relaxed">
                            Permohonan Anda sudah kami terima dan sedang dalam antrean verifikasi oleh Super Admin. 
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-4 italic">
                            Silakan refresh halaman ini secara berkala untuk melihat perubahan status.
                        </p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-6 hover:bg-background" 
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Status
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-6 animate-in fade-in duration-700">
                        {lastAppeal?.status === 'rejected' && (
                            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-sm">
                                <div className="flex gap-2 items-start">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-red-700">Banding Terakhir Ditolak</p>
                                        <p className="mt-1 italic opacity-90">" {lastAppeal.reason} "</p>
                                        <p className="mt-3 text-[11px] font-medium text-red-600 uppercase tracking-tighter">
                                            Anda masih bisa mengajukan banding kembali dengan penjelasan yang lebih lengkap.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest opacity-60">Email Perusahaan</Label>
                                <Input 
                                    id="email" 
                                    value={auth.user.email} 
                                    disabled 
                                    className="bg-muted/50 border-dashed cursor-not-allowed font-medium"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest opacity-60">Pesan Pembelaan</Label>
                                <Textarea 
                                    id="message" 
                                    value={data.message} 
                                    onChange={e => setData('message', e.target.value)}
                                    placeholder="Jelaskan secara jelas mengapa akun Anda harus diaktifkan kembali..."
                                    className="min-h-[160px] resize-none focus-visible:ring-destructive"
                                    required
                                />
                                <InputError message={errors.message} />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11" disabled={processing}>
                            {processing ? 'Sedang Mengirim...' : 'Kirim Pengajuan Banding'}
                            <Send className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}