import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent implements OnInit {
  isChatOpen = false;
  showQrCode = false;

  ngOnInit() {
    // Auto-show chat after a delay (optional)
    /*
    setTimeout(() => {
      this.isChatOpen = true;
    }, 3000);
    */
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    this.showQrCode = false; // Reset QR code visibility when toggling chat
  }

  openWhatsApp() {
    window.open('https://wa.me/+21696445085', '_blank');
  }

  toggleQrCode() {
    this.showQrCode = !this.showQrCode;
  }
}