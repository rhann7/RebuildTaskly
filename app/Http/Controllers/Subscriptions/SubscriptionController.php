<?php

namespace App\Http\Controllers\Subscriptions;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $subscriptions = Subscription::query()
            ->with(['company', 'plan', 'invoice'])
            ->when($request->search, fn($q, $s) => $q->whereHas('company', fn($q) => $q->where('name', 'like', "%{$s}%")))
            ->when($request->status, function ($q, $s) {
                if ($s === 'active')     return $q->active();
                if ($s === 'expired')    return $q->expired();
                if ($s === 'overridden') return $q->where('status', 'overridden');
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('subscriptions/index', [
            'subscriptions' => $this->transformSubscriptions($subscriptions),
            'filters'       => $request->only(['search', 'status']),
            'pageConfig'    => $this->getPageConfig($request),
        ]);
    }

    public function show(Request $request, Subscription $subscription)
    {
        $subscription->load(['company', 'plan', 'invoice']);

        return Inertia::render('subscriptions/show', [
            'subscription' => $this->transformSingleSubscription($subscription),
            'pageConfig'   => [
                'title'       => 'Subscription Detail',
                'description' => 'View subscription details.',
                'can_manage'  => $request->user()->isSuperAdmin(),
            ],
        ]);
    }

    public function billing(Request $request)
    {
        $user = $request->user();
        if ($user->isSuperAdmin() && !app('impersonate')->isImpersonating()) {
            return redirect()->route('dashboard')
                ->with('error', 'Super Admin tidak memiliki data billing pribadi.');
        }

        $company = $user->company;

        $subscription = Subscription::forCompany($company->id)
            ->with(['plan.modules' => fn($q) => $q->where('is_active', true)])
            ->latest()
            ->first();

        return Inertia::render('billings/index', [
            'subscription' => $subscription ? $this->transformBilling($subscription) : null,
            'company'      => [
                'id'       => $company->id,
                'name'     => $company->name,
                'category' => $company->category?->name,
            ],
            'pageConfig'   => [
                'title'       => 'Billing',
                'description' => 'Manage your subscription and billing details.',
                'can_manage'  => $request->user()->isSuperAdmin(),
            ],
        ]);
    }

    private function transformBilling(Subscription $subscription)
    {
        $plan = $subscription->plan;

        return [
            'id'               => $subscription->id,
            'plan_id'          => $plan?->id,
            'plan_name'        => $subscription->plan_name,
            'plan_description' => $plan?->description ?? 'Paket langganan aktif untuk perusahaan Anda.',
            'price'            => (float) ($plan?->price ?? 0),
            'is_free'          => (float) ($plan?->price ?? 0) == 0.0,
            'status'           => $subscription->status,
            'starts_at'        => $subscription->starts_at->format('d M Y'),
            'ends_at'          => $subscription->ends_at->format('d M Y'),
            'is_valid'         => $subscription->isValid(),
            'days_left'        => (int) ceil(now()->diffInDays($subscription->ends_at, false)),
            'modules'          => $plan?->modules->map(fn($mod) => [
                'name'         => $mod->name,
                'description'  => $mod->description,
            ]) ?? [],
        ];
    }

    private function transformSingleSubscription(Subscription $subscription)
    {
        return [
            'id'         => $subscription->id,
            'plan_name'  => $subscription->plan_name,
            'status'     => $subscription->status,
            'starts_at'  => $subscription->starts_at,
            'ends_at'    => $subscription->ends_at,
            'is_valid'   => $subscription->isValid(),
            'company'    => $subscription->relationLoaded('company') ? [
                'id'   => $subscription->company->id,
                'name' => $subscription->company->name,
            ] : null,
            'plan'       => $subscription->relationLoaded('plan') ? [
                'id'   => $subscription->plan?->id,
                'name' => $subscription->plan?->name,
            ] : null,
            'invoice' => $subscription->relationLoaded('invoice') && $subscription->invoice ? [
                'id'     => $subscription->invoice->id,
                'number' => $subscription->invoice->number,
            ] : null,
        ];
    }

    private function transformSubscriptions($pagination)
    {
        $pagination->getCollection()->transform(fn($s) => $this->transformSingleSubscription($s));
        return $pagination;
    }

    private function getPageConfig(Request $request)
    {
        return [
            'title'       => 'Subscription Management',
            'description' => 'Manage all company subscriptions.',
            'can_manage'  => $request->user()->isSuperAdmin(),
        ];
    }
}