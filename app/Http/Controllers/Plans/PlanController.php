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
                if ($t === 'free') return $q->where('price', '<=', 0);
                if ($t === 'paid') return $q->where('price', '>', 0);
            })
            ->when($request->duration, function ($q, $d) {
                if ($d === 'yearly') return $q->where('duration', 365);
                if ($d === 'monthly') return $q->where('duration', 30);
            })
            ->when($request->status, function($q, $s) {
                if ($s === 'active') return $q->active();
                if ($s === 'inactive') return $q->where('is_active', false);
            })
            ->orderBy('price', 'asc')
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

    public function pricing()
    {
        $plans = Plan::where('is_active', true)
            ->with(['modules' => function($q) {
                $q->where('is_active', true)->orderBy('name', 'asc');
            }])
            ->withCount('modules')
            ->orderBy('price', 'asc')
            ->get();

        return Inertia::render('plans/pricing', [
            'plans' => $plans->map(function (Plan $plan) {
                return $this->transformSinglePlan($plan);
            }),
            'pageConfig' => [
                'title' => 'Choose Your Plan',
                'description' => 'Select a plan that fits your business needs.',
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
        return [
            'id'              => $plan->id,
            'name'            => $plan->name,
            'slug'            => $plan->slug,
            'description'     => $plan->description,
            'price'           => (float) $plan->price,
            'duration'        => $plan->duration,
            'is_active'       => $plan->is_active,
            'is_free'         => $plan->is_free,
            'modules_count'   => $plan->relationLoaded('modules') ? $plan->modules->count() : ($plan->modules_count ?? 0),
            'modules'         => $plan->relationLoaded('modules') ? $plan->modules : [],
            'form_default'    => [
                'name'        => $plan->name,
                'description' => $plan->description ?? '',
                'price'       => (float) $plan->price,
                'duration'    => $plan->duration ?? 30,
                'is_active'   => (bool) $plan->is_active,
            ]
        ];
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