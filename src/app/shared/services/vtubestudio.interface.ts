export enum VTubeStudioMessageType {
  APIError = 'APIError',
  AuthenticationTokenRequest = 'AuthenticationTokenRequest',
  AuthenticationTokenResponse = 'AuthenticationTokenResponse',
  AuthenticationRequest = 'AuthenticationRequest',
  AuthenticationResponse = 'AuthenticationResponse',
  ParameterValueRequest = 'ParameterValueRequest',
  ParameterValueResponse = 'ParameterValueResponse',
  ParameterCreationRequest = 'ParameterCreationRequest',
  Live2DParameterListRequest = 'Live2DParameterListRequest',
  InjectParameterDataRequest = 'InjectParameterDataRequest',
  InjectParameterDataResponse = 'InjectParameterDataResponse',
}

export interface AuthResponse {
  authenticated: boolean;
  reason: string;
}

export interface VTubeStudioParameter {
  parameterName: string;
  explanation: string;
  min: number;
  max: number;
  defaultValue: number;
}

export enum TTSHelperParameterNames {
  TTSHelperMouthOpen = 'TTSHelperMouthOpen',
  TTSHelperMouthForm = 'TTSHelperMouthForm',
};

export const TTSHelperParameters: Readonly<VTubeStudioParameter[]> = [
  {
    max: 1,
    min: 0,
    defaultValue: 0.1,
    explanation: 'Mouth open?',
    parameterName: TTSHelperParameterNames.TTSHelperMouthOpen
  },
  {
    max: 1,
    min: -1,
    defaultValue: 0.5,
    explanation: 'Mouth form?',
    parameterName: TTSHelperParameterNames.TTSHelperMouthForm
  }
] as const;