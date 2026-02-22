<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\ArticleDetail;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories first
        $categories = [
            ['name' => 'Panduan Pengguna', 'created_by' => 'System'],
            ['name' => 'Troubleshooting', 'created_by' => 'System'],
            ['name' => 'Tutorial', 'created_by' => 'System'],
            ['name' => 'FAQ', 'created_by' => 'System'],
            ['name' => 'Dokumentasi API', 'created_by' => 'System'],
        ];

        foreach ($categories as $category) {
            ArticleCategory::firstOrCreate(['name' => $category['name']], $category);
        }

        // Get category IDs
        $panduanId = ArticleCategory::where('name', 'Panduan Pengguna')->first()->id;
        $troubleshootingId = ArticleCategory::where('name', 'Troubleshooting')->first()->id;
        $tutorialId = ArticleCategory::where('name', 'Tutorial')->first()->id;
        $faqId = ArticleCategory::where('name', 'FAQ')->first()->id;

        // Sample articles
        $articles = [
            [
                'name' => 'Cara Login ke Sistem',
                'tag_code' => 'login-guide',
                'status' => 'published',
                'view_count' => 150,
                'device_type' => 'web',
                'category_article_id' => $panduanId,
                'created_by' => 'System',
                'description' => "Panduan lengkap cara login ke sistem:\n\n1. Buka browser dan akses URL aplikasi\n2. Masukkan email yang terdaftar\n3. Masukkan password Anda\n4. Klik tombol 'Login'\n5. Jika berhasil, Anda akan diarahkan ke dashboard\n\nTips:\n- Pastikan email dan password benar (case-sensitive)\n- Jika lupa password, klik 'Lupa Password'\n- Gunakan browser Chrome atau Firefox untuk hasil terbaik",
            ],
            [
                'name' => 'Cara Reset Password',
                'tag_code' => 'reset-password',
                'status' => 'published',
                'view_count' => 230,
                'device_type' => 'web',
                'category_article_id' => $panduanId,
                'created_by' => 'System',
                'description' => "Langkah-langkah reset password:\n\n1. Di halaman login, klik link 'Lupa Password'\n2. Masukkan email yang terdaftar\n3. Cek email Anda, akan ada link reset password\n4. Klik link tersebut (berlaku 60 menit)\n5. Masukkan password baru (min 8 karakter)\n6. Konfirmasi password baru\n7. Klik 'Reset Password'\n8. Login dengan password baru Anda\n\nCatatan: Jika tidak menerima email dalam 5 menit, cek folder spam atau hubungi admin.",
            ],
            [
                'name' => 'Mengatasi Error 500 Internal Server Error',
                'tag_code' => 'error-500',
                'status' => 'published',
                'view_count' => 89,
                'device_type' => 'web',
                'category_article_id' => $troubleshootingId,
                'created_by' => 'System',
                'description' => "Solusi untuk mengatasi Error 500:\n\n**Penyebab Umum:**\n- Cache browser yang korup\n- Session expired\n- Masalah server sementara\n- File upload terlalu besar\n\n**Langkah Perbaikan:**\n1. Refresh halaman (F5 atau Ctrl+R)\n2. Clear cache browser:\n   - Chrome: Ctrl+Shift+Delete\n   - Firefox: Ctrl+Shift+Delete\n3. Logout dan login kembali\n4. Coba browser lain (Chrome/Firefox)\n5. Restart browser Anda\n\n**Jika masih error:**\n- Tunggu 5-10 menit dan coba lagi\n- Screenshot pesan error\n- Hubungi tim support dengan info error",
            ],
            [
                'name' => 'Cara Export Laporan ke PDF',
                'tag_code' => 'export-pdf',
                'status' => 'published',
                'view_count' => 320,
                'device_type' => 'web',
                'category_article_id' => $tutorialId,
                'created_by' => 'System',
                'description' => "Tutorial export laporan ke format PDF:\n\n**Langkah-langkah:**\n1. Buka menu 'Laporan' di sidebar kiri\n2. Pilih jenis laporan yang ingin di-export\n3. (Opsional) Atur filter tanggal/kategori\n4. Klik tombol 'Export' (ikon download) di pojok kanan atas\n5. Pilih format 'PDF' dari dropdown\n6. Klik 'Download'\n7. File akan tersimpan di folder Downloads\n\n**Customize Layout:**\n- Klik ikon Settings (⚙️) sebelum export\n- Pilih orientasi (Portrait/Landscape)\n- Pilih ukuran kertas (A4/Letter)\n- Enable/disable header/footer\n\n**Tips:**\n- Untuk laporan besar, gunakan filter agar file tidak terlalu besar\n- Format PDF cocok untuk print dan arsip\n- Gunakan format Excel jika ingin edit data",
            ],
            [
                'name' => 'Cara Menambah User Baru',
                'tag_code' => 'add-user',
                'status' => 'published',
                'view_count' => 175,
                'device_type' => 'web',
                'category_article_id' => $tutorialId,
                'created_by' => 'System',
                'description' => "Panduan menambah user baru ke sistem:\n\n**Persyaratan:**\n- Anda harus memiliki role Admin atau Super Admin\n- Akses ke menu User Management\n\n**Langkah-langkah:**\n1. Masuk ke menu 'User Management' → 'Users'\n2. Klik tombol 'Tambah User' (+)\n3. Isi form:\n   - Nama lengkap\n   - Email (harus unique)\n   - Password (min 8 karakter)\n   - Pilih Role (User/Admin)\n   - Pilih Workspace (jika ada)\n4. Klik 'Simpan'\n5. User akan menerima email notifikasi\n\n**Pengaturan Role:**\n- User: Akses terbatas, hanya data sendiri\n- Admin: Akses penuh ke workspace\n- Super Admin: Akses ke seluruh sistem\n\n**Catatan:** User baru harus verifikasi email sebelum bisa login.",
            ],
            [
                'name' => 'Mengatasi Masalah Login Gagal',
                'tag_code' => 'login-failed',
                'status' => 'published',
                'view_count' => 198,
                'device_type' => 'web',
                'category_article_id' => $troubleshootingId,
                'created_by' => 'System',
                'description' => "Solusi untuk masalah login gagal:\n\n**Penyebab & Solusi:**\n\n1. **Password Salah**\n   - Pastikan Caps Lock tidak aktif\n   - Password case-sensitive\n   - Gunakan 'Forgot Password' jika lupa\n\n2. **Email Tidak Terdaftar**\n   - Periksa ejaan email\n   - Hubungi admin untuk cek registrasi\n\n3. **Akun Belum Diverifikasi**\n   - Cek email verifikasi\n   - Klik link aktivasi\n   - Minta resend email jika expired\n\n4. **Akun Dinonaktifkan**\n   - Hubungi admin perusahaan\n   - Mungkin akses ditarik\n\n5. **Browser Issue**\n   - Clear cookies & cache\n   - Coba incognito/private mode\n   - Gunakan browser berbeda\n\n**Masih bermasalah?**\nHubungi support dengan info:\n- Email yang digunakan\n- Pesan error yang muncul\n- Screenshot (jika ada)",
            ],
            [
                'name' => 'Apa itu Workspace?',
                'tag_code' => 'workspace-intro',
                'status' => 'published',
                'view_count' => 145,
                'device_type' => 'web',
                'category_article_id' => $faqId,
                'created_by' => 'System',
                'description' => "**Workspace** adalah ruang kerja virtual yang memisahkan data dan akses antar divisi/departemen dalam satu sistem.\n\n**Fungsi Workspace:**\n- Memisahkan data antar tim/divisi\n- Mengatur akses user per workspace\n- Mengelola permission secara terpisah\n- Multi-tenancy dalam satu platform\n\n**Contoh Penggunaan:**\n- Perusahaan dengan banyak cabang\n- Organisasi dengan banyak divisi\n- Agency yang mengelola banyak klien\n\n**Benefit:**\n✅ Data terisolasi dan aman\n✅ Manajemen user lebih mudah\n✅ Satu akun bisa akses banyak workspace\n✅ Fleksibel untuk berbagai kebutuhan\n\n**Cara Mengakses:**\n1. Login ke sistem\n2. Jika Anda member dari beberapa workspace, akan muncul pilihan\n3. Pilih workspace yang ingin diakses\n4. Atau switch workspace dari menu profil",
            ],
            [
                'name' => 'Cara Menggunakan Dashboard',
                'tag_code' => 'dashboard-guide',
                'status' => 'published',
                'view_count' => 267,
                'device_type' => 'web',
                'category_article_id' => $panduanId,
                'created_by' => 'System',
                'description' => "Panduan menggunakan Dashboard:\n\n**Komponen Dashboard:**\n\n1. **Sidebar Navigasi (Kiri)**\n   - Menu utama aplikasi\n   - Dapat dikollapse untuk space lebih luas\n   - Hover untuk melihat label\n\n2. **Top Bar (Atas)**\n   - Search global\n   - Notifikasi\n   - Profile menu\n   - Settings\n\n3. **Main Content (Tengah)**\n   - Widget statistik\n   - Grafik/chart\n   - Quick actions\n   - Recent activities\n\n4. **Widget Cards**\n   - Total users\n   - Active sessions\n   - Recent logs\n   - Performance metrics\n\n**Tips Penggunaan:**\n- Klik widget untuk detail lebih lanjut\n- Gunakan date range filter untuk data spesifik\n- Export data langsung dari dashboard\n- Customize widget sesuai kebutuhan (coming soon)\n\n**Keyboard Shortcuts:**\n- `/` - Focus search\n- `Ctrl+K` - Command palette\n- `Esc` - Close modal/dialog",
            ],
        ];

        foreach ($articles as $articleData) {
            $description = $articleData['description'];
            unset($articleData['description']);

            // Create or update article
            $article = Article::firstOrCreate(
                ['tag_code' => $articleData['tag_code']],
                $articleData
            );

            // Create article detail
            ArticleDetail::firstOrCreate(
                ['article_id' => $article->id],
                [
                    'article_id' => $article->id,
                    'description' => $description,
                    'created_by' => 'System',
                ]
            );
        }

        $this->command->info('✅ Articles seeded successfully!');
        $this->command->info('   - ' . count($categories) . ' categories created');
        $this->command->info('   - ' . count($articles) . ' articles created');
    }
}
