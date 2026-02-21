<?php

namespace App\Http\Controllers\Plans;

use App\Http\Controllers\Controller;
use App\Http\Requests\Plans\PlanRequest;
use App\Models\Module;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index(Request $request)
    {
        $plans = Plan::query()
            ->withCount('modules')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type, function ($q, $t) {
                if ($t === 'free') return $q->free();
                if ($t === 'paid') return $q->where('is_free', false);
            })
            ->when($request->duration, function ($q, $d) {
                if ($d === 'yearly') return $q->yearly();
                if ($d === 'monthly_only') return $q->where('is_yearly', false);
            })
            ->when($request->status, function($q, $s) {
                if ($s === 'active') return $q->active();
                if ($s === 'inactive') return $q->where('is_active', false);
            })
            ->orderBy('is_free', 'desc')
            ->orderBy('price_monthly', 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('plans/index', [
            'plans'      => $this->transformPlans($plans),
            'filters'    => $request->only(['search', 'type', 'duration', 'status']),
            'pageConfig' => $this->getPageConfig($request),
        ]);
    }

    public function show(Request $request, Plan $plan)
    {
        $plan->load(['modules' => function($query) {
            $query->where('is_active', true)->orderBy('name', 'asc');
        }]);

        return Inertia::render('plans/show', [
            'plan'              => $this->transformSinglePlan($plan),
            'available_modules' => Module::where('type', Module::TYPE_STANDARD)
                ->where('is_active', true)
                ->whereDoesntHave('plans', function($q) use ($plan) {
                    $q->where('plan_id', $plan->id);
                })
                ->get(['id', 'name']),
            'pageConfig'        => [
                'title'         => 'Plan Management',
                'description'   => 'Configure subscription packages.',
                'can_manage'    => $request->user()->isSuperAdmin(),
            ]
        ]);
    }

    public function store(PlanRequest $request)
    {
        Plan::create($request->validated());
        return redirect()->route('product-management.plans.index')->with('success', 'Plan created successfully.');
    }

    public function update(PlanRequest $request, Plan $plan)
    {
        $plan->update($request->validated());
        return redirect()->route('product-management.plans.index')->with('success', 'Plan updated successfully.');
    }

    public function destroy(Plan $plan)
    {
        if ($plan->companies()->exists()) return redirect()->back()->with('error', 'Cannot delete plan. There are companies currently subscribed to this plan.');

        DB::transaction(function () use ($plan) {
            $plan->modules()->detach();
            $plan->delete();
        });

        return redirect()->route('product-management.plans.index')->with('success', 'Plan deleted successfully.');
    }

    public function assignModules(Request $request, Plan $plan)
    {
        $request->validate([
            'modules'   => 'required|array',
            'modules.*' => 'exists:modules,id',
        ]);

        $plan->modules()->syncWithoutDetaching($request->modules);
        return redirect()->back()->with('success', 'Modules successfully assigned to plan.');
    }

    public function removeModule(Plan $plan, Module $module)
    {
        $plan->modules()->detach($module->id);  
        return redirect()->back()->with('success', 'Module removed from plan.');
    }

    private function transformSinglePlan(Plan $plan)
    {
        $data = $plan->toArray();

        $data['modules_count'] = $plan->modules_count ?? 0;
        $data['form_default'] = [
            'name'                     => $plan->name,
            'description'              => $plan->description ?? '',
            'price_monthly'            => (int) $plan->price_monthly,
            'price_yearly'             => (int) $plan->price_yearly,
            'discount_monthly_percent' => $plan->discount_monthly_percent,
            'discount_yearly_percent'  => $plan->discount_yearly_percent,
            'is_free'                  => (bool) $plan->is_free,
            'is_yearly'                => (bool) $plan->is_yearly,
            'is_active'                => (bool) $plan->is_active,
        ];

        return $data;
    }

    private function transformPlans($pagination)
    {
        $pagination->getCollection()->transform(fn($p) => $this->transformSinglePlan($p));
        return $pagination;
    }

    private function getPageConfig(Request $request)
    {
        return [
            'title'       => 'Plan Management',
            'description' => 'Manage your subscription plans and pricing.',
            'can_manage'  => $request->user()->isSuperAdmin(),
        ];
    }
}