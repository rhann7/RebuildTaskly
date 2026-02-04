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
            ->when($request->status, function($q, $s) {
                if ($s === 'active') return $q->where('is_active', true);
                if ($s === 'inactive') return $q->where('is_active', false);
            })
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('plans/index', [
            'plans'      => $this->transformPlans($plans),
            'filters'    => $request->only(['search']),
            'pageConfig' => $this->getPageConfig($request),
        ]);
    }

    public function show(Request $request, Plan $plan)
    {
        $plan->load(['modules' => function($query) {
            $query->orderBy('name', 'asc');
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
        $plan = DB::transaction(function () use ($request) {
            if ($request->is_basic) Plan::where('is_basic', true)->update(['is_basic' => false]);

            $plan = Plan::create($request->validated());
            if ($request->filled('module_ids')) $plan->modules()->sync($request->module_ids);
            return $plan;
        });

        return redirect()->route('product-management.plans.show', ['plan' => $plan->slug])->with('success', 'Plan created successfully. You can now assign modules.');
    }

    public function update(PlanRequest $request, Plan $plan)
    {
        DB::transaction(function () use ($request, $plan) {
            if ($request->is_basic) {
                Plan::where('is_basic', true)
                    ->where('id', '!=', $plan->id)
                    ->update(['is_basic' => false]);
            }

            $plan->update($request->validated());
            if ($request->filled('module_ids')) $plan->modules()->sync($request->module_ids);
        });

        return redirect()->back()->with('success', 'Plan Updated Successfully');
    }

    public function destroy(Plan $plan)
    {
        $plan->modules()->detach();
        $plan->delete();
        return redirect()->route('product-management.plans.index')->with('success', 'Plan Deleted');
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
            'id'            => $plan->id,
            'name'          => $plan->name,
            'slug'          => $plan->slug,
            'description'   => $plan->description,
            'price_monthly' => (float) $plan->price_monthly,
            'price_yearly'  => $plan->price_yearly ? (float) $plan->price_yearly : null,
            'is_active'     => (bool) $plan->is_active,
            'is_basic'      => (bool) $plan->is_basic,
            'modules_count' => $plan->modules_count ?? $plan->modules->count(),
            'modules'       => $plan->relationLoaded('modules') 
                ? $plan->modules->map(fn($m) => ['id' => $m->id, 'name' => $m->name]) 
                : [],
            'form_default'      => [
                'name'          => $plan->name,
                'description'   => $plan->description ?? '',
                'price_monthly' => (float) $plan->price_monthly,
                'price_yearly'  => $plan->price_yearly ? (float) $plan->price_yearly : null,
                'is_active'     => (bool) $plan->is_active,
                'is_basic'      => (bool) $plan->is_basic,
                'module_ids'    => $plan->modules->pluck('id')->toArray(),
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