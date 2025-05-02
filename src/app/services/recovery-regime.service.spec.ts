import { TestBed } from '@angular/core/testing';

import { RecoveryRegimeService } from './recovery-regime.service';

describe('RecoveryRegimeService', () => {
  let service: RecoveryRegimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecoveryRegimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
