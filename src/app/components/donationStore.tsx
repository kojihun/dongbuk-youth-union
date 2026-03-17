import { serverSet } from "./dataSync";

const STORAGE_KEY = "donation_account";

export interface DonationAccount {
  text: string;
}

const defaultData: DonationAccount = {
  text: "농협 351-1307-9421-53 동북지회",
};

// 데이터 읽기
export function getDonationAccount(): DonationAccount {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load donation account from localStorage:", e);
  }
  return defaultData;
}

// 데이터 저장 (localStorage + 서버 이중 저장)
export function saveDonationAccount(data: DonationAccount): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save donation account to localStorage:", e);
  }
  serverSet(STORAGE_KEY, data);
}