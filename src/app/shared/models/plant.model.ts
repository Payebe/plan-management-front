// Interfaces correspondant à celles du backend
export interface Plant {
    id: string;
    name: string;
    species: string;
    description?: string;
    image_url?: string;
    location: string;
    watering_frequency: number;
    last_watered?: string;
    next_watering?: string;
    care_level: 'easy' | 'medium' | 'hard';
    sunlight_requirement: 'low' | 'medium' | 'high';
    humidity_requirement: 'low' | 'medium' | 'high';
    temperature_min?: number;
    temperature_max?: number;
    notes?: string;
    is_active: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface PlantWithStats extends Plant {
    days_since_last_watered?: number;
    watering_status: 'ok' | 'due' | 'overdue';
    care_logs_count: number;
}

export interface PlantStats {
    total_plants: number;
    plants_needing_water: number;
    plants_watered_today: number;
    plants_by_care_level: {
        easy: number;
        medium: number;
        hard: number;
    };
}

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
    error?: string;
}

export interface CreatePlantDto {
    name: string;
    species: string;
    description?: string;
    imageUrl?: string;
    location: string;
    wateringFrequency: number;
    careLevel: 'easy' | 'medium' | 'hard';
    sunlightRequirement: 'low' | 'medium' | 'high';
    humidityRequirement: 'low' | 'medium' | 'high';
    temperatureMin?: number;
    temperatureMax?: number;
    notes?: string;
}

export interface UpdatePlantDto extends Partial<CreatePlantDto> { }

export interface WaterPlantDto {
    watered_at?: string;
    notes?: string;
}
