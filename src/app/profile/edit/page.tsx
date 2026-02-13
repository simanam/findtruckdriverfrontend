"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    Save,
    User,
    Shield,
    Eye,
    Briefcase,
    Truck,
    Building2,
    CheckCircle2,
    Camera,
    X,
    Plus,
    Trash2,
    Clock,
} from "lucide-react";
import { ProfessionalProfile, WorkHistoryEntry, FMCSACarrier, RoleDetails, ROLES_WITH_TAB, ROLE_TAB_LABELS, RoleWithTab, ROLE_LABELS } from "@/types/profile";
import { RoleSelector } from "@/components/onboarding/RoleSelector";
import { ProfileCompletionBar } from "@/components/profile/ProfileCompletionBar";
import { PrivacyToggle } from "@/components/profile/PrivacyToggle";
import { PublicProfilePreview } from "@/components/profile/PublicProfilePreview";
import { CompanySearch } from "@/components/profile/CompanySearch";
import { BadgeDisplay } from "@/components/ui/BadgeDisplay";
import { OwnerOperatorFields } from "@/components/profile/OwnerOperatorFields";
import { MechanicFields } from "@/components/profile/MechanicFields";
import { DispatcherFields } from "@/components/profile/DispatcherFields";
import { BrokerFields } from "@/components/profile/BrokerFields";
import { getNextSteps } from "@/utils/profileCompletion";
import { cn } from "@/lib/utils";
import { Wrench, Radio, Handshake } from "lucide-react";

type Tab = 'basic' | 'professional' | 'privacy' | 'opentowork' | 'role';

const BASE_TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'basic', label: 'Basic Info', icon: <User className="w-4 h-4" /> },
    { key: 'professional', label: 'Professional', icon: <Shield className="w-4 h-4" /> },
    { key: 'privacy', label: 'Privacy', icon: <Eye className="w-4 h-4" /> },
    { key: 'opentowork', label: 'Open to Work', icon: <Briefcase className="w-4 h-4" /> },
];

const ROLE_TAB_ICONS: Record<RoleWithTab, React.ReactNode> = {
    owner_operator: <Truck className="w-4 h-4" />,
    mechanic: <Wrench className="w-4 h-4" />,
    dispatcher: <Radio className="w-4 h-4" />,
    freight_broker: <Handshake className="w-4 h-4" />,
};

const HAUL_TYPES = [
    { value: 'long_haul', label: 'Long Haul' },
    { value: 'regional', label: 'Regional' },
    { value: 'local', label: 'Local' },
    { value: 'otr', label: 'OTR' },
    { value: 'dedicated', label: 'Dedicated' },
];
const EQUIPMENT_TYPES = [
    { value: 'dry_van', label: 'Dry Van' },
    { value: 'flatbed', label: 'Flatbed' },
    { value: 'reefer', label: 'Reefer' },
    { value: 'tanker', label: 'Tanker' },
    { value: 'hazmat', label: 'Hazmat' },
    { value: 'auto_carrier', label: 'Auto Carrier' },
];
const CDL_CLASSES = ['A', 'B', 'C'];
const ENDORSEMENTS_LIST = [
    { value: 'H', label: 'H - Hazmat' },
    { value: 'N', label: 'N - Tank' },
    { value: 'P', label: 'P - Passenger' },
    { value: 'S', label: 'S - School Bus' },
    { value: 'T', label: 'T - Double/Triple' },
    { value: 'X', label: 'X - Hazmat + Tank' },
];
const SPECIALTIES_LIST = ['OTR', 'Regional', 'Local', 'Dedicated', 'Team Driving', 'Owner Operator', 'Expedited', 'Heavy Haul', 'Car Hauling', 'Moving', 'Last Mile'];
const LOOKING_FOR_OPTIONS = [
    { value: 'company_driver', label: 'Company Driver' },
    { value: 'owner_operator', label: 'Owner Operator' },
    { value: 'team_driver', label: 'Team Driver' },
];
const PREFERRED_HAUL_OPTIONS = [
    { value: 'long_haul', label: 'Long Haul' },
    { value: 'regional', label: 'Regional' },
    { value: 'local', label: 'Local' },
];

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export default function ProfileEditPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>('basic');
    const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
    const [driver, setDriver] = useState<any>(null);
    const [isNewProfile, setIsNewProfile] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const skipDirtyCount = useRef(0);

    // Form state
    const [yearsExperience, setYearsExperience] = useState<number | ''>('');
    const [haulType, setHaulType] = useState('');
    const [equipmentType, setEquipmentType] = useState('');
    const [bio, setBio] = useState('');
    const [cdlClass, setCdlClass] = useState('');
    const [cdlState, setCdlState] = useState('');
    const [endorsements, setEndorsements] = useState<string[]>([]);
    const [companyName, setCompanyName] = useState('');
    const [mcNumber, setMcNumber] = useState('');
    const [dotNumber, setDotNumber] = useState('');
    const [companyStartDate, setCompanyStartDate] = useState('');
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [isPublic, setIsPublic] = useState(true);
    const [showExperience, setShowExperience] = useState(true);
    const [showEquipment, setShowEquipment] = useState(true);
    const [showCompany, setShowCompany] = useState(true);
    const [showCdl, setShowCdl] = useState(true);
    const [openToWork, setOpenToWork] = useState(false);
    const [lookingFor, setLookingFor] = useState<string[]>([]);
    const [preferredHaul, setPreferredHaul] = useState<string[]>([]);
    const [workHistory, setWorkHistory] = useState<WorkHistoryEntry[]>([]);
    const [roleDetails, setRoleDetails] = useState<RoleDetails>({});
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [savingRole, setSavingRole] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    // Track unsaved changes — skip when populateForm triggers state updates
    useEffect(() => {
        if (loading) return;
        if (skipDirtyCount.current > 0) {
            skipDirtyCount.current--;
            return;
        }
        setHasUnsavedChanges(true);
        setSaveSuccess(false);
    }, [yearsExperience, haulType, equipmentType, bio, cdlClass, cdlState, endorsements, companyName, mcNumber, dotNumber, companyStartDate, specialties, isPublic, showExperience, showEquipment, showCompany, showCdl, openToWork, lookingFor, preferredHaul, workHistory, roleDetails]);

    const loadProfile = async () => {
        try {
            if (!api.isLoggedIn) {
                router.push('/login');
                return;
            }

            // Always fetch driver info
            const driverData = await api.drivers.getMe();
            setDriver(driverData);

            // Try to fetch professional profile
            try {
                const p = await api.profile.getMe();
                setProfile(p);
                populateForm(p);
            } catch (e: any) {
                if (e.status === 404) {
                    // No profile yet - that's okay, show empty form
                    setIsNewProfile(true);
                } else {
                    throw e;
                }
            }
        } catch (e) {
            console.error("Failed to load profile", e);
            setError("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const populateForm = (p: ProfessionalProfile) => {
        // React batches these into one render, so the useEffect fires once — skip it
        skipDirtyCount.current++;
        setYearsExperience(p.years_experience ?? '');
        setHaulType(p.haul_type ?? '');
        setEquipmentType(p.equipment_type ?? '');
        setBio(p.bio ?? '');
        setCdlClass(p.cdl_class ?? '');
        setCdlState(p.cdl_state ?? '');
        setEndorsements(p.endorsements || []);
        setCompanyName(p.company_name ?? '');
        setMcNumber(p.mc_number ?? '');
        setDotNumber(p.dot_number ?? '');
        setCompanyStartDate(p.company_start_date ?? '');
        setSpecialties(p.specialties || []);
        setIsPublic(p.is_public);
        setShowExperience(p.show_experience);
        setShowEquipment(p.show_equipment);
        setShowCompany(p.show_company);
        setShowCdl(p.show_cdl);
        setOpenToWork(p.open_to_work);
        setLookingFor(p.looking_for || []);
        setPreferredHaul(p.preferred_haul || []);
        setWorkHistory(p.work_history || []);
        setRoleDetails(p.role_details || {});
    };

    const getTabData = (tab: Tab) => {
        switch (tab) {
            case 'basic':
                return {
                    years_experience: yearsExperience === '' ? null : Number(yearsExperience),
                    haul_type: haulType || null,
                    equipment_type: equipmentType || null,
                    bio: bio || null,
                };
            case 'professional':
                return {
                    cdl_class: cdlClass || null,
                    cdl_state: cdlState || null,
                    endorsements,
                    company_name: companyName || null,
                    mc_number: mcNumber || null,
                    dot_number: dotNumber || null,
                    company_start_date: companyStartDate || null,
                    specialties,
                    work_history: workHistory,
                };
            case 'privacy':
                return {
                    is_public: isPublic,
                    show_experience: showExperience,
                    show_equipment: showEquipment,
                    show_company: showCompany,
                    show_cdl: showCdl,
                };
            case 'opentowork':
                return {
                    open_to_work: openToWork,
                    looking_for: lookingFor,
                    preferred_haul: preferredHaul,
                };
            case 'role':
                return {
                    role_details: roleDetails,
                };
        }
    };

    // Build dynamic tabs based on driver role
    const driverRole = driver?.role as RoleWithTab | undefined;
    const hasRoleTab = driverRole && (ROLES_WITH_TAB as readonly string[]).includes(driverRole);
    const TABS = hasRoleTab
        ? [
            ...BASE_TABS,
            {
                key: 'role' as Tab,
                label: ROLE_TAB_LABELS[driverRole!],
                icon: ROLE_TAB_ICONS[driverRole!],
            },
        ]
        : BASE_TABS;

    const handleRoleDetailsUpdate = (updates: Partial<RoleDetails>) => {
        setRoleDetails(prev => ({ ...prev, ...updates }));
    };

    const handleRoleChange = async (newRole: string) => {
        if (newRole === driver?.role) {
            setShowRoleSelector(false);
            return;
        }
        setSavingRole(true);
        try {
            const updated = await api.drivers.updateProfile({ role: newRole });
            setDriver(updated);
            setShowRoleSelector(false);
        } catch (e: any) {
            setError(e.message || 'Failed to update role');
        } finally {
            setSavingRole(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSaveSuccess(false);

        try {
            const data = getTabData(activeTab);

            let updated: ProfessionalProfile;
            if (isNewProfile) {
                // Create profile with data from current tab
                updated = await api.profile.create(data);
                setIsNewProfile(false);
            } else {
                updated = await api.profile.updateMe(data);
            }

            setProfile(updated);
            populateForm(updated);
            setHasUnsavedChanges(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e: any) {
            console.error("Failed to save profile", e);
            setError(e.message || "Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const toggleArrayItem = (arr: string[], item: string, setter: (val: string[]) => void) => {
        if (arr.includes(item)) {
            setter(arr.filter(i => i !== item));
        } else {
            setter([...arr, item]);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setError("Please upload a JPEG, PNG, or WebP image");
            return;
        }

        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be under 5MB");
            return;
        }

        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setPhotoPreview(previewUrl);

        setUploadingPhoto(true);
        setError("");
        try {
            const result = await api.profile.uploadPhoto(file);
            // Update driver state with new photo URL
            setDriver((prev: any) => ({ ...prev, profile_photo_url: result.photo_url }));
            setPhotoPreview(null);
        } catch (e: any) {
            setError(e.message || "Failed to upload photo");
            setPhotoPreview(null);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const removePhoto = async () => {
        try {
            await api.drivers.updateProfile({ profile_photo_url: "" });
            setDriver((prev: any) => ({ ...prev, profile_photo_url: null }));
            setPhotoPreview(null);
        } catch (e: any) {
            setError(e.message || "Failed to remove photo");
        }
    };

    const handleFMCSASelect = (carrier: FMCSACarrier) => {
        setCompanyName(carrier.legal_name || carrier.dba_name || '');
        setDotNumber(carrier.dot_number || '');
        setMcNumber(carrier.mc_number || '');
    };

    const addWorkHistoryEntry = () => {
        setWorkHistory([...workHistory, {
            company_name: '',
            dot_number: null,
            mc_number: null,
            role: null,
            start_date: '',
            end_date: null,
        }]);
    };

    const updateWorkHistoryEntry = (index: number, field: keyof WorkHistoryEntry, value: string | null) => {
        const updated = [...workHistory];
        updated[index] = { ...updated[index], [field]: value };
        setWorkHistory(updated);
    };

    const removeWorkHistoryEntry = (index: number) => {
        setWorkHistory(workHistory.filter((_, i) => i !== index));
    };

    const currentPhotoUrl = photoPreview || driver?.profile_photo_url;

    const completionPercentage = profile?.completion_percentage ?? 0;
    const nextSteps = getNextSteps(profile);

    // Build a preview profile from current form state
    const previewProfile: ProfessionalProfile = {
        id: profile?.id ?? '',
        driver_id: profile?.driver_id ?? '',
        years_experience: yearsExperience === '' ? null : Number(yearsExperience),
        haul_type: haulType || null,
        equipment_type: equipmentType || null,
        cdl_class: cdlClass || null,
        cdl_state: cdlState || null,
        endorsements,
        company_name: companyName || null,
        mc_number: mcNumber || null,
        dot_number: dotNumber || null,
        company_start_date: companyStartDate || null,
        bio: bio || null,
        specialties,
        estimated_miles: profile?.estimated_miles ?? null,
        is_public: isPublic,
        show_experience: showExperience,
        show_equipment: showEquipment,
        show_company: showCompany,
        show_cdl: showCdl,
        open_to_work: openToWork,
        looking_for: lookingFor,
        preferred_haul: preferredHaul,
        work_history: workHistory,
        role_details: roleDetails,
        badges: profile?.badges ?? [],
        completion_percentage: completionPercentage,
        created_at: profile?.created_at ?? '',
        updated_at: profile?.updated_at ?? '',
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-20 pointer-events-auto overflow-y-auto">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
                <button
                    onClick={() => router.push('/profile')}
                    className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-white">Edit Professional Profile</h2>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                        saveSuccess
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : hasUnsavedChanges
                                ? "bg-amber-500 hover:bg-amber-400 text-black"
                                : "bg-sky-600 hover:bg-sky-500 text-white"
                    )}
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saveSuccess ? (
                        <CheckCircle2 className="w-4 h-4" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving' : saveSuccess ? 'Saved' : hasUnsavedChanges ? 'Save *' : 'Save'}
                </button>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-20">
                {/* Completion Bar */}
                <div className="mb-6">
                    <ProfileCompletionBar percentage={completionPercentage} />
                    {nextSteps.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2">
                            Next: {nextSteps[0]}
                        </p>
                    )}
                </div>

                {/* Badges */}
                {(profile?.badges ?? []).length > 0 && (
                    <div className="mb-6">
                        <BadgeDisplay badges={profile?.badges ?? []} />
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="mb-4 p-3 bg-rose-950/30 border border-rose-900/30 rounded-xl text-rose-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-900/50 border border-slate-800/50 rounded-xl p-1 mb-6 overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-1 justify-center",
                                activeTab === tab.key
                                    ? "bg-slate-800 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* === BASIC INFO TAB === */}
                    {activeTab === 'basic' && (
                        <div className="space-y-5">
                            {/* Role Section */}
                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Briefcase className="w-4 h-4" />
                                    Your Role
                                </h3>

                                {showRoleSelector ? (
                                    <div className="space-y-3">
                                        <RoleSelector
                                            onSelect={handleRoleChange}
                                            selectedRole={driver?.role || null}
                                        />
                                        {savingRole && (
                                            <div className="flex items-center gap-2 text-xs text-sky-400">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Updating role...
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowRoleSelector(false)}
                                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{ROLE_LABELS[driver?.role]?.emoji || '💼'}</span>
                                            <span className="text-sm font-medium text-white">
                                                {ROLE_LABELS[driver?.role]?.label || driver?.role || 'Not set'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowRoleSelector(true)}
                                            className="px-3 py-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-lg transition-all"
                                        >
                                            Change Role
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Profile Photo Section */}
                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Camera className="w-4 h-4" />
                                    Profile Photo
                                </h3>
                                <div className="flex items-center gap-5">
                                    {/* Photo Preview */}
                                    <div className="relative shrink-0">
                                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
                                            {currentPhotoUrl ? (
                                                <img
                                                    src={currentPhotoUrl}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-8 h-8 text-slate-600" />
                                            )}
                                            {uploadingPhoto && (
                                                <div className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        {currentPhotoUrl && !uploadingPhoto && (
                                            <button
                                                onClick={removePhoto}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/50 transition-all"
                                            >
                                                <X className="w-3 h-3 text-slate-400 hover:text-rose-400" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Upload Button */}
                                    <div className="flex-1 space-y-2">
                                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-all cursor-pointer">
                                            <Camera className="w-4 h-4" />
                                            {currentPhotoUrl ? 'Change Photo' : 'Upload Photo'}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handlePhotoUpload}
                                                className="hidden"
                                                disabled={uploadingPhoto}
                                            />
                                        </label>
                                        <p className="text-xs text-slate-600">
                                            JPEG, PNG, or WebP. Max 5MB.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-5">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    Basic Information
                                </h3>

                                {/* Years Experience */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={60}
                                        value={yearsExperience}
                                        onChange={(e) => setYearsExperience(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="e.g. 5"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                {/* Haul Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Haul Type
                                    </label>
                                    <select
                                        value={haulType}
                                        onChange={(e) => setHaulType(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select haul type</option>
                                        {HAUL_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Equipment Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Equipment Type
                                    </label>
                                    <select
                                        value={equipmentType}
                                        onChange={(e) => setEquipmentType(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select equipment type</option>
                                        {EQUIPMENT_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Bio
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        maxLength={500}
                                        placeholder="Tell other drivers about yourself, your experience, and what you haul..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all resize-none"
                                    />
                                    <p className="text-xs text-slate-600 mt-1 text-right">
                                        {bio.length}/500
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === PROFESSIONAL TAB === */}
                    {activeTab === 'professional' && (
                        <div className="space-y-5">
                            {/* CDL Section */}
                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-5">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    CDL Information
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* CDL Class */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                            CDL Class
                                        </label>
                                        <select
                                            value={cdlClass}
                                            onChange={(e) => setCdlClass(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select</option>
                                            {CDL_CLASSES.map((c) => (
                                                <option key={c} value={c}>Class {c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* CDL State */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                            CDL State
                                        </label>
                                        <select
                                            value={cdlState}
                                            onChange={(e) => setCdlState(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select</option>
                                            {US_STATES.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Endorsements */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Endorsements
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {ENDORSEMENTS_LIST.map((e) => {
                                            const isSelected = endorsements.includes(e.value);
                                            return (
                                                <button
                                                    key={e.value}
                                                    type="button"
                                                    onClick={() => toggleArrayItem(endorsements, e.value, setEndorsements)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                                        isSelected
                                                            ? "bg-sky-500/20 border-sky-500/30 text-sky-400"
                                                            : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                                                    )}
                                                >
                                                    {e.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Employment Section */}
                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-5">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Employment
                                </h3>

                                {/* Current Company */}
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Current Company</p>

                                    <CompanySearch onSelect={handleFMCSASelect} />

                                    {/* Company Name */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Enter company name"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        {/* MC Number */}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                                MC Number
                                            </label>
                                            <input
                                                type="text"
                                                value={mcNumber}
                                                onChange={(e) => setMcNumber(e.target.value)}
                                                placeholder="MC-XXXXXX"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>

                                        {/* DOT Number */}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                                DOT Number
                                            </label>
                                            <input
                                                type="text"
                                                value={dotNumber}
                                                onChange={(e) => setDotNumber(e.target.value)}
                                                placeholder="XXXXXXX"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>

                                        {/* Start Date */}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="month"
                                                value={companyStartDate}
                                                onChange={(e) => setCompanyStartDate(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-800/50" />

                                {/* Past Experience */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                                            Past Experience
                                        </p>
                                        <button
                                            type="button"
                                            onClick={addWorkHistoryEntry}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-all"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Add
                                        </button>
                                    </div>

                                    {workHistory.length === 0 && (
                                        <p className="text-xs text-slate-600 py-1">
                                            No past experience added yet. Add previous employers to strengthen your profile.
                                        </p>
                                    )}

                                    {workHistory.map((entry, idx) => (
                                        <div key={idx} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-slate-500">Entry {idx + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeWorkHistoryEntry(idx)}
                                                    className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Company Name with FMCSA search */}
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-1">Company</label>
                                                <CompanySearch compact onSelect={(carrier) => {
                                                    const updated = [...workHistory];
                                                    updated[idx] = {
                                                        ...updated[idx],
                                                        company_name: carrier.legal_name || carrier.dba_name || '',
                                                        dot_number: carrier.dot_number || null,
                                                        mc_number: carrier.mc_number || null,
                                                    };
                                                    setWorkHistory(updated);
                                                }} />
                                                <input
                                                    type="text"
                                                    value={entry.company_name}
                                                    onChange={(e) => updateWorkHistoryEntry(idx, 'company_name', e.target.value)}
                                                    placeholder="Company name"
                                                    className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                                                />
                                                {(entry.dot_number || entry.mc_number) && (
                                                    <div className="flex gap-3 mt-1.5">
                                                        {entry.dot_number && (
                                                            <span className="text-xs text-slate-500">DOT: {entry.dot_number}</span>
                                                        )}
                                                        {entry.mc_number && (
                                                            <span className="text-xs text-slate-500">{entry.mc_number}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Role */}
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                                                <select
                                                    value={entry.role || ''}
                                                    onChange={(e) => updateWorkHistoryEntry(idx, 'role', e.target.value || null)}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all appearance-none"
                                                >
                                                    <option value="">Select role</option>
                                                    <option value="Company Driver">Company Driver</option>
                                                    <option value="Owner Operator">Owner Operator</option>
                                                    <option value="Team Driver">Team Driver</option>
                                                    <option value="Trainer">Trainer</option>
                                                    <option value="Dispatcher">Dispatcher</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            {/* Dates */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 mb-1">Start</label>
                                                    <input
                                                        type="month"
                                                        value={entry.start_date}
                                                        onChange={(e) => updateWorkHistoryEntry(idx, 'start_date', e.target.value)}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 mb-1">End</label>
                                                    {entry.end_date === null ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateWorkHistoryEntry(idx, 'end_date', '')}
                                                            className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm text-emerald-400 font-medium text-left"
                                                        >
                                                            Current
                                                        </button>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="month"
                                                                    value={entry.end_date}
                                                                    min={entry.start_date || undefined}
                                                                    onChange={(e) => updateWorkHistoryEntry(idx, 'end_date', e.target.value)}
                                                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateWorkHistoryEntry(idx, 'end_date', null)}
                                                                    className="px-2 text-xs text-slate-500 hover:text-emerald-400 transition-colors whitespace-nowrap"
                                                                >
                                                                    Current
                                                                </button>
                                                            </div>
                                                            {entry.end_date && entry.start_date && entry.end_date < entry.start_date && (
                                                                <p className="text-xs text-rose-400">End date must be after start date</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Specialties */}
                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
                                    Specialties
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {SPECIALTIES_LIST.map((s) => {
                                        const isSelected = specialties.includes(s);
                                        return (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => toggleArrayItem(specialties, s, setSpecialties)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                                    isSelected
                                                        ? "bg-sky-500/20 border-sky-500/30 text-sky-400"
                                                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === PRIVACY TAB === */}
                    {activeTab === 'privacy' && (
                        <div className="space-y-5">
                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    Profile Visibility
                                </h3>
                                <p className="text-xs text-slate-600 mb-4">
                                    Control what other drivers and companies can see on your public profile.
                                </p>

                                <div className="divide-y divide-slate-800/50">
                                    <PrivacyToggle
                                        label="Public Profile"
                                        description="Allow others to view your professional profile"
                                        checked={isPublic}
                                        onChange={setIsPublic}
                                    />
                                    <PrivacyToggle
                                        label="Show Experience"
                                        description="Display your years of experience and haul type"
                                        checked={showExperience}
                                        onChange={setShowExperience}
                                    />
                                    <PrivacyToggle
                                        label="Show Equipment"
                                        description="Display your equipment type"
                                        checked={showEquipment}
                                        onChange={setShowEquipment}
                                    />
                                    <PrivacyToggle
                                        label="Show Company"
                                        description="Display your company name, MC and DOT numbers"
                                        checked={showCompany}
                                        onChange={setShowCompany}
                                    />
                                    <PrivacyToggle
                                        label="Show CDL"
                                        description="Display your CDL class, state, and endorsements"
                                        checked={showCdl}
                                        onChange={setShowCdl}
                                    />
                                </div>
                            </div>

                            {/* Public Profile Preview */}
                            <PublicProfilePreview profile={previewProfile} driver={driver} />
                        </div>
                    )}

                    {/* === OPEN TO WORK TAB === */}
                    {activeTab === 'opentowork' && (
                        <div className="space-y-5">
                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Open to Work
                                </h3>
                                <p className="text-xs text-slate-600 mb-4">
                                    Let companies and other drivers know you are looking for opportunities.
                                </p>

                                <PrivacyToggle
                                    label="Open to Work"
                                    description="Show a green 'Open to Work' badge on your profile and appear in search results"
                                    checked={openToWork}
                                    onChange={setOpenToWork}
                                />
                            </div>

                            {openToWork && (
                                <>
                                    {/* Looking For */}
                                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
                                            What are you looking for?
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {LOOKING_FOR_OPTIONS.map((option) => {
                                                const isSelected = lookingFor.includes(option.value);
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => toggleArrayItem(lookingFor, option.value, setLookingFor)}
                                                        className={cn(
                                                            "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all text-left",
                                                            isSelected
                                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                                : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                                                            isSelected
                                                                ? "bg-emerald-500 border-emerald-500"
                                                                : "border-slate-600"
                                                        )}>
                                                            {isSelected && (
                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        {option.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Preferred Haul */}
                                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
                                            Preferred Haul Types
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {PREFERRED_HAUL_OPTIONS.map((option) => {
                                                const isSelected = preferredHaul.includes(option.value);
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => toggleArrayItem(preferredHaul, option.value, setPreferredHaul)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                                            isSelected
                                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                                : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                                                        )}
                                                    >
                                                        {option.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* === ROLE-SPECIFIC TAB === */}
                    {activeTab === 'role' && hasRoleTab && (
                        <div className="space-y-5">
                            {driverRole === 'owner_operator' && (
                                <OwnerOperatorFields roleDetails={roleDetails} onUpdate={handleRoleDetailsUpdate} />
                            )}
                            {driverRole === 'mechanic' && (
                                <MechanicFields roleDetails={roleDetails} onUpdate={handleRoleDetailsUpdate} />
                            )}
                            {driverRole === 'dispatcher' && (
                                <DispatcherFields roleDetails={roleDetails} onUpdate={handleRoleDetailsUpdate} />
                            )}
                            {driverRole === 'freight_broker' && (
                                <BrokerFields roleDetails={roleDetails} onUpdate={handleRoleDetailsUpdate} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
