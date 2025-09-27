import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Plant, PlantWithStats, PlantStats, CreatePlantDto, UpdatePlantDto, WaterPlantDto } from '../models/plant.model';

@Injectable({
    providedIn: 'root'
})
export class PlantsService {
    private readonly apiUrl = `${environment.apiUrl}/plants`;

    constructor(private http: HttpClient) { }

    // Récupérer toutes les plantes de l'utilisateur
    getPlants(includeStats: boolean = false): Observable<PlantWithStats[]> {
        return this.http.get<ApiResponse<PlantWithStats[]>>(`${this.apiUrl}?stats=${includeStats}`).pipe(
            map(response => {
                if (!response.data) {
                    throw new Error('Aucune donnée de plantes reçue');
                }
                return response.data;
            }),
            catchError(this.handleError)
        );
    }

    // Récupérer les statistiques des plantes
    getStats(): Observable<PlantStats> {
        return this.http.get<ApiResponse<PlantStats>>(`${this.apiUrl}/stats`).pipe(
            map(response => {
                if (!response.data) {
                    throw new Error('Aucune statistique reçue');
                }
                return response.data;
            }),
            catchError(this.handleError)
        );
    }

    // Récupérer une plante par ID
    getPlant(id: string): Observable<PlantWithStats> {
        return this.http.get<ApiResponse<PlantWithStats>>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (!response.data) {
                    throw new Error('Plante non trouvée');
                }
                return response.data;
            }),
            catchError(this.handleError)
        );
    }

    // Créer une nouvelle plante
    createPlant(dto: CreatePlantDto): Observable<PlantWithStats> {
        return this.http.post<ApiResponse<Plant>>(this.apiUrl, dto).pipe(
            map(response => {
                if (!response.data) {
                    throw new Error('Échec de la création de la plante');
                }
                // Enrichir l'objet Plant avec les propriétés de PlantWithStats
                const plantWithStats: PlantWithStats = {
                    ...response.data,
                    watering_status: this.calculateWateringStatus(response.data),
                    care_logs_count: 0, // Nouvelle plante, aucun log de soin
                    days_since_last_watered: response.data.last_watered ? this.calculateDaysSince(response.data.last_watered) : undefined
                };
                return plantWithStats;
            }),
            catchError(this.handleError)
        );
    }

    // Mettre à jour une plante
    updatePlant(id: string, dto: UpdatePlantDto): Observable<PlantWithStats> {
        return this.http.patch<ApiResponse<Plant>>(`${this.apiUrl}/${id}`, dto).pipe(
            map(response => {
                if (!response.data) {
                    throw new Error('Échec de la mise à jour de la plante');
                }
                // Enrichir l'objet Plant avec les propriétés de PlantWithStats
                const plantWithStats: PlantWithStats = {
                    ...response.data,
                    watering_status: this.calculateWateringStatus(response.data),
                    care_logs_count: 0, // Supposition : aucun log mis à jour, ajuster si nécessaire
                    days_since_last_watered: response.data.last_watered ? this.calculateDaysSince(response.data.last_watered) : undefined
                };
                return plantWithStats;
            }),
            catchError(this.handleError)
        );
    }

    // Arroser une plante
    waterPlant(id: string, dto: WaterPlantDto): Observable<PlantWithStats> {
        return this.http.post<ApiResponse<Plant>>(`${this.apiUrl}/${id}/water`, dto).pipe(
            map(response => {
                if (!response.data) {
                    throw new Error('Échec de l\'arrosage de la plante');
                }
                // Enrichir l'objet Plant avec les propriétés de PlantWithStats
                const plantWithStats: PlantWithStats = {
                    ...response.data,
                    watering_status: this.calculateWateringStatus(response.data),
                    care_logs_count: 1, // Supposition : un nouveau log d'arrosage
                    days_since_last_watered: response.data.last_watered ? this.calculateDaysSince(response.data.last_watered) : undefined
                };
                return plantWithStats;
            }),
            catchError(this.handleError)
        );
    }

    // Supprimer une plante
    deletePlant(id: string): Observable<void> {
        return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
            map(() => undefined),
            catchError(this.handleError)
        );
    }

    private calculateWateringStatus(plant: Plant): 'ok' | 'due' | 'overdue' {
        if (!plant.last_watered || !plant.watering_frequency) return 'ok';
        const today = new Date();
        const lastWatered = new Date(plant.last_watered);
        const diffDays = Math.ceil((today.getTime() - lastWatered.getTime()) / (1000 * 3600 * 24));
        const frequency = plant.watering_frequency;

        if (diffDays > frequency + 1) return 'overdue';
        if (diffDays >= frequency) return 'due';
        return 'ok';
    }

    private calculateDaysSince(lastWatered: string): number {
        const today = new Date();
        const last = new Date(lastWatered);
        return Math.ceil((today.getTime() - last.getTime()) / (1000 * 3600 * 24));
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        if (error.status === 404) {
            errorMessage = 'Plante non trouvée.';
        } else if (error.status === 401) {
            errorMessage = 'Vous devez être connecté pour effectuer cette action.';
        } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Données invalides fournies.';
        } else if (error.error?.message) {
            errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
    }
}