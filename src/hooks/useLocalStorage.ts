import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored) as T;
    } catch {
      // ignore
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  useEffect(() => {
    const receiveUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: T }>).detail;
      if (detail?.key === key) setState(detail.value);
    };
    window.addEventListener('life2-local-storage', receiveUpdate);
    return () => window.removeEventListener('life2-local-storage', receiveUpdate);
  }, [key]);

  const update = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      window.dispatchEvent(new CustomEvent('life2-local-storage', { detail: { key, value: next } }));
      return next;
    });
  }, [key]);

  return [state, update];
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('da-DK').format(num);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('da-DK', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dayName(date: Date): string {
  return new Intl.DateTimeFormat('da-DK', { weekday: 'short' }).format(date).slice(0, 3);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
