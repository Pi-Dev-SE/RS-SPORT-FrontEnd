import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-body-part-label',
  template: `
    <div class="body-part-label" [ngClass]="riskLevel">
      <div class="label-content">
        <div class="part-name">{{ partName }}</div>
        <div class="muscle-info" *ngIf="showDetails">{{ muscleInfo }}</div>
        <div class="risk-indicator" *ngIf="riskLevel !== 'none'">
          {{ riskLevel | titlecase }} Risk
        </div>
      </div>
      <div class="label-arrow"></div>
    </div>
  `,
  styles: [`
    .body-part-label {
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      position: relative;
      min-width: 100px;
      max-width: 150px;
      transition: all 0.3s ease;
    }
    
    .part-name {
      font-weight: bold;
      margin-bottom: 2px;
    }
    
    .muscle-info {
      font-size: 10px;
      margin-bottom: 4px;
      color: #ccc;
    }
    
    .risk-indicator {
      font-size: 10px;
      font-weight: bold;
    }
    
    .label-arrow {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid rgba(0, 0, 0, 0.7);
      transition: border-top-color 0.3s ease;
    }
    
    /* Risk level styling */
    .high {
      background-color: rgba(255, 0, 0, 0.9);
      box-shadow: 0 0 8px rgba(255, 0, 0, 0.5);
    }
    
    .high .label-arrow {
      border-top-color: rgba(255, 0, 0, 0.9);
    }
    
    .medium {
      background-color: rgba(255, 165, 0, 0.9);
      box-shadow: 0 0 6px rgba(255, 165, 0, 0.5);
    }
    
    .medium .label-arrow {
      border-top-color: rgba(255, 165, 0, 0.9);
    }
    
    .low {
      background-color: rgba(0, 255, 0, 0.9);
      box-shadow: 0 0 6px rgba(0, 255, 0, 0.5);
    }
    
    .low .label-arrow {
      border-top-color: rgba(0, 255, 0, 0.9);
    }
    
    /* Animation for high risk */
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .high {
      animation: pulse 1.5s infinite ease-in-out;
    }
  `]
})
export class BodyPartLabelComponent implements OnInit {
  @Input() partName: string = '';
  @Input() muscleInfo: string = '';
  @Input() riskLevel: 'high' | 'medium' | 'low' | 'none' = 'none';
  @Input() showDetails: boolean = false;
  
  constructor() { }
  
  ngOnInit(): void {
  }
}