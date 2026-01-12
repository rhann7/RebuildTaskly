<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }
}