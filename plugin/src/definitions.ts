export interface CapacitorYesflowSpeechPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
