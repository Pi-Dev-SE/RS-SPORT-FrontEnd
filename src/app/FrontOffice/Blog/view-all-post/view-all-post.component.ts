import { Component, NgZone } from '@angular/core';
import { PostService } from '../../../service/Post/post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-all-post',
  templateUrl: './view-all-post.component.html',
  styleUrl: './view-all-post.component.css'
})
export class ViewAllPostComponent {

  allPosts: any;
  searchText: string = '';
  isListening = false;
  recognition: any;
  p: number = 1;


  constructor(
    private postService: PostService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.getAllPosts();
    this.initVoiceRecognition();
  }

  getAllPosts() {
    this.postService.getAllPosts().subscribe(res => {
      this.allPosts = res;
    });
  }

  onSearch() {
    if (this.searchText.trim() === '') {
      this.getAllPosts();
    } else {
      this.postService.searchByName(this.searchText.trim()).subscribe(res => {
        this.allPosts = res;
      });

      // Optional: log search
      this.postService.logSearch(this.searchText.trim()).subscribe();
    }
  }


  initVoiceRecognition() {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          let spokenText = event.results[0][0].transcript;
          spokenText = spokenText.trim().replace(/[.,!?]+$/, '');
          this.searchText = spokenText;
          this.onSearch();
        });
      };

      this.recognition.onend = () => {
        this.ngZone.run(() => {
          this.isListening = false;
        });
      };
    }
  }

  startListening() {
    if (this.recognition) {
      this.isListening = true;
      this.recognition.start();
    }
  }

  openFlashscore() {
    window.open('https://www.flashscore.com/', '_blank');
  }



  totalPosts: number = 0;
  page: number = 1;
  itemsPerPage: number = 6;

  paginate() {
    this.postService.getPaginatedPosts(this.page - 1, this.itemsPerPage).subscribe((res: any) => {
      this.allPosts = res.content;
      this.totalPosts = res.totalElements;
    });
  }



}
