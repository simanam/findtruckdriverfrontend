export interface WorkHistoryEntry {
    company_name: string;
    dot_number: string | null;
    mc_number: string | null;
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

export interface GooglePlaceData {
    place_id: string;
    name: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    phone: string | null;
    website: string | null;
    rating: number | null;
    review_count: number | null;
    types: string[] | null;
    business_status: string | null;
}

export interface RoleDetails {
    // FMCSA verification (owner_operator, freight_broker)
    fmcsa_verified?: boolean;
    fmcsa_data?: FMCSACarrier;
    fmcsa_verified_at?: string;

    // Google Places verification (mechanic)
    google_verified?: boolean;
    google_data?: GooglePlaceData;
    google_verified_at?: string;

    // Owner-operator specific
    truck_year?: string;
    truck_make?: string;
    truck_model?: string;
    trailer_type?: string;

    // Mechanic specific
    shop_name?: string;
    shop_city?: string;
    shop_state?: string;
    mobile_service?: boolean;
    mechanic_specialties?: string[];
    certifications?: string[];
    service_area_miles?: number;
    emergency_available?: boolean;

    // Dispatcher specific
    dispatcher_company?: string;
    fleet_size?: string;
    lanes_served?: string[];
    hiring_drivers?: boolean;

    // Freight broker specific
    broker_company?: string;
    freight_specialties?: string[];
    volume?: string;
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
    company_start_date: string | null;
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
    role_details: RoleDetails | null;
    badges: Badge[];
    completion_percentage: number;
    created_at: string;
    updated_at: string;
}

export interface Badge {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    awarded_at: string | null;
}

export interface ProfileCompletionInfo {
    percentage: number;
    nextSteps: string[];
}

// All roles matching backend VALID_ROLES
export const ROLE_LABELS: Record<string, { label: string; emoji: string }> = {
    company_driver: { label: 'Company Driver', emoji: '🚛' },
    owner_operator: { label: 'Owner Operator', emoji: '👑' },
    team_driver: { label: 'Team Driver', emoji: '👥' },
    lease_operator: { label: 'Lease Operator', emoji: '📋' },
    student_driver: { label: 'Student Driver', emoji: '🎓' },
    dispatcher: { label: 'Dispatcher', emoji: '📡' },
    freight_broker: { label: 'Freight Broker', emoji: '🤝' },
    mechanic: { label: 'Mechanic', emoji: '🔧' },
    fleet_manager: { label: 'Fleet Manager', emoji: '📊' },
    lumper: { label: 'Lumper', emoji: '📦' },
    warehouse: { label: 'Warehouse', emoji: '🏭' },
    shipper: { label: 'Shipper', emoji: '🚢' },
    other: { label: 'Other', emoji: '💼' },
};

// Role constants matching backend VALID_ROLES
export const ROLES_WITH_TAB = [
    'owner_operator',
    'mechanic',
    'dispatcher',
    'freight_broker',
] as const;

export type RoleWithTab = typeof ROLES_WITH_TAB[number];

export const ROLE_TAB_LABELS: Record<RoleWithTab, string> = {
    owner_operator: 'Owner-Operator',
    mechanic: 'Mechanic',
    dispatcher: 'Dispatcher',
    freight_broker: 'Broker',
};
