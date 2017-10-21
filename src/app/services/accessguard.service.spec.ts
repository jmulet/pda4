import { TestBed, inject } from '@angular/core/testing';

import { AccessguardService } from './accessguard.service';

describe('AccessguardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccessguardService]
    });
  });

  it('should be created', inject([AccessguardService], (service: AccessguardService) => {
    expect(service).toBeTruthy();
  }));
});
