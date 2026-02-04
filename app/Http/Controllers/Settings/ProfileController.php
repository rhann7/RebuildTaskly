<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\CompanyCategory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => $request->session()->get('status'),
            'categories'      => CompanyCategory::select('id', 'name')->get(),
            'company'         => $request->user()->load('company')->company,
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        DB::transaction(function () use ($request, $user, $validated) {
            $verified = $user->email_verified_at ?? now();

            $user->fill([
                'name'  => $validated['company_name'],
                'email' => $validated['company_email'],
            ]);

            $user->email_verified_at = $verified;
            $user->save();

            if ($user->company) {
                $data = [
                    'name'                => $validated['company_name'],
                    'email'               => $validated['company_email'],
                    'phone'               => $validated['company_phone'],
                    'address'             => $validated['company_address'],
                    'company_category_id' => $validated['company_category_id'],
                ];

                if ($user->company->name !== $validated['company_name']) {
                    $data['slug'] = Str::slug($validated['company_name']) . '-' . Str::lower(Str::random(5));
                }

                if ($request->hasFile('company_logo')) {
                    if ($user->company->logo) {
                        Storage::disk('public')->delete('logos/' . $user->company->logo);
                    }

                    $path = $request->file('company_logo')->store('logos', 'public');
                    $data['logo'] = basename($path);
                }

                $user->company->update($data);
            }
        });

        return back()->with('success', 'All information updated.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}