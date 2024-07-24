import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { OpenAIService } from './openai.service';
import { GptSettingsState, OpenAIFeature } from '../state/openai/openai.feature';
import { AudioService } from './audio.service';
import { LogService } from './logs.service';
import { StoreModule } from '@ngrx/store';
import { OpenAI } from 'openai';

describe('OpenAIService', () => {
  let service: OpenAIService;

  let settings: GptSettingsState;

  let audioServiceStub: jasmine.SpyObj<AudioService>;
  let logServiceStub: jasmine.SpyObj<LogService>;

  let mockApi: jasmine.SpyObj<OpenAI>;

  beforeEach(() => {
    audioServiceStub = jasmine.createSpyObj('AudioService', ['playTts']);
    logServiceStub = jasmine.createSpyObj('LogService', ['add']);

    mockApi = jasmine.createSpyObj('OpenAIApi', ['chat.completions.create']);

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(OpenAIFeature),
      ],
      providers: [
        OpenAIService,
        { provide: AudioService, useValue: audioServiceStub },
        { provide: LogService, useValue: logServiceStub },
      ],
    });

    service = TestBed.inject(OpenAIService);

    settings = {
      model: 'gpt-4o',
      enabled: true,
      maxTokens: 300,
      frequencyPenalty: 1,
      presencePenalty: 1,
      temperature: 1,
      apiToken: 'my-fake-openai-token',
      historyLimit: 20,
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  xit('should playTts after generating a GPT response', fakeAsync(() => {
    // Arrange
    service.updateSettings(settings);
    const user = 'panku';
    const text = 'Hello world!';
    const response: OpenAI.ChatCompletion = {
      id: 'my-response',
      model: 'my-used-model',
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Hello panku!',
          },
          logprobs: null,
          index: 1,
          finish_reason: 'stop',
        },
      ],
      usage: undefined,
      created: 1234,
      object: 'chat.completion',
    };

    /**
     * @TODO - Learn how to mock AxiosResponses better.
     * For now I only ever access the data and nothing about the response... so I'll take the as any risk.
     */
    // mockApi.chat.completions.create({} as any).and.returnValue(Promise.resolve({
    //   data: response,
    // } as any));

    // Act
    service.generateOpenAIResponse(user, text);

    tick(500);

    // Assert
    expect(audioServiceStub.playTts).toHaveBeenCalled();
  }));
});
