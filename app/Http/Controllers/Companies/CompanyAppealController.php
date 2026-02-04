<?php

namespace App\Http\Controllers\Companies;

use App\Http\Controllers\Controller;
use App\Models\CompanyAppeal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CompanyAppealController extends Controller
{
    private function getPageConfig(Request $request)
    {
        return [
            'title'       => 'Company Appeals',
            'description' => 'Review and manage account reactivation requests from suspended companies.',
            'can_manage'  => $request->user()->isSuperAdmin(),
            'options'     => [
                'statuses' => [
                    ['label' => 'All Appeals', 'value' => 'all'],
                    ['label' => 'Pending', 'value' => 'pending'],
                    ['label' => 'Approved', 'value' => 'approved'],
                    ['label' => 'Rejected', 'value' => 'rejected'],
                ],
            ]
        ];
    }

    public function index(Request $request)
    {
        $appeals = CompanyAppeal::with('company:id,name,slug')
            ->when($request->search, function ($query, $search) {
                $query->whereHas('company', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('companies/appeals', [
            'appeals'    => $appeals,
            'filters'    => $request->only(['search', 'status']),
            'pageConfig' => $this->getPageConfig($request)
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        $lastAppeal = CompanyAppeal::where('company_id', $user->company->id)
            ->latest()
            ->first();

        if ($lastAppeal && $lastAppeal->status === 'approved') return redirect()->route('dashboard');

        return Inertia::render('auth/company-appeal', [
            'lastAppeal' => $lastAppeal,
            'reason'     => $user->company->reason,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'message' => 'required|string|min:20',
        ]);

        $hasPending = CompanyAppeal::where('company_id', $user->company->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPending) return back()->withErrors(['message' => 'Banding Anda sebelumnya masih dalam proses tinjauan.']);

        CompanyAppeal::create([
            'company_id' => $user->company->id,
            'email'      => $user->email,
            'message'    => $request->message,
            'status'     => 'pending',
        ]);

        return back()->with('success', 'Banding berhasil dikirim. Silakan cek berkala.');
    }

    public function update(Request $request, CompanyAppeal $appeal)
    {
        $validated = $request->validate([
            'status'     => 'required|in:approved,rejected',
            'reason'     => 'required_if:status,rejected|nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($appeal, $validated) {
            $appeal->update($validated);

            if ($validated['status'] === 'approved') {
                $appeal->company->update([
                    'is_active' => true,
                    'reason'    => null
                ]);
                
                Cache::forget("company-{$appeal->company_id}-permissions");
            }
        });

        return back()->with('success', 'Status banding telah diperbarui.');
    }
}