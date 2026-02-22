<?php

namespace Database\Seeders;

use App\Models\ArticleKeySearch;
use App\Models\ArticleKeyword;
use App\Models\User;
use Illuminate\Database\Seeder;

class ArticleAnalyticsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample keywords
        $keywords = [
            ['name' => 'login error', 'rate_keyword' => 8.5],
            ['name' => 'password reset', 'rate_keyword' => 7.2],
            ['name' => 'export pdf', 'rate_keyword' => 6.8],
            ['name' => 'error 500', 'rate_keyword' => 9.1],
            ['name' => 'add user', 'rate_keyword' => 5.5],
            ['name' => 'workspace settings', 'rate_keyword' => 4.3],
            ['name' => 'dashboard not loading', 'rate_keyword' => 7.9],
            ['name' => 'permission denied', 'rate_keyword' => 8.2],
        ];

        $createdKeywords = [];
        foreach ($keywords as $keyword) {
            $createdKeywords[] = ArticleKeyword::create($keyword);
        }

        // Get first user for testing (or create one)
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        // Device types for simulation
        $devices = [
            'Windows 10 Desktop',
            'iPhone 15 Pro',
            'Android Samsung Galaxy',
            'MacBook Pro',
            'iPad Pro',
            'Windows 11 Laptop',
            'Android Xiaomi',
            'iPhone 13',
        ];

        // Create search history with varying patterns
        $searchData = [
            // Simulate high activity on Windows 10 Desktop (potential issue)
            ['keyword_index' => 0, 'device' => 'Windows 10 Desktop', 'count' => 45], // login error
            ['keyword_index' => 3, 'device' => 'Windows 10 Desktop', 'count' => 38], // error 500
            ['keyword_index' => 6, 'device' => 'Windows 10 Desktop', 'count' => 32], // dashboard not loading

            // Medium activity on mobile devices
            ['keyword_index' => 1, 'device' => 'iPhone 15 Pro', 'count' => 22], // password reset
            ['keyword_index' => 2, 'device' => 'iPhone 15 Pro', 'count' => 18], // export pdf
            ['keyword_index' => 0, 'device' => 'Android Samsung Galaxy', 'count' => 25], // login error

            // Low activity on other devices
            ['keyword_index' => 4, 'device' => 'MacBook Pro', 'count' => 12], // add user
            ['keyword_index' => 5, 'device' => 'iPad Pro', 'count' => 8], // workspace settings
            ['keyword_index' => 7, 'device' => 'Windows 11 Laptop', 'count' => 15], // permission denied

            // Additional scattered searches
            ['keyword_index' => 3, 'device' => 'Android Xiaomi', 'count' => 10], // error 500
            ['keyword_index' => 1, 'device' => 'iPhone 13', 'count' => 14], // password reset
        ];

        foreach ($searchData as $data) {
            $keyword = $createdKeywords[$data['keyword_index']];

            // Create multiple search records to simulate the count
            for ($i = 0; $i < $data['count']; $i++) {
                ArticleKeySearch::create([
                    'article_keyword_id' => $keyword->id,
                    'users_id' => $user->id,
                    'device_type' => $data['device'],
                    'search_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
                ]);
            }
        }

        $this->command->info('Article analytics sample data created successfully!');
        $this->command->info('- Created ' . count($keywords) . ' keywords');
        $this->command->info('- Created ' . array_sum(array_column($searchData, 'count')) . ' search records');
        $this->command->info('- Windows 10 Desktop has high search activity (simulated issue)');
    }
}
