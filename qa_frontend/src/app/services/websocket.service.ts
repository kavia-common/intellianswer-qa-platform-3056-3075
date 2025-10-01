import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export type WsEvent =
  | { type: 'open' }
  | { type: 'close'; code?: number; reason?: string }
  | { type: 'error'; error?: any }
  | { type: 'token'; data?: string }
  | { type: 'done' };

/**
 * WebsocketService
 * Manages a persistent WebSocket connection for streaming LLM tokens.
 */
@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket?: WebSocket;
  private url = environment.wsUrl;
  private _messages$ = new BehaviorSubject<WsEvent | null>(null);

  public messages$ = this._messages$.asObservable();

  constructor() {
    // Attempt an eager connection; can be adjusted to lazy on first use.
    this.connect();
  }

  // PUBLIC_INTERFACE
  /**
   * Checks if the underlying socket exists and is in OPEN state.
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // PUBLIC_INTERFACE
  /**
   * Connects to the backend WebSocket endpoint. This method is resilient:
   * - Skips connection if URL is missing or a placeholder.
   * - Catches and reports errors without breaking app rendering.
   */
  connect(): void {
    try {
      const url = (this.url || '').trim();
      // Guard against empty/placeholder URLs to avoid runtime errors in preview envs.
      if (!url || url.includes('example.com')) {
        // Emit a close-like event so UI can know WS is not active; app continues normally.
        this._messages$.next({ type: 'close', code: 1000, reason: 'WebSocket URL not configured; skipping connect' });
        return;
      }

      this.socket = new WebSocket(url);
      this.socket.addEventListener('open', () => {
        this._messages$.next({ type: 'open' });
      });
      this.socket.addEventListener('message', (evt) => {
        try {
          const data = JSON.parse(evt.data);
          // Expecting shape: { type: 'token' | 'done', data?: string }
          if (data?.type === 'token') {
            this._messages$.next({ type: 'token', data: data.data });
          } else if (data?.type === 'done') {
            this._messages$.next({ type: 'done' });
          }
        } catch (_e) {
          // If not JSON, treat as token string
          this._messages$.next({ type: 'token', data: String(evt.data ?? '') });
        }
      });
      this.socket.addEventListener('close', (evt) => {
        this._messages$.next({ type: 'close', code: evt.code, reason: evt.reason });
      });
      this.socket.addEventListener('error', (err) => {
        // Report error but keep the app rendering normally
        this._messages$.next({ type: 'error', error: err });
      });
    } catch (e) {
      console.error('WS connect failed', e);
      // Ensure app continues by emitting a close event
      this._messages$.next({ type: 'close', code: 1006, reason: 'WS connect exception' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Sends a raw string message over the socket.
   */
  send(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Closes the socket.
   */
  close(): void {
    try {
      this.socket?.close();
    } catch (e) {
      console.error(e);
    }
  }
}
