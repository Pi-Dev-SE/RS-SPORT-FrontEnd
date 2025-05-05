import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-front',
  templateUrl: './home-front.component.html',
  styleUrls: ['./home-front.component.css']
})
export class HomeFrontComponent implements OnInit {


  currentSlide = 0;
  totalSlides = 3;
  private sliderContainer: HTMLElement | null = null;
  private autoSlideInterval: any;

  currentIndex = 0;
  slides: HTMLElement[] = [];
  track: HTMLElement | null = null;
  prevBtn: HTMLElement | null = null;
  nextBtn: HTMLElement | null = null;
  resizeListener: (() => void) | null = null;

  ngOnInit() {
    this.sliderContainer = document.querySelector('.slider-container');
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlider();
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlider();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.updateSlider();
  }

  private updateSlider() {
    if (this.sliderContainer) {
      const translateX = -this.currentSlide * 100;
      this.sliderContainer.style.transform = `translateX(${translateX}%)`;
    }
  }


  

}
