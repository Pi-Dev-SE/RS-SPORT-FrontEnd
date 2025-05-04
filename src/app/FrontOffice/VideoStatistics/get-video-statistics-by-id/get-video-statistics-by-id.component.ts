import { Component } from '@angular/core';
import { VideoStatisticsService } from '../../../service/VideoStatistics/video-statistics.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

@Component({
  selector: 'app-get-video-statistics-by-id',
  templateUrl: './get-video-statistics-by-id.component.html',
  styleUrls: ['./get-video-statistics-by-id.component.css']
})
export class GetVideoStatisticsByIdComponent {

  videoId = this.activatedRoute.snapshot.params['id'];
  videoData: any;
  teamPerformance: string | null = null;
  qrCodeUrl: string | null = null; // Variable to hold the generated QR code URL

  constructor(
    private video: VideoStatisticsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log(this.videoId);
    this.GetVideoStatisticsById();
  }

  GetVideoStatisticsById() {
    this.video.GetVideoStatisticsById(this.videoId).subscribe(
      (response) => {
        this.videoData = response;
        console.log(response);
      },
      (error) => {
        // Error handling
      }
    );
  }

  delete(videoStatisticsId: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.video.deleteVideoStatistics(videoStatisticsId).subscribe((response) => {
          console.log('resultat = ', response);
          this.router.navigateByUrl('getAllVideoStatistics');
        });
        Swal.fire('Deleted!', 'Your specialites has been deleted.', 'success');
      }
    });
  }

  downloadPDF() {
    this.teamPerformance = this.calculateTeamPerformance(); // Set performance before rendering

    const content = document.getElementById('pdf-content');
    if (!content) return;

    content.style.display = 'block';

    setTimeout(() => {
      html2canvas(content, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const logo = new Image();
        logo.src = 'assets/FrontOffice/images/logo.png';

        logo.onload = () => {
          const logoWidth = 40;
          const logoHeight = 20;

          pdf.addImage(logo, 'PNG', (pageWidth - logoWidth) / 2, 10, logoWidth, logoHeight);

          const contentYStart = 40;

          const imgWidth = pageWidth - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 10, contentYStart, imgWidth, imgHeight);

          pdf.save('video-statistics.pdf');

          content.style.display = 'none';
        };
      });
    }, 100);
  }

  calculateTeamPerformance(): string {
    if (!this.videoData) return 'Data not available';

    const { totalDistanceCovered, sprintDistance, topSpeed, passAccuracy, passNbr } = this.videoData;

    const performanceScore =
      totalDistanceCovered * 0.2 +
      sprintDistance * 0.1 +
      topSpeed * 1.5 +
      passAccuracy * 2 +
      passNbr * 0.5;

    if (performanceScore > 150) return 'Excellent';
    if (performanceScore > 100) return 'Good';
    if (performanceScore > 60) return 'Average';
    return 'Needs Improvement';
  }

  showTeamPerformance() {
    this.teamPerformance = this.calculateTeamPerformance();
  }

  generateQRCode() {
    // Create the text summary for the team performance
    const summary = `
      Team Performance:
      ${this.calculateTeamPerformance()}

      Total Distance Covered: ${this.videoData.totalDistanceCovered} km
      Sprint Distance: ${this.videoData.sprintDistance} m
      Top Speed: ${this.videoData.topSpeed} km/h
      Pass Accuracy: ${this.videoData.passAccuracy} %
      Total Passes: ${this.videoData.passNbr}
      Min Speed: ${this.videoData.minSpeed} km/h
    `;

    // Generate the QR code with the performance summary
    QRCode.toDataURL(summary, { errorCorrectionLevel: 'H' })
      .then((url) => {
        this.qrCodeUrl = url; // Set the QR code URL to be displayed
      })
      .catch((error) => {
        console.error('Error generating QR code:', error);
      });
  }
}
