import { supabase } from "../../../supabase/client";

export interface Submission {
  id: string;
  nickname: string;
  church: string;
  category: string;
  content: string;
  password: string;
  created_at: string;
  admin_reply?: string | null;
  replied_at?: string | null;
  device_id?: string | null;
  device_label?: string | null;
  user_agent?: string | null;
}

export async function getContacts(): Promise<Submission[]> {
  const { data, error } = await supabase
    .from("opinions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load contacts from Supabase:", error);
    return [];
  }

  return (data as Submission[]) ?? [];
}

export async function addContact(contact: {
  nickname: string;
  church: string;
  category: string;
  content: string;
  password: string;
}): Promise<boolean> {
  const deviceId = localStorage.getItem("deviceId") || crypto.randomUUID();
  localStorage.setItem("deviceId", deviceId);

  const deviceLabel = localStorage.getItem("deviceLabel") || "내 기기";

  const { error } = await supabase.from("opinions").insert([
    {
      nickname: contact.nickname,
      church: contact.church,
      category: contact.category,
      content: contact.content,
      password: contact.password,
      device_id: deviceId,
      device_label: deviceLabel,
      user_agent: navigator.userAgent,
    },
  ]);

  if (error) {
    console.error("Failed to insert contact:", error);
    return false;
  }

  return true;
}

export async function deleteContact(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("opinions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete contact:", error);
    return false;
  }

  return true;
}

export async function updateContact(
  id: string,
  updates: {
    admin_reply?: string;
  }
): Promise<boolean> {
  const payload: Record<string, unknown> = {};

  if (updates.admin_reply !== undefined) {
    payload.admin_reply = updates.admin_reply;
    payload.replied_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("opinions")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("Failed to update contact:", error);
    return false;
  }

  return true;
}