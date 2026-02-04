<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyAppeal extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'email',
        'message',
        'status',
        'reason',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}