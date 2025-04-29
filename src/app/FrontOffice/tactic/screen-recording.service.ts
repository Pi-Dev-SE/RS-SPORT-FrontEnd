import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ScreenRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecordingSubject = new BehaviorSubject<boolean>(false);
  isRecording$ = this.isRecordingSubject.asObservable();

  constructor() {}
  async startRecording(element: HTMLCanvasElement): Promise<void> {
    try {
      this.recordedChunks = [];
      const stream = element.captureStream(100); // Increase to 60 FPS for smoother animation

      // Set up MediaRecorder with optimized settings for animation recording
      const options = {
        mimeType: 'video/webm;codecs=vp9', // Use VP9 for better quality
        videoBitsPerSecond: 10000000 // 10 Mbps for high quality recording
      };

      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Reduce timeslice to 100ms for more frequent updates
      this.mediaRecorder.start(100);
      this.isRecordingSubject.next(true);
    } catch (error) {
      if (error instanceof Error) {
        // Try fallback to VP8 if VP9 is not supported
        try {
          const fallbackOptions = {
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 8000000 // 8 Mbps for fallback but still good quality
          };
          const stream = element.captureStream(60);
          this.mediaRecorder = new MediaRecorder(stream, fallbackOptions);
          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.recordedChunks.push(event.data);
            }
          };
          this.mediaRecorder.start(100);
          this.isRecordingSubject.next(true);
          return;
        } catch (fallbackError) {
          console.error('Fallback recording also failed:', fallbackError);
          throw fallbackError;
        }
      }
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.onstop = () => {
            if (this.recordedChunks.length === 0) {
              reject(new Error('No data was recorded'));
              return;
            }
            // Use the same codec that was used for recording for consistency
            const blob = new Blob(this.recordedChunks, {
              type: this.mediaRecorder?.mimeType || 'video/webm;codecs=vp9'
            });
            this.recordedChunks = [];
            this.isRecordingSubject.next(false);
            resolve(blob);
          };
          this.mediaRecorder.stop();
        } else {
          reject(new Error('MediaRecorder is not active'));
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        reject(error);
      }
    });
  }

  downloadRecording(blob: Blob, filename: string = 'tactics-recording.webm'): void {
    // Prompt user for custom filename
    const customName = prompt('Enter a name for your video:', 'tactics-recording');
    const finalFilename = customName ? `${customName}.webm` : filename;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = finalFilename;
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async uploadRecording(blob: Blob, tacticsBoardId: number, players: any[]): Promise<void> {
    // Prompt user for video name
    const videoName = prompt('Enter a name for your video:', 'tactics-recording');
    if (!videoName) {
      throw new Error('Video name is required');
    }

    const formData = new FormData();
    formData.append('video', blob, `${videoName}.webm`);
    formData.append('videoName', videoName);
    formData.append('tacticsBoardId', tacticsBoardId.toString());
    formData.append('players', JSON.stringify(players));

    try {

      const response = await fetch('http://localhost:8088/spr01/api/videos/upload', {
        method: 'POST',
        body: formData,

      });


      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      // Optional: Handle successful response
      const responseData = await response.json();
      console.log('Upload successful:', responseData);

    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

}
