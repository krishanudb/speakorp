// Minimal structural type for the AppKit serving-plugin handle, capturing only
// what the Feedback Composer needs (a chat-style non-streaming invocation).
//
// NOTE (verified against @databricks/appkit@0.57.0): there is a types-vs-runtime
// mismatch in appkit's serving handle. The .d.ts types `serving().invoke(body)`
// as resolving to the raw chat-completion, but at runtime it resolves to an
// ExecutionResult wrapper `{ ok, data }` (see plugins/serving/serving.js ->
// createEndpointAPI -> plugin.execute; the HTTP route unwraps `.data`).
// server.ts adapts around this and exposes the CLEAN contract below:
//   `invoke()` resolves to the raw chat-completion (text at
//   choices[0].message.content) and REJECTS on a serving error.
// Callers must still handle `ctx.serving === null` (endpoint not configured).

// The serving invoke type accepts only user/assistant roles, so any system
// instructions are folded into the first user turn by the Feedback Composer.
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ServingInvokeRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

/** Raw chat-completion response; the generated text is at choices[0].message.content. */
export interface ServingModelResponse {
  choices?: Array<{ message?: { content?: string } }>;
  [key: string]: unknown;
}

export interface ServingHandle {
  /** Resolves to the raw chat-completion; rejects on a serving error. */
  invoke(req: ServingInvokeRequest): Promise<ServingModelResponse>;
}
