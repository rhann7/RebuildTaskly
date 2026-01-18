<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Workspace extends Model
{
    protected $fillable = ['company_id', 'name', 'slug', 'description', 'status'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}