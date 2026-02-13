import { ProfessionalProfile } from '@/types/profile';

export function getNextSteps(profile: ProfessionalProfile | null): string[] {
    if (!profile) return ['Create your professional profile'];
    const steps: string[] = [];
    if (!profile.years_experience) steps.push('Add years of experience');
    if (!profile.haul_type) steps.push('Select your haul type');
    if (!profile.equipment_type) steps.push('Add equipment type');
    if (!profile.cdl_class) steps.push('Add CDL class');
    if (!profile.bio) steps.push('Write a bio');
    if (!profile.company_name) steps.push('Add company name');
    if (!profile.endorsements || profile.endorsements.length === 0) steps.push('Add endorsements');
    if (!profile.specialties || profile.specialties.length === 0) steps.push('Add specialties');
    return steps;
}
