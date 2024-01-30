import { TestBed } from '@angular/core/testing';
import { VStreamService } from './vstream.service';
import { StoreModule } from '@ngrx/store';
import {
  VStreamChannelState,
  VStreamCustomMessageState,
  VStreamFeature,
  VStreamTokenResponse,
} from '../state/vstream/vstream.feature';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LogService } from './logs.service';
import { VStreamApi } from '../api/vstream/vstream.api';
import { VStreamActions } from '../state/vstream/vstream.actions';

describe('VStreamService', () => {
  let service: VStreamService;

  const channelInfo: VStreamChannelState = {
    channelId: 'chan_my-cool-channel-id',
    username: 'panku',
    channelUrl: '',
    pictureUrl: '',
  };

  const token: VStreamTokenResponse = {
    refresh_token: 'my_refresh_token',
    expires_in: 111233321,
    access_token: 'my_access_token',
    id_token: 'my_id_token',
    token_type: 'Bearer',
    scope: 'chat:write',
  };

  let logServiceStub: jasmine.SpyObj<LogService>;
  let vstreamApiStub: jasmine.SpyObj<VStreamApi>;

  beforeEach(() => {
    logServiceStub = jasmine.createSpyObj('LogService', ['add']);
    vstreamApiStub = jasmine.createSpyObj('VStreamApi', ['postChannelMessage']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(VStreamFeature),
      ],
      providers: [
        VStreamService,
        { provide: LogService, useValue: logServiceStub },
        { provide: VStreamApi, useValue: vstreamApiStub },
      ],
    });

    service = TestBed.inject(VStreamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post channel message', () => {
    // Arrange

    const text = 'Hello world!';

    const liveStreamID = 'video_my-video-id';

    service.updateChannelInfo(channelInfo);
    service.updateToken(token);

    service.liveStreamID$.next(liveStreamID);

    // Act

    service.postChannelMessage(text);

    // Assert

    expect(vstreamApiStub.postChannelMessage).toHaveBeenCalledOnceWith(text, token.access_token, channelInfo.channelId, liveStreamID);
  });
});
