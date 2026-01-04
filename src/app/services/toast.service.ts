import { Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  public toastsList = this.toasts.asReadonly();

  private currentId = 0;

  show(message: string, type: ToastType = 'info', duration: number = 5000) {
    const newToast: Toast = {
      id: this.currentId++,
      message,
      type,
      duration
    };

    this.toasts.update(toasts => [...toasts, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(newToast.id);
      }, duration);
    }

    return newToast.id;
  }

  success(message: string, duration: number = 5000) {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000) {
    return this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 5000) {
    return this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 5000) {
    return this.show(message, 'info', duration);
  }

  remove(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clearAll() {
    this.toasts.set([]);
  }
}