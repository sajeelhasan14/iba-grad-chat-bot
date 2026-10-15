// Passed to every agent run (run(..., { context })). Tools read it, and can leave a button for the chat UI.
export type ChatContext = {
  sessionId: string; // which chat this is, so admissions and status updates find their way back
  payLink?: { label: string; url: string }; // set by a tool → shown as a "Pay" button under the reply
};
