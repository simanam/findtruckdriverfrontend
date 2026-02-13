export interface WorkHistoryEntry {
    company_name: string;
    role: string | null;
    start_date: string; // YYYY-MM
    end_date: string | null; // YYYY-MM or null = current
}

export interface FMCSACarrier {
    legal_name: string;
    dba_name: string | null;
    dot_number: string | null;
    mc_number: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    phone: string | null;
    power_units: number | null;
    drivers: number | null;
}

export interface ProfessionalProfile {
    id: string;
    driver_id: string;
    years_experience: number | null;
    haul_type: string | null;
    equipment_type: string | null;
    cdl_class: string | null;
    cdl_state: string | null;
    endorsements: string[];
    company_name: string | null;
    mc_number: string | null;
    dot_number: string | null;
    bio: string | null;
    specialties: string[];
    estimated_miles: number | null;
    is_public: boolean;
    show_experience: boolean;
    show_equipment: boolean;
    show_company: boolean;
    show_cdl: boolean;
    open_to_work: boolean;
    looking_for: string[];
    preferred_haul: string[];
    work_history: WorkHistoryEntry[];
    badges: Badge[];
    completion_percentage: number;
    created_at: string;
    updated_at: string;
}

export interface Badge {
    id: string;
    name: string;
    awarded_at: string | null;
}

export interface ProfileCompletionInfo {
    percentage: number;
    nextSteps: string[];
}
