<?php

namespace App\Http\Controllers\Companies;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\CompanyCategory;
use App\Models\CompanyOwner;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;

class CompanyController extends Controller
{
    private function getPageConfig(Request $request)
    {
        return [
            'title'       => 'Company Management',
            'description' => 'Manage all registered companies and their accounts.',
            'can_manage'  => $request->user()->hasRole('super-admin'),
            'options'     => [
                'categories' => CompanyCategory::select(['id', 'name'])
                ->orderBy('id')->get()
                ->map(fn($c) => ['label' => $c->name, 'value' => $c->id]),
                
                'status' => [
                    ['label' => 'Active', 'value' => 1],
                    ['label' => 'Inactive', 'value' => 0],
                ],
            ]
        ];
    }
    public function index(Request $request)
    {
        $companies = Company::with(['companyOwner', 'companyCategory'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->category && $request->category !== 'all', function ($query) use ($request) {
                $query->where('company_category_id', $request->category);
            })
            ->latest()->paginate(10)->withQueryString();

        return Inertia::render('companies/index', [
            'companies'  => $companies,
            'filters'    => $request->only(['search', 'category']),
            'pageConfig' => $this->getPageConfig($request)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email'               => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'company_owner_name'  => ['required', 'string', 'max:255'],
            'company_name'        => ['required', 'string', 'max:255'],
            'company_address'     => ['required', 'string', 'max:255'],
            'company_phone'       => ['required', 'string', 'max:20'],
            'company_category_id' => ['required', 'exists:company_categories,id'],
        ]);

        return DB::transaction (function () use ($validated) {
            $pw = str_replace(' ', '', strtolower($validated['company_name']));

            $user = User::create([
                'name'              => $validated['company_name'],
                'email'             => $validated['email'],
                'password'          => Hash::make($pw),
                'email_verified_at' => now(),
                'remember_token'    => Str::random(10),
            ])->assignRole('company');

            $company = Company::create([
                'company_owner_id'    => CompanyOwner::create([
                    'user_id' => $user->id,
                    'name'    => $validated['company_owner_name'],
                ])->id,
                'company_category_id' => $validated['company_category_id'],
                'name'                => $validated['company_name'],
                'slug'                => Str::slug($validated['company_name']),
                'email'               => $validated['email'],
                'address'             => $validated['company_address'],
                'phone'               => $validated['company_phone'],
                'is_active'           => true,
            ]);

            $permissions = Permission::where('type', 'general')
                ->whereIn('scope', ['company', 'workspace'])->pluck('id');

            if ($permissions->isNotEmpty()) {
                $company->syncPermissions($permissions);
            }

            return redirect()->route('company-management.companies.index')->with('success', "Company created. Default password: {$pw}");
        });
    }

    public function create()
    {
        return Inertia::render('companies/create', [
            'categories' => CompanyCategory::query()->select(['id', 'name'])->orderBy('id')->get(),
        ]);
    }

    public function show(Company $company)
    {
        $company->load(['companyOwner', 'companyCategory']);
        return inertia('companies/show', ['company' => $company]);
    }

    public function edit(Company $company)
    {
        return Inertia::render('companies/edit', [
            'company'    => $company->load('companyCategory', 'companyOwner'),
            'categories' => CompanyCategory::all(),
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'company_owner_name'  => 'sometimes|string|max:255',
            'company_category_id' => 'sometimes|exists:company_categories,id',
            'name'                => 'sometimes|string|max:255',
            'email'               => ['sometimes', 'email', Rule::unique('users')->ignore($company->companyOwner->user_id)],
            'phone'               => 'sometimes|string|max:20',
            'address'             => 'sometimes|string|max:255',
            'is_active'           => 'sometimes|boolean',
        ]);

        DB::transaction(function () use ($validated, $company) {
            $company->companyOwner->user->update([
                'name'  => $validated['name'],
                'email' => $validated['email'],
            ]);

            $company->companyOwner->update([
                'name' => $validated['company_owner_name']
            ]);

            $company->update([
                'name'                => $validated['name'],
                'slug'                => Str::slug($validated['name']),
                'email'               => $validated['email'],
                'phone'               => $validated['phone'],
                'address'             => $validated['address'],
                'company_category_id' => $validated['company_category_id'],
                'is_active'           => $validated['is_active'],
            ]);
        });

        return redirect()->route('company-management.companies.index')->with('success', 'All entity data updated successfully.');
    }

    public function destroy(Company $company)
    {
        DB::transaction(function () use ($company) {
            $user = $company->companyOwner->user;
            $company->delete(); 
            $user->delete(); 
        });
        
        return redirect()->back()->with('success', 'Company and associated account deleted.');
    }
}