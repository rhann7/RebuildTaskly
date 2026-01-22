<?php

namespace App\Http\Controllers\Companies;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\CompanyCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CompanyController extends Controller
{
    private function getPageConfig(Request $request)
    {
        return [
            'title'       => 'Company Management',
            'description' => 'Manage all registered companies and their accounts.',
            'can_manage'  => $request->user()->isSuperAdmin(),
            'options'     => [
                'categories' => CompanyCategory::select(['id', 'name'])
                    ->orderBy('id')
                    ->get()
                    ->map(fn($c) => ['label' => $c->name, 'value' => $c->id]),
                
                'status' => [
                    ['label' => 'Active', 'value' => 1],
                    ['label' => 'Inactive', 'value' => 0],
                ]
            ]
        ];
    }

    public function index(Request $request)
    {
        $companies = Company::query()
            ->with(['user', 'category'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->status !== null && $request->status !== 'all', function ($q) use ($request) {
                $q->where('is_active', $request->status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('companies/index', [
            'companies'  => $companies,
            'filters'    => $request->only(['search', 'status']),
            'pageConfig' => $this->getPageConfig($request),
        ]);
    }

    public function store(Request $request, CreateNewUser $createNewUser)
    {
        $randomSuffix = Str::lower(Str::random(5));
        $pw = str_replace(' ', '', strtolower($request->company_name)) . $randomSuffix;

        $request->merge([
            'password' => $pw,
            'password_confirmation' => $pw,
        ]);

        $createNewUser->create($request->all());
        return back()->with('success', "Company berhasil dibuat. Password default: {$pw}");
    }

    public function show(Company $company)
    {
        return inertia('companies/show', [
            'company' => $company->load(['category', 'user']),
            'pageConfig' => [
                'title' => 'Company Profile: ' . $company->name,
            ]
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate(['is_active' => 'required|boolean']);
        $company->update(['is_active' => $validated['is_active']]);

        if ($company->wasChanged('is_active')) Cache::forget("company-{$company->id}-permissions");
        return back()->with('success', "Company status updated to " . ($validated['is_active'] ? 'Active' : 'Inactive'));
    }

    public function destroy(Company $company)
    {
        DB::transaction(function () use ($company) {
            $user = $company->user;

            Cache::forget("company-{$company->id}-permissions");

            if ($company->logo) Storage::disk('public')->delete('logos/' . $company->logo);

            $company->delete(); 
            if ($user) $user->delete();
        });
        
        return back()->with('success', 'Company and associated user account have been permanently deleted.');
    }
}