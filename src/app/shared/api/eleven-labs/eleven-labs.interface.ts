export interface ElevenLabsVoice {
  available_for_tiers: unknown[];
  category: 'premade' | 'generated' | string & {};
  description: string | null;
  fine_tuning: {
    language: string | null;
    is_allowed_to_fine_tune: boolean;
    fine_tuning_requested: boolean;
    finetuning_state: string;
    verification_attempts: unknown | null;
  };
  high_quality_base_model_ids: unknown[];
  name: string;
  labels: Record<string, string>;
  preview_url: string;
  samples: unknown | null;
  settings: {
    similarity_boost: number,
    stability: number,
    style: number,
    use_speaker_boost: true
  } | null;
  sharing: unknown | null;
  voice_id: string;
}

export interface ElevenLabsModel {
  model_id: string;
  name: string;

  max_characters_request_free_user: number;
  max_characters_request_subscribed_user: number;

  can_be_finetuned: boolean;
  can_do_text_to_speech: boolean;
  can_do_voice_conversion: boolean;
  can_use_style: boolean;
  can_use_speaker_boost: boolean;
  description: string;
  languages: {
    language_id: string;
    name: string;
  }[];
  requires_alpha_access: boolean;
  serves_pro_voices: boolean;
  token_cost_factor: number;
}