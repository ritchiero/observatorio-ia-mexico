import { type ClassValue, clsx } from 'clsx';
import { StatusType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getStatusColor(status: StatusType): string {
  const colors: Record<StatusType, string> = {
    prometido: 'bg-yellow-500',
    en_desarrollo: 'bg-blue-500',
    operando: 'bg-green-500',
    incumplido: 'bg-red-500',
    abandonado: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
}

export function getStatusLabel(status: StatusType): string {
  const labels: Record<StatusType, string> = {
    prometido: 'Prometido',
    en_desarrollo: 'En Desarrollo',
    operando: 'Operando',
    incumplido: 'Incumplido',
    abandonado: 'Abandonado',
  };
  return labels[status] || status;
}

export function getStatusEmoji(status: StatusType): string {
  const emojis: Record<StatusType, string> = {
    prometido: '🟡',
    en_desarrollo: '🔵',
    operando: '🟢',
    incumplido: '🔴',
    abandonado: '⚫',
  };
  return emojis[status] || '⚪';
}

export function formatDate(date: Date | null): string {
  if (!date) return 'No especificada';
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateShort(date: Date | null): string {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
  }).format(date);
}
