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
            ->with(['company', 'plan'])
            ->when($request->search, function ($q, $s) {
                $q->whereHas('company', fn($query) => $query->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('plan', fn($query) => $query->where('name', 'like', "%{$s}%"));
            })
            ->when($request->status, function($q, $s) {
                if ($s === 'active') return $q->active();
                if ($s === 'expired') return $q->where('status', 'expired')->orWhere('ends_at', '<', now());
            })
            ->when($request->cycle, function($q, $c) {
                return $q->where('billing_cycle', $c);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('subscriptions/index', [
            'subscriptions' => $this->transformSubscriptions($subscriptions),
            'filters'       => $request->only(['search', 'status', 'cycle']),
            'pageConfig'    => $this->getPageConfig($request),
        ]);
    }

    private function transformSubscriptions($pagination)
    {
        $pagination->getCollection()->transform(fn($s) => $this->transformSingleSubscription($s));
        return $pagination;
    }

    private function transformSingleSubscription(Subscription $sub)
    {
        $isActive = $sub->status === 'active' && $sub->ends_at && $sub->ends_at->isFuture();

        return [
            'id'             => $sub->id,
            'company_name'   => $sub->company->name ?? 'N/A',
            'plan_name'      => $sub->plan->name ?? 'N/A',
            'billing_cycle'  => $sub->billing_cycle,
            'starts_at'      => $sub->starts_at->format('d M Y'),
            'ends_at'        => $sub->ends_at ? $sub->ends_at->format('d M Y') : 'N/A',
            'status'         => $sub->status,
            'is_expiring'    => $sub->is_expiring_soon,
            'is_free'        => $sub->is_free,
            'is_active'      => $isActive,
            'remaining_days' => $sub->ends_at ? (int) now()->diffInDays($sub->ends_at, false) : 0,
        ];
    }

    private function getPageConfig(Request $request)
    {
        return [
            'title'       => 'Subscription Monitoring',
            'description' => 'Monitor all companies subscription status and billing cycles.',
            'can_manage'  => $request->user()->isSuperAdmin(),
        ];
    }
}