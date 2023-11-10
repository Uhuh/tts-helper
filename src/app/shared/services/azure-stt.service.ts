import { Injectable } from '@angular/core';
import sdk from 'microsoft-cognitiveservices-speech-sdk';
import { ConfigService } from './config.service';

@Injectable()
export class AzureSttService {
  constructor(private readonly configService: ConfigService) {}
}