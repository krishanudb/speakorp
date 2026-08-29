// Minimal structural type for the AppKit serving-plugin handle, capturing only
// what the Feedback Composer needs (a chat-style non-streaming invocation).
// Defined structurally so feature modules don't need to import AppKit internals.

// The AppKit serving invoke type accepts only user/assistant roles, so system
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

/** Loosely-typed serving response (OpenAI-compatible chat completion shape). */
export interface ServingInvokeResponse {
  choices?: Array<{ message?: { content?: string } }>;
  [key: string]: unknown;
}

export interface ServingHandle {
  invoke(req: ServingInvokeRequest): Promise<ServingInvokeResponse>;
}
