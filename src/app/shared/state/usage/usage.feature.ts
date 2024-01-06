export interface UsageState {
  azure: {
    // Count every time the user tries to use STT
    speech_to_text_attempts: number;
    // Count every time Azure recognizes STT
    speech_to_text_success: number;
    // Count every time STT is not recognized or fails.
    speech_to_text_failures: number;
  }
  elevenLabs: {
    history_count: number;
  },
  openAI: {
    // How many tokens have been used by users lore + our generator specifics.
    total_prompt_tokens: number;
    // How many tokens OpenAI has used when returning generated content
    total_completion_tokens: number;
  },
  twitch: {
    // Keep track of some basic usage information from twitch users
    user_redeems: Record<string, {
      username: string;
      // How many times the user used twitch redeems
      total_redeems: number;
      // How many string characters they've sent.
      total_characters: number;
    }>
  },
}