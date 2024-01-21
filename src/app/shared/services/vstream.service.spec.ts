import { TestBed } from '@angular/core/testing';
import { VStreamService } from './vstream.service';
import { MockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { VStreamFeature } from '../state/vstream/vstream.feature';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LogService } from './logs.service';

describe('VStreamService', () => {
  let service: VStreamService;
  let store: MockStore;

  let logServiceStub: jasmine.SpyObj<LogService>;

  beforeEach(() => {
    logServiceStub = jasmine.createSpyObj('LogService', ['']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(VStreamFeature),
      ],
      providers: [
        VStreamService,
        { provide: LogService, useValue: logServiceStub },
        { provide: MockStore, useValue: store },
      ],
    });

    service = TestBed.inject(VStreamService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
