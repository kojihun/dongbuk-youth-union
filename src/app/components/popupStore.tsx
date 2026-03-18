import { serverSet } from "./dataSync";

const STORAGE_KEY = "admin_popups";

export interface PopupItem {
  id: string;
  title: string;
  description: string;
  image: string; // base64
  visible: boolean;
  linkUrl: string;
  linkLabel: string;
}

const defaultData: PopupItem[] = [];

export function generatePopupId(): string {
  return "popup_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}

export function getPopups(): PopupItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load popups from localStorage:", e);
  }
  return defaultData;
}

export function savePopups(popups: PopupItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(popups));
  serverSet(STORAGE_KEY, popups);
}

export const MAX_POPUPS = 5;