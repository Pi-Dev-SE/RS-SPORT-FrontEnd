import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private apiUrl = 'http://localhost:8088/spr01/players';

  constructor(private http: HttpClient) { }

  // Get player by ID
  getPlayer(id: number): Observable<Player> {
    console.log(`Fetching player with ID:`);
    return this.http.get<Player>(`${this.apiUrl}/club/${id}`);
  }

  // Get all players by club ID - with new response format
  getPlayersByClubId(clubId: number): Observable<Player[]> {
    console.log(`Fetching players for club ID: ${clubId}`);
    return this.http.get<any[]>(`${this.apiUrl}/getPlayersByClubId/${clubId}`)
      .pipe(
        map(response => {
          // Map the response data to extract Player objects and add imageUrl
          return response.map(item => {
            // Create a new player object with imageUrl added
            return {
              ...item.player,
              imageUrl: item.imageUrl
            } as Player;
          });
        })
      );
  }

  // Add a new player with multipart/form-data for image upload
  addPlayer(player: Player): Observable<Player> {
    const formData = new FormData();
    
    // Add all player fields to FormData
    if (player.firstname) formData.append('firstname', player.firstname);
    if (player.lastname) formData.append('lastname', player.lastname);
    if (player.email) formData.append('email', player.email);
    if (player.password) formData.append('password', player.password);
    if (player.position) formData.append('position', player.position);
    if (player.jerseyNumber) formData.append('jerseyNumber', player.jerseyNumber.toString());
    if (player.dateOfBirth) formData.append('dateOfBirth', player.dateOfBirth);
    if (player.healthStatus) formData.append('healthStatus', player.healthStatus);
    
    // Handle File upload if playerImage is a File object
    if (player.playerImage && player.playerImage instanceof File) {
      formData.append('playerImage', player.playerImage, player.playerImage.name);
    }
    
    // Add default values
    formData.append('role', 'PLAYER');
    formData.append('enabled', 'true');

    return this.http.post<Player>(`${this.apiUrl}/addPlayer`, formData);
  }

  // Update an existing player
  updatePlayer(id: number, player: Player): Observable<Player> {
    // If updating with image, use FormData approach
    if (player.playerImage && player.playerImage instanceof File) {
      const formData = new FormData();
      
      // Add all player fields to FormData
      if (player.firstname) formData.append('firstname', player.firstname);
      if (player.lastname) formData.append('lastname', player.lastname);
      if (player.email) formData.append('email', player.email);
      if (player.password) formData.append('password', player.password);
      if (player.position) formData.append('position', player.position);
      if (player.jerseyNumber) formData.append('jerseyNumber', player.jerseyNumber.toString());
      if (player.dateOfBirth) formData.append('dateOfBirth', player.dateOfBirth);
      if (player.healthStatus) formData.append('healthStatus', player.healthStatus);
      
      // Handle File upload
      formData.append('playerImage', player.playerImage, player.playerImage.name);
      
      // Add default values if not provided
      if (player.role) formData.append('role', player.role);
      else formData.append('role', 'PLAYER');
      
      if (player.enabled !== undefined) formData.append('enabled', player.enabled.toString());
      else formData.append('enabled', 'true');

      return this.http.put<Player>(`${this.apiUrl}/updatePlayer/${id}`, formData);
    } else {
      // Regular JSON update without file
      const playerData = { 
        ...player,
        // Only set these if they're missing
        role: player.role || 'PLAYER',
        enabled: player.enabled !== undefined ? player.enabled : true
      };
      return this.http.put<Player>(`${this.apiUrl}/updatePlayer/${id}`, playerData);
    }
  }

  // Delete a player
  deletePlayer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deletePlayer/${id}`);
  }

  // Get all players
  getAllPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiUrl}`);
  }
}