import { TestBed } from '@angular/core/testing';

import { VideoAnalysisService } from './video-analysis.service';

describe('VideoAnalysisService', () => {
  let service: VideoAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
