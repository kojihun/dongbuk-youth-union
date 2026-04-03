import { serverSet } from "./dataSync";

const STORAGE_KEY = "contact_submissions";

export interface Submission {
  id: number;
  name: string;
  church: string;
  category: string;
  message: string;
  password: string;
  date: string;
  reply?: string;
}

export function getContacts(): Submission[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load contacts from localStorage:", e);
  }
  return [];
}

export function saveContacts(contacts: Submission[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  serverSet(STORAGE_KEY, contacts);
}

export function addContact(contact: Submission): void {
  const contacts = getContacts();
  const newContacts = [contact, ...contacts];
  saveContacts(newContacts);
}

export function deleteContact(id: number): void {
  const contacts = getContacts();
  const filtered = contacts.filter((c) => c.id !== id);
  saveContacts(filtered);
}

export function updateContact(id: number, updates: Partial<Submission>): void {
  const contacts = getContacts();
  const updated = contacts.map(c => c.id === id ? { ...c, ...updates } : c);
  saveContacts(updated);
}
