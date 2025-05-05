import { Component, OnInit } from '@angular/core';
import { HealthReport } from '../../Models/HealthReport';
import { TypeInjurySeverity } from '../../Models/type-injury-severity';
import { TypeStatusHealth } from '../../Models/type-status-health';
import { MedicalReportService } from '../../services/medical-report.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-medical-report',
  templateUrl: './medical-report.component.html',
  styleUrl: './medical-report.component.css'
})
export class MedicalReportComponent implements OnInit {

  
  
  isSidebarOpen = false;
  showNotifications = false; // For notification popup

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  
  // Toggle notification popup
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }
  
  // Close notifications when clicking on the overlay but not on the popup itself
  closeNotificationsOnOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('notification-overlay')) {
      this.showNotifications = false;
    }
  }

  
  
  constructor(
    private reportService: MedicalReportService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  searchTerm: string = '';
  isLoading: boolean = false;
  notificationCount = 0;
  lastNotification = '';
  reports: HealthReport[] = [];
  selectedReport: HealthReport | null = null;
  showModal = false;
  TypeInjurySeverity = TypeInjurySeverity;
  TypeStatusHealth = TypeStatusHealth;
  //page: number = 1; 
  itemsPerPage: number = 3;
  totalPages: number = 0;
  currentPage: number = 0; // 0-based page index

  filteredReports(): HealthReport[] {
    return this.reports.filter(report =>
      report.injuryType?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      report.firstNamePlay?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  ngOnInit() {
    this.loadReports();
    this.notificationService.getNotifications().subscribe(message => {
      console.log('Notification reçue:', message); 
      this.lastNotification = message;
      this.notificationCount++;
    });
  }
  
  clearNotifications() {
    this.notificationCount = 0;
    this.lastNotification = '';
    this.showNotifications = false;
  }
  
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadReports();
    }
  }
  
  nextPage() {
    this.goToPage(this.currentPage + 1);
  }
  
  prevPage() {
    this.goToPage(this.currentPage - 1);
  }
  

  loadReports() {
    this.isLoading = true;
    this.reportService.getReports(this.currentPage, this.itemsPerPage).subscribe(
      data => {
        this.reports = data.content;
        this.totalPages = data.totalPages;
        this.currentPage = data.number;
        this.isLoading = false;
      },
      error => { 
       this.isLoading = false;
        Swal.fire("Error", "Failed to load report", "error");
      }
    );
  }
  
  
  
  editReport(healthId: number) {
    this.router.navigate(['/Addreport'], { queryParams: { id: healthId } });
  }


  
  deleteReport(id: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.reportService.deleteReport(id).subscribe({
          next: () => {
            this.loadReports();
            Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success"
            });
          },
          error: (err) => {
            console.error('Error deleting report:', err);
            Swal.fire({
              title: "Error!",
              text: "Failed to delete the report.",
              icon: "error"
            });
          }
        });
      }
    });
  }
    
  
  




 

}