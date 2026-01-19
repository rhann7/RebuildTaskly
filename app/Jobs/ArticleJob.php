<?php

namespace App\Jobs;

use App\Models\Article;
use App\Models\ArticleDetail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ArticleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $article, $articleDetail;

    public function __construct(ArticleDetail $articleDetail)
    {
        $this->articleDetail = $articleDetail;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //
    }
}
