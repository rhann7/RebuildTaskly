<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;
use App\Mail\TeamInvitation;
use Illuminate\Support\Facades\Mail;

class TeamController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user(); 
        $companyId = $user->company_id;

        return Inertia::render('team/index', [
            'members' => $companyId 
                ? User::where('company_id', $companyId)
                    ->with(['roles', 'managedWorkspace'])
                    ->get()
                : [],
                
            'workspaces' => Workspace::where('company_id', $companyId)->get(),
            'availableRoles' => ['manager', 'member']
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|in:manager,member',
            'workspace_id' => 'required_if:role,manager|nullable|exists:workspaces,id',
        ]);

        // Bungkus dalam transaction biar kalau email gagal, database gak ikut kotor
        $newUser = DB::transaction(function () use ($request) {
            /** @var \App\Models\User $owner */
            $owner = Auth::user(); 

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make('password123'),
                'company_id' => $owner->company_id,
                'email_verified_at' => now(), // Auto verify biar mereka bisa langsung login
            ]);

            $user->assignRole($request->role);

            if ($request->role === 'manager' && $request->workspace_id) {
                Workspace::where('id', $request->workspace_id)
                    ->update(['manager_id' => $user->id]);
            }

            return $user;
        });

        // KIRIM EMAIL SETELAH DB BERES
        try {
            Mail::to($newUser->email)->send(new TeamInvitation($newUser));
        } catch (\Exception $e) {
            // Kalau gagal kirim email, user tetep kebuat, tapi kasih warning
            return back()->with('warning', 'Unit deployed, but neural link (email) failed to send.');
        }

        return back()->with('success', 'Team member invited and deployment orders sent.');
    }
}