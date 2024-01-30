import { Injectable } from '@angular/core';
import { Configuration, OpenAIApi } from 'openai';

@Injectable()
export class OpenAIFactory {
  createApi(options: Pick<Configuration, 'apiKey'>) {
    const config = new Configuration(options);
    return new OpenAIApi(config);
  }
}