"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, LogOut, Trash2, Loader2, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AvatarBuilder } from "@/components/onboarding/AvatarBuilder";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { OpenToWorkBadge } from "@/components/profile/OpenToWorkBadge";
import { ProfessionalProfile } from "@/types/profile";

export default function ProfilePage() {
    const router = useRouter();
    const { setAvatarId: setStoreAvatar, setHandle: setStoreHandle, reset } = useOnboardingStore();

    // UI State
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [view, setView] = useState<'main' | 'edit-avatar' | 'edit-handle'>('main');

    // Edit State
    const [newHandle, setNewHandle] = useState("");
    const [handleError, setHandleError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Professional Profile State
    const [proProfile, setProProfile] = useState<ProfessionalProfile | null>(null);

    // Delete State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            if (!api.isLoggedIn) {
                router.push('/login');
                return;
            }

            const [p, s, pp] = await Promise.all([
                api.drivers.getMe(),
                api.drivers.getStats().catch(() => null), // Stats might fail if empty?
                api.profile.getMe().catch(() => null) // Professional profile might not exist yet
            ]);

            setProfile(p);
            setStats(s);
            setProProfile(pp);
            setNewHandle(p.handle || "");
        } catch (e) {
            console.error("Failed to load profile", e);
            // Optionally redirect to login if 401
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarSave = async (newAvatarUrl: string) => {
        setIsSaving(true);
        // Extract ID from URL for storage if needed, but api expects avatar_id string. 
        // Our AvatarBuilder returns a full URL. The backend likely stores whatever string we send as `avatar_id`.
        // However, the `AvatarBuilder` constructs a URL like `https://api.dicebear.com/...?seed=...`
        // The backend doc says `avatar_id` string.
        // Let's assume we store the FULL URL as the ID for now, or just the seed? 
        // The previous implementation seemed to treat avatar_id as a seed or ID.
        // Let's look at `Navbar` implementation: `src='https://api.dicebear...seed=${avatarId}'`
        // So `avatarId` is expected to be just the SEED?
        // Wait, `AvatarBuilder` returns a full URL in `avatarUrl`.
        // And `Navbar` consumes `avatarId` and reconstructs the URL. This is inconsistent.
        // Let's check `AvatarBuilder` again. It returns a full URL.
        // If `setAvatarId` in store sets the full URL, then `Navbar` is broken if it blindly prepends `https://...`.
        // Let's check `Navbar.tsx` Step 721 Line 88: `src={https://api.dicebear.com/9.x/avataaars/svg?seed=${avatarId}}`
        // This implies `avatarId` IS just the seed.
        // But `AvatarBuilder` generates a complex URL with accessories etc.
        // If we only store the seed, we lose configuration (glasses, hair color etc).
        // WE NEED TO FIX THIS. The user wants to reuse the component.
        // The component generates a URL. We should probably store the URL.
        // If `Navbar` expects a seed, we need to update `Navbar` to handle full URLs if `avatarId` starts with `http`.

        // For now, let's proceed assuming we will fix Navbar to handle full URLs.

        try {
            const updated = await api.drivers.updateProfile({ avatar_id: newAvatarUrl });
            setProfile(updated);
            setStoreAvatar(updated.avatar_id);
            setView('main');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleHandleSave = async () => {
        if (!newHandle) return;
        setIsSaving(true);
        setHandleError("");
        try {
            const updated = await api.drivers.updateProfile({ handle: newHandle });
            setProfile(updated);
            setStoreHandle(updated.handle);
            setView('main');
        } catch (e: any) {
            if (e.status === 400) {
                setHandleError("Handle already taken or invalid");
            } else {
                setHandleError("Failed to update handle");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteInput !== "DELETE") return;
        setIsSaving(true);
        try {
            await api.drivers.deleteAccount({ confirmation: "DELETE" });
            api.auth.logout();
            reset();
            router.push('/');
        } catch (e) {
            console.error(e);
            setIsSaving(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    // --- VIEW: EDIT AVATAR ---
    if (view === 'edit-avatar') {
        return (
            <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center relative pointer-events-auto">
                {/* Header with back and cancel buttons */}
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
                    <button
                        onClick={() => setView('main')}
                        className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-white">Update Look</h2>
                    <button
                        onClick={() => setView('main')}
                        className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                </div>

                <div className="w-full max-w-md pt-20">
                    <AvatarBuilder
                        mode="edit"
                        initialAvatarId={profile?.avatar_id}
                        onSave={handleAvatarSave}
                    />
                    {isSaving && <div className="mt-4 text-center text-sky-400 animate-pulse">Saving...</div>}
                </div>
            </div>
        );
    }

    // --- VIEW: MAIN PROFILE ---
    return (
        <div className="min-h-screen bg-slate-950 pb-20 pointer-events-auto overflow-y-auto">
            {/* Header / Hero */}
            <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/50 pt-24 pb-8 px-6">
                <div className="max-w-md mx-auto flex flex-col items-center text-center">

                    {/* Avatar */}
                    <div className="relative group cursor-pointer" onClick={() => setView('edit-avatar')}>
                        <div className="w-32 h-32 rounded-full bg-slate-800 ring-4 ring-slate-900 shadow-xl overflow-hidden relative">
                            {/* Handle both Full URL and legacy Seed avatars */}
                            <img
                                src={profile?.avatar_id?.startsWith('http')
                                    ? profile.avatar_id
                                    : `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.avatar_id || 'driver'}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                            {/* Edit Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Edit2 className="w-8 h-8 text-white/80" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-slate-800 p-1.5 rounded-full border border-slate-700 shadow-md">
                            {profile?.status === 'rolling' && <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />}
                            {profile?.status === 'waiting' && <div className="w-4 h-4 bg-rose-500 rounded-full" />}
                            {(profile?.status === 'parked' || !profile?.status) && <div className="w-4 h-4 bg-sky-500 rounded-full" />}
                        </div>
                    </div>

                    {/* Check if editing handle */}
                    {view === 'edit-handle' ? (
                        <div className="mt-4 w-full flex flex-col items-center gap-2">
                            <input
                                type="text"
                                value={newHandle}
                                onChange={(e) => {
                                    setNewHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''));
                                    setHandleError("");
                                }}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-center text-white font-bold tracking-wide focus:ring-2 focus:ring-sky-500 outline-none w-full max-w-[200px]"
                                placeholder="Enter handle"
                                autoFocus
                            />
                            {handleError && <p className="text-rose-400 text-xs">{handleError}</p>}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setView('main')}
                                    className="px-3 py-1 rounded bg-slate-800 text-slate-400 text-xs hover:text-white"
                                >Cancel</button>
                                <button
                                    onClick={handleHandleSave}
                                    disabled={isSaving || !newHandle}
                                    className="px-3 py-1 rounded bg-sky-600 text-white text-xs hover:bg-sky-500 font-bold"
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 flex items-center gap-2 group cursor-pointer" onClick={() => setView('edit-handle')}>
                            <h1 className="text-2xl font-bold text-white tracking-tight">@{profile?.handle}</h1>
                            <Edit2 className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
                        </div>
                    )}

                    <p className="text-slate-500 text-sm mt-1">
                        Member since {profile?.created_at ? formatDate(profile.created_at) : '...'}
                    </p>

                    {/* Open to Work Badge */}
                    {proProfile?.open_to_work && (
                        <div className="mt-3">
                            <OpenToWorkBadge size="md" />
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Professional Profile */}
            <div className="max-w-md mx-auto px-6 pt-6">
                <Link
                    href="/profile/edit"
                    className="w-full flex items-center justify-between px-4 py-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 hover:border-sky-500/30 rounded-xl text-sky-400 hover:text-sky-300 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5" />
                        <div className="text-left">
                            <span className="text-sm font-semibold block">Edit Professional Profile</span>
                            <span className="text-xs text-sky-500/70">
                                {proProfile ? `${proProfile.completion_percentage}% complete` : 'Set up your professional profile'}
                            </span>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="max-w-md mx-auto px-6 py-8">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Lifetime Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 border border-slate-800/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1">
                        <span className="text-3xl font-black text-white">{stats?.total_status_updates || 0}</span>
                        <span className="text-xs text-slate-500 font-medium uppercase">Updates</span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1">
                        <span className="text-3xl font-black text-white">{stats?.days_active || 0}</span>
                        <span className="text-xs text-slate-500 font-medium uppercase">Days Active</span>
                    </div>

                    {/* Status Breakdown */}
                    <div className="col-span-2 grid grid-cols-3 gap-2 mt-2">
                        <div className="bg-slate-900/30 border border-slate-800/30 p-2 rounded-lg text-center">
                            <div className="text-emerald-400 font-bold text-lg">{stats?.rolling_count || 0}</div>
                            <div className="text-[10px] text-slate-600 uppercase">Rolling</div>
                        </div>
                        <div className="bg-slate-900/30 border border-slate-800/30 p-2 rounded-lg text-center">
                            <div className="text-rose-400 font-bold text-lg">{stats?.waiting_count || 0}</div>
                            <div className="text-[10px] text-slate-600 uppercase">Waiting</div>
                        </div>
                        <div className="bg-slate-900/30 border border-slate-800/30 p-2 rounded-lg text-center">
                            <div className="text-sky-400 font-bold text-lg">{stats?.parked_count || 0}</div>
                            <div className="text-[10px] text-slate-600 uppercase">Parked</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions / Danger Zone */}
            <div className="max-w-md mx-auto px-6">
                <div className="bg-rose-950/10 border border-rose-900/20 rounded-xl p-4 space-y-4">
                    <h3 className="text-rose-400 text-xs font-bold uppercase tracking-widest">Danger Zone</h3>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 rounded-lg text-slate-400 hover:text-rose-400 transition-all group"
                        >
                            <span className="text-sm font-medium">Delete Account</span>
                            <Trash2 className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="space-y-3 bg-slate-950/50 p-4 rounded-lg border border-rose-900/30 animate-in fade-in slide-in-from-top-2">
                            <p className="text-rose-200 text-sm font-medium">
                                This will permanently delete your profile, stats, and history. This cannot be undone.
                            </p>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 uppercase font-bold">Type "DELETE" to confirm</label>
                                <input
                                    type="text"
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:border-rose-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                                    className="flex-1 py-2 bg-slate-800 text-white text-xs font-bold rounded hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteInput !== "DELETE" || isSaving}
                                    className="flex-1 py-2 bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded hover:bg-rose-700"
                                >
                                    {isSaving ? 'Deleting...' : 'Delete Forever'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => {
                        api.auth.logout();
                        reset();
                        router.push('/');
                    }}
                    className="w-full mt-6 py-3 text-slate-500 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
