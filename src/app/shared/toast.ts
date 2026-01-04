// src/app/components/toast-container.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToastService, ToastType } from '../services/toast.service';
import { LucideAngularModule, X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-angular';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toastsList(); track toast.id) {
        <div class="toast toast-{{toast.type}}">
          <div class="toast-content">
            <div class="toast-icon">
              @switch (toast.type) {
                @case ('success') { <lucide-icon [img]="checkCircle" size="20"></lucide-icon> }
                @case ('error') { <lucide-icon [img]="alertCircle" size="20"></lucide-icon> }
                @case ('warning') { <lucide-icon [img]="alertTriangle" size="20"></lucide-icon> }
                @case ('info') { <lucide-icon [img]="info" size="20"></lucide-icon> }
              }
            </div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" (click)="closeToast(toast.id)">
            <lucide-icon [img]="xIcon" size="16"></lucide-icon>
          </button>
          @if (toast.duration && toast.duration > 0) {
            <div class="toast-progress">
              <div class="toast-progress-bar" 
                   [style.animation-duration]="toast.duration + 'ms'"
                   (animationend)="onProgressBarAnimationEnd(toast.id)">
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }

    .toast {
      position: relative;
      background: #1a1c22;
      border: 1px solid #2d3139;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      transform: translateX(0);
      opacity: 1;
      transition: all 0.3s ease;
      animation: toastSlideIn 0.3s ease-out;
      overflow: hidden;
    }

    @keyframes toastSlideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast.toast-exiting {
      animation: toastSlideOut 0.3s ease-in forwards;
    }

    @keyframes toastSlideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .toast-message {
      color: #f0f6fc;
      font-size: 14px;
      line-height: 1.4;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: #8b949e;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .toast-close:hover {
      color: #f0f6fc;
      background: rgba(255, 255, 255, 0.1);
    }

    .toast-success {
      border-left: 4px solid #10b981;
    }

    .toast-success .toast-icon {
      color: #10b981;
    }

    .toast-error {
      border-left: 4px solid #ef4444;
    }

    .toast-error .toast-icon {
      color: #ef4444;
    }

    .toast-warning {
      border-left: 4px solid #f59e0b;
    }

    .toast-warning .toast-icon {
      color: #f59e0b;
    }

    .toast-info {
      border-left: 4px solid #3b82f6;
    }

    .toast-info .toast-icon {
      color: #3b82f6;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }

    .toast-progress-bar {
      height: 100%;
      background: rgba(255, 255, 255, 0.3);
      animation: progress linear forwards;
      transform-origin: left;
    }

    @keyframes progress {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }
  `]
})
export class ToastContainer implements OnInit, OnDestroy {
  readonly checkCircle = CheckCircle;
  readonly alertCircle = AlertCircle;
  readonly alertTriangle = AlertTriangle;
  readonly info = Info;
  readonly xIcon = X;

  private timers = new Map<number, any>();

  constructor(
    public toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupAutoRemove();
    }
  }

  private setupAutoRemove() {
    // Observer les changements de toasts pour gérer les timers
    // Cette approche est plus simple que de modifier le service
  }

  closeToast(id: number) {
    this.removeToast(id);
  }

  onProgressBarAnimationEnd(id: number) {
    // Quand la barre de progression termine, on supprime le toast
    this.removeToast(id);
  }

  private removeToast(id: number) {
    // Nettoyer le timer s'il existe
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }
    
    // Ajouter une classe pour l'animation de sortie
    const toastElement = document.querySelector(`.toast[data-toast-id="${id}"]`);
    if (toastElement) {
      toastElement.classList.add('toast-exiting');
      setTimeout(() => {
        this.toastService.remove(id);
      }, 300);
    } else {
      this.toastService.remove(id);
    }
  }

  ngOnDestroy() {
    // Nettoyer tous les timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}