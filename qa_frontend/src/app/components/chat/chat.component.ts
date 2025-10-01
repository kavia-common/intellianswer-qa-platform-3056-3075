import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService, AskRequest } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';

/**
 * ChatComponent
 * - Displays conversation messages (user and assistant).
 * - Sends a question via REST (POST /ask).
 * - Optionally listens to websocket stream for incremental tokens.
 */
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnDestroy {
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string, pending?: boolean }> = [
    { role: 'system', content: 'Welcome to IntelliAnswer! Ask me anything about your data, code, or docs.' }
  ];

  sending = false;
  wsSub?: Subscription;

  form = this.fb.group({
    question: ['', [Validators.required, Validators.minLength(2)]]
  });

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private ws: WebsocketService
  ) {
    // Subscribe to WS token stream if available
    this.wsSub = this.ws.messages$.subscribe(ev => {
      if (!ev) return;
      if (ev.type === 'token') {
        this.appendStreamingToken(ev.data ?? '');
      } else if (ev.type === 'done') {
        this.finalizeStreaming();
      }
    });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  // PUBLIC_INTERFACE
  submit(): void {
    if (this.form.invalid || this.sending) return;
    const question = this.form.value.question?.trim();
    if (!question) return;

    this.messages.push({ role: 'user', content: question });
    this.form.reset();
    this.sending = true;

    const req: AskRequest = { question };

    // First try websocket streaming if connected; also send REST as a fallback or to initiate context.
    if (this.ws.isConnected()) {
      this.prepareAssistantPending();
      this.ws.send(JSON.stringify({ action: 'ask', payload: req }));
      // Optionally also call REST to ensure persistence or in case WS is not supported by backend.
      this.api.ask(req).subscribe({
        next: (res) => {
          // If WS isn't used by backend, we still get final answer here.
          if (!this.hasPendingAssistant()) {
            this.messages.push({ role: 'assistant', content: res.answer ?? '(no answer)' });
          }
        },
        error: (err) => {
          this.handleError(err);
        },
        complete: () => { this.sending = false; }
      });
    } else {
      // Pure REST path
      this.api.ask(req).subscribe({
        next: (res) => {
          this.messages.push({ role: 'assistant', content: res.answer ?? '(no answer)' });
        },
        error: (err) => {
          this.handleError(err);
        },
        complete: () => { this.sending = false; }
      });
    }
  }

  private prepareAssistantPending() {
    this.messages.push({ role: 'assistant', content: '', pending: true });
  }

  private hasPendingAssistant(): boolean {
    return this.messages.some(m => m.role === 'assistant' && m.pending);
  }

  private appendStreamingToken(token: string) {
    const idx = this.messages.findIndex(m => m.role === 'assistant' && m.pending);
    if (idx >= 0) {
      this.messages[idx].content += token;
    } else {
      this.prepareAssistantPending();
      this.appendStreamingToken(token);
    }
  }

  private finalizeStreaming() {
    const idx = this.messages.findIndex(m => m.role === 'assistant' && m.pending);
    if (idx >= 0) {
      this.messages[idx].pending = false;
    }
    this.sending = false;
  }

  private handleError(err: any) {
    console.error(err);
    this.messages.push({ role: 'system', content: 'An error occurred. Please try again.' });
    this.sending = false;
  }
}
