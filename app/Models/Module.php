<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'type',
        'scope',
        'price',
        'description',
        'is_active',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected static function booted()
    {
        static::saving(function ($module) {
            if ($module->isDirty('name')) $module->slug = str($module->name)->slug();
        });
    }

    public const TYPE_STANDARD = 'standard';
    public const TYPE_ADDON = 'addon';
    public const SCOPE_COMPANY = 'company';
    public const SCOPE_WORKSPACE = 'workspace';

    public function isAddon(): bool
    {
        return $this->type === self::TYPE_ADDON;
    }

    public function isStandard(): bool
    {
        return $this->type === self::TYPE_STANDARD;
    }

    public function isCompanyScope(): bool
    {
        return $this->scope === self::SCOPE_COMPANY;
    }

    public function isWorkspaceScope(): bool
    {
        return $this->scope === self::SCOPE_WORKSPACE;
    }

    public function permissions()
    {
        return $this->hasMany(Permission::class, 'module_id');
    }

    public function plans()
    {
        return $this->belongsToMany(Plan::class, 'plan_module');
    }

    public function invoiceAddOns()
    {
        return $this->hasMany(InvoiceAddOn::class);
    }

    public function companyAddOns()
    {
        return $this->hasMany(CompanyAddOn::class);
    }

    public function proposals()
    {
        return $this->hasMany(TicketProposal::class);
    }
}
