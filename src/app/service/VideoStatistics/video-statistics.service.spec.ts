import { TestBed } from '@angular/core/testing';

import { VideoStatisticsService } from './video-statistics.service';

describe('VideoStatisticsService', () => {
  let service: VideoStatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoStatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
