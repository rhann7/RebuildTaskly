<?php

namespace App\Http\Controllers\Companies;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\CompanyCategory;
use App\Models\CompanyOwner;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $query = Company::with(['companyOwner', 'companyCategory']);
        
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }
        
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('company_category_id', $request->category);
        }

        $categories = CompanyCategory::query()->select(['id', 'name'])->orderBy('id')->get();

        return Inertia::render('companies/index', [
            'companies'  => $query->latest()->paginate(10)->withQueryString(),
            'categories' => $categories,
            'filters'    => $request->only(['search', 'category']),
        ]);
    }

    public function show(Company $company)
    {
        $company->load(['companyOwner', 'companyCategory']);
        return inertia('companies/show', ['company' => $company]);
    }

    public function create()
    {
        return Inertia::render('companies/create', [
            'categories' => CompanyCategory::query()->select(['id', 'name'])->orderBy('id')->get(),
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

        $pw = str_replace(' ', '', strtolower($validated['company_name']));

        $user = User::create([
            'name'              => $validated['company_name'],
            'email'             => $validated['email'],
            'password'          => Hash::make($pw),
            'email_verified_at' => now(),
            'remember_token'    => Str::random(10),
        ]);

        $owner = CompanyOwner::create([
            'user_id' => $user->id,
            'name'    => $validated['company_owner_name'],
        ]);

        $company = Company::create([
            'company_owner_id'    => $owner->id,
            'company_category_id' => $validated['company_category_id'],
            'name'                => $validated['company_name'],
            'slug'                => Str::slug($validated['company_name']),
            'email'               => $validated['email'],
            'address'             => $validated['company_address'],
            'phone'               => $validated['company_phone'],
            'is_active'           => true,
        ]);

        $user->assignRole('company-owner');
        
        $generalPermissions = Permission::where('type', 'general')->get();
        if ($generalPermissions->count() > 0) {
            $company->givePermissionTo($generalPermissions);
        }

        return redirect()->route('companies.index')->with('success', 'Company created successfully.');
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
            'company_owner_name'  => 'required|string|max:255',
            'name'                => 'required|string|max:255',
            'email'               => ['required', 'email', Rule::unique('users')->ignore($company->companyOwner->user_id)],
            'phone'               => 'required|string|max:20',
            'address'             => 'required|string|max:255',
            'company_category_id' => 'required|exists:company_categories,id',
            'is_active'           => 'required',
        ]);

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
            'is_active'           => $request->boolean('is_active'),
        ]);

        return redirect()->route('companies.index')->with('success', 'Company, Owner, and Login account updated successfully.');
    }

    public function destroy(Company $company)
    {
        $company->delete();
        $company->companyOwner->user->delete();
        
        return redirect()->back()->with('success', 'Company deleted successfully.');
    }
}