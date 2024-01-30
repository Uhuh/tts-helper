import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { OpenAIService } from './openai.service';
import { GptSettingsState, OpenAIFeature } from '../state/openai/openai.feature';
import { AudioService } from './audio.service';
import { LogService } from './logs.service';
import { StoreModule } from '@ngrx/store';
import { OpenAIFactory } from './openai.factory';
import { Configuration, CreateChatCompletionResponse, OpenAIApi } from 'openai';

describe('OpenAIService', () => {
  let service: OpenAIService;

  let settings: GptSettingsState;

  let audioServiceStub: jasmine.SpyObj<AudioService>;
  let logServiceStub: jasmine.SpyObj<LogService>;
  let factoryStub: jasmine.SpyObj<OpenAIFactory>;

  let mockApi: jasmine.SpyObj<OpenAIApi>;

  beforeEach(() => {
    audioServiceStub = jasmine.createSpyObj('AudioService', ['playTts']);
    logServiceStub = jasmine.createSpyObj('LogService', ['add']);

    mockApi = jasmine.createSpyObj('OpenAIApi', ['createChatCompletion']);

    factoryStub = jasmine.createSpyObj('OpenAIFactory', ['createApi']);
    factoryStub.createApi.and.returnValue(mockApi);

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(OpenAIFeature),
      ],
      providers: [
        OpenAIService,
        { provide: AudioService, useValue: audioServiceStub },
        { provide: LogService, useValue: logServiceStub },
        { provide: OpenAIFactory, useValue: factoryStub },
      ],
    });

    service = TestBed.inject(OpenAIService);

    settings = {
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

  it('should playTts after generating a GPT response', fakeAsync(() => {
    // Arrange
    service.updateSettings(settings);
    const user = 'panku';
    const text = 'Hello world!';
    const response: CreateChatCompletionResponse = {
      id: 'my-response',
      model: 'my-used-model',
      choices: [
        {
          message: {
            role: 'system',
            function_call: undefined,
            content: 'Hello panku!',
          },
          index: 1,
          finish_reason: 'good one',
        },
      ],
      usage: undefined,
      created: 1234,
      object: 'some object?',
    };

    /**
     * @TODO - Learn how to mock AxiosResponses better.
     * For now I only ever access the data and nothing about the response... so I'll take the as any risk.
     */
    mockApi.createChatCompletion.and.returnValue(Promise.resolve({
      data: response,
    } as any));

    // Act
    service.generateOpenAIResponse(user, text);

    tick(500);

    // Assert
    expect(audioServiceStub.playTts).toHaveBeenCalled();
  }));
});
