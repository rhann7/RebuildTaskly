<?php

namespace App\Http\Controllers\Workspaces;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Workspace;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WorkspaceController extends Controller
{
    private function resolveCompany($user)
    {
        if ($user->isSuperAdmin()) return null;

        $company = $user->company ?? $user->companyOwner?->company;
        abort_if(!$company, 403, 'Anda tidak terikat dengan perusahaan manapun.');

        return $company;
    }

    private function authorizeWorkspace($user, Workspace $workspace)
    {
        if ($user->isSuperAdmin()) return;
    
        $company = $this->resolveCompany($user);

        // Cek 1: Pastikan workspace punya perusahaan yang sama
        abort_if($workspace->company_id !== $company->id, 403);

        // Cek 2: Logic Akses (Owner, Manager, atau Member)
        if (!$user->hasRole('company')) {
            // Cek apakah dia manager
            $isManager = $workspace->manager_id === $user->id;
            
            // Cek apakah dia member (terdaftar di pivot table)
            $isMember = $workspace->members()->where('user_id', $user->id)->exists();

            if (!$isManager && !$isMember) {
                abort(403, 'Anda tidak memiliki akses ke workspace ini.');
            }
        }
    }

    private function getPageConfig(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);
        $canManage = $user->isSuperAdmin() || ($company && $company->hasPermissionTo('access-workspaces'));

        return [
            'title'       => $user->isSuperAdmin() ? 'Workspace Management' : 'My Workspaces',
            'description' => 'Manage and organize team collaboration environments.',
            'can_manage'  => $canManage,
            'options'     => [
                'statuses' => [
                    ['label' => 'Active', 'value' => 'active'],
                    ['label' => 'Inactive', 'value' => 'inactive'],
                ],
            ]
        ];
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        $workspaces = Workspace::query()
            // 1. Filter: Cek satu company (kecuali Super Admin)
            ->when(!$user->isSuperAdmin(), fn ($q) => $q->where('company_id', $company->id))

            /** * 2. Logic Akses: 
             * Jika bukan Super Admin atau role Company (Owner), 
             * maka tampilkan workspace yang dia adalah managernya ATAU dia adalah member didalamnya.
             */
            ->when(!$user->isSuperAdmin() && !$user->hasRole('company'), function ($q) use ($user) {
                return $q->where(function ($query) use ($user) {
                    $query->where('manager_id', $user->id) // Dia Manager-nya
                        ->orWhereHas('members', function ($sub) use ($user) { // Atau dia Member-nya
                            $sub->where('user_id', $user->id);
                        });
                });
            })
            
            ->with('company:id,name')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('workspaces/index', [
            'workspaces'   => $workspaces,
            'filters'      => $request->only(['search']),
            'isSuperAdmin' => $user->isSuperAdmin(),
            'pageConfig'   => $this->getPageConfig($request),
            'companies'    => $user->isSuperAdmin() 
                ? Company::select('id', 'name')->orderBy('name')->get() 
                : []
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        $validated = $request->validate([
            'company_id'  => $user->isSuperAdmin() ? 'required|exists:companies,id' : 'nullable',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Workspace::create([
            'company_id'  => $user->isSuperAdmin() ? $validated['company_id'] : $company->id,
            'name'        => $validated['name'],
            'slug'        => Str::slug($validated['name']) . '-' . Str::lower(Str::random(5)),
            'description' => $validated['description'],
            'status'      => 'active',
        ]);

        return back()->with('success', 'Workspace created successfully.');
    }

    public function show(Request $request, Workspace $workspace)
    {
        $this->authorizeWorkspace($request->user(), $workspace);

        $projects = $workspace->projects()->latest()->get();

        // 1. Ambil data Manager dari relasi manager_id
        $manager = $workspace->manager; // Pastikan relasi 'manager' ada di model Workspace
        
        // 2. Ambil data Members (karyawan yang di-invite)
        $members = $workspace->members()
            ->with('roles')
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles,
                'joined_at' => $user->pivot->created_at->format('d M Y'),
                'is_manager' => false,
            ]);

        // 3. Gabungkan Manager ke baris paling atas
        if ($manager) {
            $managerData = [
                'id' => $manager->id,
                'name' => $manager->name,
                'email' => $manager->email,
                'roles' => $manager->roles,
                'joined_at' => $workspace->created_at->format('d M Y'), // Pake tgl workspace dibuat
                'is_manager' => true, // Flag khusus buat nandain dia Manager
            ];
            
            // Masukkan manager ke urutan pertama
            $members->prepend($managerData);
        }

        $allEmployees = User::where('company_id', $workspace->company_id)
            ->where('id', '!=', $workspace->manager_id) // Jangan invite manager sendiri
            ->whereDoesntHave('workspaces', function($q) use ($workspace) {
                $q->where('workspace_id', $workspace->id);
            })
            ->get(['id', 'name', 'email']);

        return Inertia::render('workspaces/show', [
            'workspace'    => $workspace->load('company:id,name'),
            'projects'     => $projects,
            'members'      => $members,
            'allEmployees' => $allEmployees,
            'isSuperAdmin' => $request->user()->isSuperAdmin(),
        ]);
    }

    public function update(Request $request, $slug)
    {
        $workspace = Workspace::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        // 1. CEK OTORITAS ROLE (Pagar Utama)
        // Pastikan hanya role yang berwenang yang bisa tembus
        if (!$user->isSuperAdmin() && !$user->hasAnyRole(['company', 'owner', 'manager'])) {
            abort(403, 'ACCESS DENIED: Your role is not authorized to reconfigure this workspace.');
        }

        // 2. Cek apakah workspace ini milik company si user (kalo dia bukan superadmin)
        if (!$user->isSuperAdmin()) {
            // Asumsi user punya company_id atau relasi ke company
            $companyId = $user->company_id ?? $user->companyOwner?->id;
            if ($workspace->company_id !== $companyId) {
                abort(403, 'UNAUTHORIZED: You can only manage workspaces within your own entity.');
            }
        }

        // Tetep pake fungsi lama lo buat backup logic
        $this->authorizeWorkspace($user, $workspace);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'required|in:active,inactive',
            // Proteksi tambahan: kalo bukan superadmin, paksa pake company_id yang sudah ada
            'company_id'  => $user->isSuperAdmin() ? 'required|exists:companies,id' : 'nullable',
        ]);

        // Jika bukan superadmin, hapus company_id dari array validated biar gak bisa "nembak" ganti company
        if (!$user->isSuperAdmin()) {
            unset($validated['company_id']);
        }

        $updated = $workspace->update($validated);

        \Log::info('Update Result for Slug '.$slug.': ' . ($updated ? 'Success' : 'Failed'));

        return back()->with('success', 'Workspace protocol synchronized.');
    }

    public function destroy(Request $request, Workspace $workspace)
    {
        $this->authorizeWorkspace($request->user(), $workspace);
    
        $workspace->delete();

        // Sesuai route: Route::resource('workspaces', ...)
        return redirect()->route('workspaces.index')
                        ->with('success', 'Workspace deleted successfully.');
    }

    public function addMember(Request $request, Workspace $workspace)
    {
        // Validasi: User yang diinvite harus ada di company yang sama
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $userToInvite = User::findOrFail($request->user_id);
        $workspace->members()->syncWithoutDetaching([$request->user_id]);
        // Cek apakah user yang mau diinvite satu company sama workspace-nya
        if ($userToInvite->company_id !== $workspace->company_id) {
            return back()->with('error', 'User tidak berasal dari perusahaan yang sama.');
        }

        // Attach ke pivot table (pake syncWithoutDetaching biar gak double)
        $workspace->members()->syncWithoutDetaching([$request->user_id]);

        return back()->with('success', 'Karyawan berhasil ditambahkan ke workspace.');
    }
}