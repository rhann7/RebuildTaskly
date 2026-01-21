<?php

namespace App\Http\Controllers\Companies;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\CompanyCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
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
            ->with(['companyOwner.user'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery->where('name', 'like', "%{$search}%")
                        ->orWhereHas('companyOwner.user', function ($userQuery) use ($search) {
                            $userQuery->where('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->status && $request->status !== 'all', function ($q) use ($request) {
                $q->where('is_active', $request->status);
            })
            ->orderBy('id')
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
        $randomSuffix = Str::lower(Str::random(2));
        $pw = str_replace(' ', '', strtolower($request->company_name)) . $randomSuffix;

        $request->merge([
            'password' => $pw,
            'password_confirmation' => $pw,
        ]);

        $createNewUser->create($request->all());
        return redirect()->route('company-management.companies.index')->with('success', "Company created. Default password: {$pw}");
    }

    public function create()
    {
        return Inertia::render('companies/create', [
            'categories' => CompanyCategory::query()->select(['id', 'name'])->orderBy('id')->get(),
        ]);
    }

    public function show(Company $company)
    {
        $company->load([
            'companyOwner', 
            'companyCategory', 
            'workspaces' => function($query) {
                $query->select('id', 'company_id', 'name', 'slug', 'created_at');
            }
        ]);

        return inertia('companies/show', ['company' => $company]);
    }

    public function edit(Company $company)
    {
        return Inertia::render('companies/edit', [
            'company'      => $company->load('companyCategory', 'companyOwner.user'),
            'categories'   => CompanyCategory::select(['id', 'name'])->get(),
            'isSuperAdmin' => true,
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean'
        ]);

        DB::transaction(function () use ($validated, $company) {
            $oldStatus = $company->is_active;
            
            $company->update([
                'is_active' => $validated['is_active']
            ]);

            if ($oldStatus == 1 && $company->is_active == 0) {
                Cache::forget("company-{$company->id}-permissions");
            }
        });

        return redirect()->route('company-management.companies.show', $company->slug)->with('success', "Company updated successfully.");
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        abort_if(!$user->company, 403, 'Anda tidak memiliki profil perusahaan.');

        $company = Auth::user()->company->load('companyOwner');

        $validated = $request->validate([
            'company_category_id' => ['required', 'exists:company_categories,id'],
            'company_owner_name'  => ['required', 'string', 'max:255'],
            'phone'               => ['required', 'string', 'max:20'],
            'address'             => ['required', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($company, $validated) {
            $company->companyOwner()->update([
                'name' => $validated['company_owner_name']
            ]);

            $company->update([
                'company_category_id' => $validated['company_category_id'],
                'phone'               => $validated['phone'],
                'address'             => $validated['address'],
            ]);
        });

        return back()->with('success', 'Informasi bisnis berhasil diperbarui.');
    }

    public function destroy(Company $company)
    {
        DB::transaction(function () use ($company) {
            $user = $company->companyOwner->user ?? null;

            Cache::forget("company-{$company->id}-permissions");
            
            $company->delete(); 
            if ($user) $user->delete();
        });
        
        return redirect()->route('company-management.companies.index')->with('success', 'Company and associated user account have been permanently deleted.');
    }
}