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
   * Connects to the backend WebSocket endpoint.
   */
  connect(): void {
    try {
      this.socket = new WebSocket(this.url);
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
        this._messages$.next({ type: 'error', error: err });
      });
    } catch (e) {
      console.error('WS connect failed', e);
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
