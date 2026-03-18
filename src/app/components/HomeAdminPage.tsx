import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Link as LinkIcon,
  Lock,
} from "lucide-react";
import {
  getHomeData,
  saveHomeData,
  DEFAULT_HOME,
  generateNavId,
  type HomeData,
  type NavLinkItem,
} from "./homeStore";
import {
  getVerse,
  saveVerse,
  DEFAULT_VERSE,
  type VerseData,
} from "./verseStore";
import {
  getEvents,
  saveEvents,
  generateId,
  type EventItem,
} from "./eventStore";
import { getPassword, savePassword } from "./passwordStore";
import {
  getDonationAccount,
  saveDonationAccount,
  type DonationAccount,
} from "./donationStore";
import {
  getBrandImages,
  saveBrandImages,
  type BrandImages,
} from "./brandStore";
import {
  getPopups,
  savePopups,
  generatePopupId,
  MAX_POPUPS,
  type PopupItem,
} from "./popupStore";

/* ─── 공유 스타일 ─── */
const inputCls =
  "w-full border border-[#ddd] rounded-[8px] px-[12px] py-[10px] text-[14px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors bg-white";
const textareaCls = inputCls + " resize-none";
const fv = { fontVariationSettings: "'wdth' 100" };

const CATEGORIES = ["공지", "예배", "행사", "교육", "봉사", "기타"];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[12px] text-[#767676] tracking-[-0.3px] mb-[6px]"
      style={fv}
    >
      {children}
    </p>
  );
}

/* ─── 섹션 접이식 래퍼 ─── */
function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-[12px] border border-[#eee] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-[16px] md:px-[24px] py-[14px] md:py-[16px] border-b border-[#f0f0f0] cursor-pointer bg-transparent border-none"
      >
        <p
          className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.4px]"
          style={fv}
        >
          {title}
        </p>
        {open ? (
          <ChevronDown size={18} className="text-[#999]" />
        ) : (
          <ChevronRight size={18} className="text-[#999]" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-[16px] md:px-[24px] py-[16px] md:py-[20px]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   메인 컴포넌트
   ═══════════════════════════════════════════════ */
export default function HomeAdminPage() {
  const navigate = useNavigate();
  const [home, setHome] = useState<HomeData>(() => getHomeData());
  const [verse, setVerse] = useState<VerseData>(() => getVerse());
  const [events, setEvents] = useState<EventItem[]>(() => getEvents());
  const [saveMessage, setSaveMessage] = useState("");

  /* 행사 관련 상태 */
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const emptyEvent: Omit<EventItem, "id"> = {
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    location: "",
    description: "",
    registerUrl: "",
    visible: true,
    category: "행사",
  };
  const [newEvent, setNewEvent] = useState<Omit<EventItem, "id">>(emptyEvent);

  /* 비밀번호 변경 상태 */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  /* 기부 계좌 상태 */
  const [donationAccount, setDonationAccount] = useState<DonationAccount>(() => getDonationAccount());
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");

  /* 브랜드 이미지 상태 */
  const [brandImages, setBrandImages] = useState<BrandImages>(() => getBrandImages());
  const [brandError, setBrandError] = useState("");
  const [brandSuccess, setBrandSuccess] = useState("");

  /* 홍보창 상태 */
  const [popups, setPopups] = useState<PopupItem[]>(() => getPopups());

  const toast = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  /* ─── 저장 핸들러 ─── */
  const handleSaveAll = () => {
    saveHomeData(home);
    saveVerse(verse);
    saveEvents(events);
    saveDonationAccount(donationAccount);
    saveBrandImages(brandImages);
    savePopups(popups);
    toast("모든 변경사항이 저장되었습니다");
  };

  /* ─── Nav Links 핸들러 ─── */
  const updateNav = (id: string, patch: Partial<NavLinkItem>) => {
    const updated = {
      ...home,
      navLinks: home.navLinks.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    };
    setHome(updated);
    saveHomeData(updated);
  };
  const addNav = () => {
    const updated = {
      ...home,
      navLinks: [
        ...home.navLinks,
        {
          id: generateNavId(),
          label: "New Link",
          url: "#",
          isExternal: true,
          visible: true,
        },
      ],
    };
    setHome(updated);
    saveHomeData(updated);
  };
  const removeNav = (id: string) => {
    const updated = { ...home, navLinks: home.navLinks.filter((n) => n.id !== id) };
    setHome(updated);
    saveHomeData(updated);
  };
  const moveNav = (idx: number, dir: -1 | 1) => {
    const arr = [...home.navLinks];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    const updated = { ...home, navLinks: arr };
    setHome(updated);
    saveHomeData(updated);
  };

  /* ─── Intro 핸들러 ─── */
  const updateParagraph = (i: number, text: string) => {
    const p = [...home.intro.paragraphs];
    p[i] = text;
    const updated = { ...home, intro: { ...home.intro, paragraphs: p } };
    setHome(updated);
    saveHomeData(updated);
  };
  const addParagraph = () => {
    const updated = {
      ...home,
      intro: { ...home.intro, paragraphs: [...home.intro.paragraphs, ""] },
    };
    setHome(updated);
    saveHomeData(updated);
  };
  const removeParagraph = (i: number) => {
    const p = home.intro.paragraphs.filter((_, idx) => idx !== i);
    const updated = { ...home, intro: { ...home.intro, paragraphs: p } };
    setHome(updated);
    saveHomeData(updated);
  };

  /* ─── Intro 정렬 ─── */
  const introAlignOptions: { value: HomeData["intro"]["align"]; label: string; icon: React.ReactNode }[] = [
    {
      value: "left",
      label: "왼쪽",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M2 6h8M2 9h10M2 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      value: "center",
      label: "가운데",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M4 6h8M3 9h10M5 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      value: "right",
      label: "오른쪽",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M6 6h8M4 9h10M8 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  /* ─── Verse 정렬 ─── */
  const alignOptions: { value: VerseData["align"]; label: string; icon: React.ReactNode }[] = [
    {
      value: "left",
      label: "왼쪽",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M2 6h8M2 9h10M2 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      value: "center",
      label: "가운데",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M4 6h8M3 9h10M5 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      value: "right",
      label: "오른쪽",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M6 6h8M4 9h10M8 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  /* ─── 행사 핸들러 ─── */
  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;
    const updated = [...events, { ...newEvent, id: generateId() }];
    setEvents(updated);
    saveEvents(updated);
    setNewEvent(emptyEvent);
    setShowAddForm(false);
  };

  const updateEvent = (id: string, patch: Partial<EventItem>) => {
    const updated = events.map((e) => (e.id === id ? { ...e, ...patch } : e));
    setEvents(updated);
    saveEvents(updated);
  };

  const removeEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
    setDeleteConfirmId(null);
  };

  const moveEvent = (idx: number, dir: -1 | 1) => {
    const arr = [...events];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    setEvents(arr);
    saveEvents(arr);
  };

  /* ─── 초기화 핸들러 ─── */
  const handleResetNav = () => {
    setHome({ ...home, navLinks: JSON.parse(JSON.stringify(DEFAULT_HOME.navLinks)) });
    toast("네비게이션이 기본값으로 복원되었습니다");
  };
  const handleResetIntro = () => {
    setHome({ ...home, intro: JSON.parse(JSON.stringify(DEFAULT_HOME.intro)) });
    toast("소개 문구가 기본값으로 복원되었습니다");
  };
  const handleResetVerse = () => {
    setVerse({ ...DEFAULT_VERSE });
    toast("성경구절이 기본값으로 복원되었습니다");
  };

  /* ─── 브랜드 이미지 업로드 핸들러 ─── */
  const handleBrandImageUpload = (
    key: keyof BrandImages,
    file: File
  ) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_W = 1200;
        const MAX_H = 800;
        let w = img.width;
        let h = img.height;
        if (w > MAX_W) { h = (h * MAX_W) / w; w = MAX_W; }
        if (h > MAX_H) { w = (w * MAX_H) / h; h = MAX_H; }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        const updated = { ...brandImages, [key]: base64 };
        setBrandImages(updated);
        saveBrandImages(updated);
        toast("이미지가 등록되었습니다");
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleBrandImageRemove = (key: keyof BrandImages) => {
    const updated = { ...brandImages, [key]: "" };
    setBrandImages(updated);
    saveBrandImages(updated);
    toast("이미지가 삭제되었습니다");
  };

  /* ─── 홍보창 핸들러 ─── */
  const handlePopupImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_W = 1200;
        const MAX_H = 800;
        let w = img.width;
        let h = img.height;
        if (w > MAX_W) { h = (h * MAX_W) / w; w = MAX_W; }
        if (h > MAX_H) { w = (w * MAX_H) / h; h = MAX_H; }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        const updated = popups.map((p) => (p.id === id ? { ...p, image: base64 } : p));
        setPopups(updated);
        savePopups(updated);
        toast("홍보 이미지가 등록되었습니다");
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addPopup = () => {
    if (popups.length >= MAX_POPUPS) return;
    const newPopup: PopupItem = {
      id: generatePopupId(),
      title: "",
      description: "",
      image: "",
      visible: true,
      linkUrl: "",
      linkLabel: "자세히 보기",
    };
    const updated = [...popups, newPopup];
    setPopups(updated);
    savePopups(updated);
  };

  const updatePopup = (id: string, patch: Partial<PopupItem>) => {
    const updated = popups.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setPopups(updated);
    savePopups(updated);
  };

  const removePopup = (id: string) => {
    const updated = popups.filter((p) => p.id !== id);
    setPopups(updated);
    savePopups(updated);
    toast("홍보창이 삭제되었습니다");
  };

  /* ─── 비밀번호 변경 핸들러 ─── */
  const handlePasswordChange = () => {
    setPwError("");
    setPwSuccess("");
    if (!verifyPassword(currentPw)) {
      setPwError("현재 비밀번호가 올바르지 않습니다");
      return;
    }
    if (newPw.length < 4) {
      setPwError("새 비밀번호는 4자리 이상이어야 합니다");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("새 비밀번호가 일치하지 않습니다");
      return;
    }
    savePassword(newPw);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setPwSuccess("비밀번호가 변경되었습니다");
    toast("비밀번호가 변경되었습니다");
  };

  return (
    <div className="bg-[#f8f8f6] min-h-screen pb-[60px]">
      {/* ─── 헤더 ─── */}
      <div className="bg-white border-b border-[#eee] sticky top-0 z-10">
        <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[14px] md:py-[16px] flex items-center gap-[12px]">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-[6px] text-[#767676] hover:text-black active:text-black transition-colors cursor-pointer bg-transparent border-none p-[6px] -ml-[6px]"
          >
            <ArrowLeft size={18} />
            <span
              className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[13px] tracking-[-0.3px] hidden sm:inline"
              style={fv}
            >
              돌아가기
            </span>
          </button>
          <div className="flex-1" />
          <p
            className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.4px]"
            style={fv}
          >
            대문 페이지 관리
          </p>
          <div className="flex-1" />
          <button
            onClick={handleSaveAll}
            className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[16px] py-[9px] rounded-[8px] bg-[#4a6741] hover:bg-[#3d5636] transition-colors cursor-pointer border-none"
          >
            전체 저장
          </button>
        </div>
      </div>

      {/* ─── Toast ─── */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            className="fixed top-[70px] left-[50%] z-50 bg-[#4a6741] text-white px-[16px] py-[10px] rounded-[8px] shadow-lg whitespace-nowrap"
            initial={{ opacity: 0, y: -10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] tracking-[-0.3px]" style={fv}>
              {saveMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[24px] md:py-[36px] flex flex-col gap-[16px] md:gap-[20px]">

        {/* ═══ 1. 네비게이션 링크 ═══ */}
        <Section title="네비게이션 링크" defaultOpen={true}>
          <div className="flex flex-col gap-[12px]">
            {home.navLinks.map((link, idx) => (
              <div
                key={link.id}
                className="flex flex-col sm:flex-row gap-[8px] sm:items-center p-[12px] bg-[#fafaf8] rounded-[8px] border border-[#f0f0f0]"
              >
                {/* 순서 이동 */}
                <div className="flex sm:flex-col gap-[2px] shrink-0">
                  <button
                    onClick={() => moveNav(idx, -1)}
                    disabled={idx === 0}
                    className="text-[#bbb] hover:text-[#666] disabled:opacity-30 cursor-pointer disabled:cursor-default bg-transparent border-none p-[2px]"
                  >
                    <ChevronDown size={14} className="rotate-180" />
                  </button>
                  <button
                    onClick={() => moveNav(idx, 1)}
                    disabled={idx === home.navLinks.length - 1}
                    className="text-[#bbb] hover:text-[#666] disabled:opacity-30 cursor-pointer disabled:cursor-default bg-transparent border-none p-[2px]"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* 필드 */}
                <div className="flex-1 flex flex-col sm:flex-row gap-[8px]">
                  <input
                    value={link.label}
                    onChange={(e) => updateNav(link.id, { label: e.target.value })}
                    placeholder="라벨"
                    className={inputCls + " sm:max-w-[160px]"}
                  />
                  <input
                    value={link.url}
                    onChange={(e) => updateNav(link.id, { url: e.target.value })}
                    placeholder="URL"
                    className={inputCls + " flex-1"}
                  />
                </div>

                {/* 토글 버튼들 */}
                <div className="flex items-center gap-[6px] shrink-0">
                  <button
                    onClick={() => updateNav(link.id, { isExternal: !link.isExternal })}
                    title={link.isExternal ? "외부 링크" : "내부 링크"}
                    className={`p-[7px] rounded-[6px] border cursor-pointer transition-all duration-200 ${
                      link.isExternal
                        ? "border-[#ddd] text-[#999] bg-white hover:border-[#bbb]"
                        : "border-[#4a6741] text-[#4a6741] bg-[#f0f5ef]"
                    }`}
                  >
                    {link.isExternal ? <ExternalLink size={14} /> : <LinkIcon size={14} />}
                  </button>
                  <button
                    onClick={() => updateNav(link.id, { visible: !link.visible })}
                    className={`p-[7px] rounded-[6px] border cursor-pointer transition-all duration-200 ${
                      link.visible
                        ? "border-[#4a6741] text-[#4a6741] bg-[#f0f5ef]"
                        : "border-[#ddd] text-[#ccc] bg-white"
                    }`}
                  >
                    {link.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => removeNav(link.id)}
                    className="p-[7px] rounded-[6px] border border-[#ddd] text-[#ccc] hover:text-red-400 hover:border-red-300 cursor-pointer transition-all duration-200 bg-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-[8px] mt-[4px]">
              <button
                onClick={addNav}
                className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#4a6741] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-dashed border-[#4a6741]/30 hover:border-[#4a6741] transition-colors cursor-pointer bg-transparent"
              >
                <Plus size={14} />
                링크 추가
              </button>
              <button
                onClick={handleResetNav}
                className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#999] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-[#ddd] hover:border-[#999] transition-colors cursor-pointer bg-white"
              >
                <RotateCcw size={12} />
                기본값
              </button>
            </div>
          </div>
        </Section>

        {/* ═══ 2. 소개 문구 ═══ */}
        <Section title="소개 문구" defaultOpen={true}>
          <div className="flex flex-col gap-[16px]">
            <div>
              <Label>섹션 제목</Label>
              <input
                value={home.intro.title}
                onChange={(e) => {
                  const updated = { ...home, intro: { ...home.intro, title: e.target.value } };
                  setHome(updated);
                  saveHomeData(updated);
                }}
                placeholder="동북시찰청년연합회"
                className={inputCls}
              />
            </div>

            {/* 텍스트 정렬 */}
            <div>
              <Label>텍스트 정렬</Label>
              <div className="flex gap-[6px]">
                {introAlignOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      const updated = { ...home, intro: { ...home.intro, align: opt.value } };
                      setHome(updated);
                      saveHomeData(updated);
                    }}
                    className={`flex items-center gap-[6px] px-[14px] py-[9px] rounded-[8px] border text-[13px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] cursor-pointer transition-all duration-200 ${
                      (home.intro.align || "center") === opt.value
                        ? "border-[#4a6741] bg-[#f0f5ef] text-[#4a6741]"
                        : "border-[#ddd] bg-white text-[#999] hover:border-[#bbb]"
                    }`}
                  >
                    {opt.icon}
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {home.intro.paragraphs.map((para, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-[6px]">
                  <Label>문단 {i + 1}</Label>
                  {home.intro.paragraphs.length > 1 && (
                    <button
                      onClick={() => removeParagraph(i)}
                      className="text-[#ccc] hover:text-red-400 cursor-pointer bg-transparent border-none p-[2px]"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <textarea
                  value={para}
                  onChange={(e) => updateParagraph(i, e.target.value)}
                  rows={4}
                  className={textareaCls}
                  placeholder="소개 문구를 입력하세요 (줄바꿈 가능)"
                />
              </div>
            ))}
            <div className="flex gap-[8px]">
              <button
                onClick={addParagraph}
                className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#4a6741] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-dashed border-[#4a6741]/30 hover:border-[#4a6741] transition-colors cursor-pointer bg-transparent"
              >
                <Plus size={14} />
                문단 추가
              </button>
              <button
                onClick={handleResetIntro}
                className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#999] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-[#ddd] hover:border-[#999] transition-colors cursor-pointer bg-white"
              >
                <RotateCcw size={12} />
                기본값
              </button>
            </div>
          </div>
        </Section>

        {/* ═══ 3. 성경구절 ═══ */}
        <Section title="성경구절">
          <div className="flex flex-col gap-[16px]">
            {/* 미리보기 */}
            <div className="bg-[#fafaf8] rounded-[8px] border border-[#f0f0f0] p-[16px] md:p-[24px]">
              <div className={verse.align === "center" ? "text-center" : verse.align === "left" ? "text-left" : "text-right"}>
                <div
                  className="font-['Instrument_Sans:Regular',sans-serif] font-normal leading-[1.15] text-[18px] md:text-[24px] text-black tracking-[-1px]"
                  style={fv}
                >
                  {verse.verseEn.split("\n").map((line, i) => (
                    <p key={i} className="mb-0">{line}</p>
                  ))}
                  <p className="mt-[10px] text-[14px] md:text-[18px] tracking-[-0.6px]">
                    {verse.referenceEn}
                  </p>
                </div>
                <p
                  className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[11px] md:text-[13px] text-[#767676] tracking-[-0.3px] leading-[1.6] mt-[12px]"
                  style={fv}
                >
                  {verse.verseKo}&nbsp;&nbsp;{verse.referenceKo}
                </p>
              </div>
            </div>

            {/* 정렬 */}
            <div>
              <Label>텍스트 정렬</Label>
              <div className="flex gap-[6px]">
                {alignOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      const updated = { ...verse, align: opt.value };
                      setVerse(updated);
                      saveVerse(updated);
                    }}
                    className={`flex items-center gap-[6px] px-[14px] py-[9px] rounded-[8px] border text-[13px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] cursor-pointer transition-all duration-200 ${
                      verse.align === opt.value
                        ? "border-[#4a6741] bg-[#f0f5ef] text-[#4a6741]"
                        : "border-[#ddd] bg-white text-[#999] hover:border-[#bbb]"
                    }`}
                  >
                    {opt.icon}
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>영문 구절 (줄바꿈으로 행 구분)</Label>
              <textarea
                value={verse.verseEn}
                onChange={(e) => {
                  const updated = { ...verse, verseEn: e.target.value };
                  setVerse(updated);
                  saveVerse(updated);
                }}
                rows={4}
                className={textareaCls}
              />
            </div>
            <div>
              <Label>영문 출처</Label>
              <input
                value={verse.referenceEn}
                onChange={(e) => {
                  const updated = { ...verse, referenceEn: e.target.value };
                  setVerse(updated);
                  saveVerse(updated);
                }}
                className={inputCls}
              />
            </div>
            <div>
              <Label>한글 구절</Label>
              <textarea
                value={verse.verseKo}
                onChange={(e) => {
                  const updated = { ...verse, verseKo: e.target.value };
                  setVerse(updated);
                  saveVerse(updated);
                }}
                rows={2}
                className={textareaCls}
              />
            </div>
            <div>
              <Label>한글 출처</Label>
              <input
                value={verse.referenceKo}
                onChange={(e) => {
                  const updated = { ...verse, referenceKo: e.target.value };
                  setVerse(updated);
                  saveVerse(updated);
                }}
                className={inputCls}
              />
            </div>
            <div>
              <button
                onClick={handleResetVerse}
                className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#999] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-[#ddd] hover:border-[#999] transition-colors cursor-pointer bg-white"
              >
                <RotateCcw size={12} />
                기본값
              </button>
            </div>
          </div>
        </Section>

        {/* ═══ 4. 행사 관리 ═══ */}
        <Section title="행사 관리">
          <div className="flex flex-col gap-[12px]">
            {events.map((ev, idx) => (
              <div key={ev.id} className="p-[12px] bg-[#fafaf8] rounded-[8px] border border-[#f0f0f0]">
                {editingId === ev.id ? (
                  /* 편집 모드 */
                  <div className="flex flex-col gap-[8px]">
                    <input value={ev.title} onChange={(e) => updateEvent(ev.id, { title: e.target.value })} placeholder="제목" className={inputCls} />
                    <div className="flex gap-[8px]">
                      <input type="date" value={ev.date} onChange={(e) => updateEvent(ev.id, { date: e.target.value })} className={inputCls + " flex-1"} />
                      <input value={ev.time} onChange={(e) => updateEvent(ev.id, { time: e.target.value })} placeholder="시간" className={inputCls + " w-[100px]"} />
                    </div>
                    <input value={ev.location} onChange={(e) => updateEvent(ev.id, { location: e.target.value })} placeholder="장소" className={inputCls} />
                    <input value={ev.description} onChange={(e) => updateEvent(ev.id, { description: e.target.value })} placeholder="설명" className={inputCls} />
                    <input value={ev.registerUrl} onChange={(e) => updateEvent(ev.id, { registerUrl: e.target.value })} placeholder="참석 신청 URL" className={inputCls} />
                    <div className="flex gap-[8px]">
                      <select
                        value={ev.category}
                        onChange={(e) => updateEvent(ev.id, { category: e.target.value })}
                        className={inputCls + " w-[120px]"}
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="flex-1" />
                      <button
                        onClick={() => setEditingId(null)}
                        className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-[#4a6741] tracking-[-0.3px] px-[14px] py-[8px] rounded-[8px] border border-[#4a6741] cursor-pointer bg-white hover:bg-[#f0f5ef] transition-colors"
                      >
                        완료
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 보기 모드 */
                  <div className="flex items-center gap-[8px]">
                    <div className="flex flex-col gap-[2px] shrink-0">
                      <button onClick={() => moveEvent(idx, -1)} disabled={idx === 0} className="text-[#bbb] hover:text-[#666] disabled:opacity-30 cursor-pointer disabled:cursor-default bg-transparent border-none p-[2px]">
                        <ChevronDown size={14} className="rotate-180" />
                      </button>
                      <button onClick={() => moveEvent(idx, 1)} disabled={idx === events.length - 1} className="text-[#bbb] hover:text-[#666] disabled:opacity-30 cursor-pointer disabled:cursor-default bg-transparent border-none p-[2px]">
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditingId(ev.id)}>
                      <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] text-black tracking-[-0.3px] truncate" style={fv}>
                        {ev.title}
                      </p>
                      <p className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px] mt-[2px]" style={fv}>
                        {ev.date} {ev.time} · {ev.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-[6px] shrink-0">
                      <button
                        onClick={() => updateEvent(ev.id, { visible: !ev.visible })}
                        className={`p-[7px] rounded-[6px] border cursor-pointer transition-all duration-200 ${
                          ev.visible ? "border-[#4a6741] text-[#4a6741] bg-[#f0f5ef]" : "border-[#ddd] text-[#ccc] bg-white"
                        }`}
                      >
                        {ev.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      {deleteConfirmId === ev.id ? (
                        <div className="flex gap-[4px]">
                          <button onClick={() => removeEvent(ev.id)} className="p-[7px] rounded-[6px] border border-red-300 text-red-500 cursor-pointer bg-white hover:bg-red-50 transition-colors text-[11px] font-['Noto_Sans_KR:Regular',sans-serif]">삭제</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="p-[7px] rounded-[6px] border border-[#ddd] text-[#999] cursor-pointer bg-white text-[11px] font-['Noto_Sans_KR:Regular',sans-serif]">취소</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(ev.id)}
                          className="p-[7px] rounded-[6px] border border-[#ddd] text-[#ccc] hover:text-red-400 hover:border-red-300 cursor-pointer transition-all duration-200 bg-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 추가 폼 */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-[12px] bg-[#f0f5ef] rounded-[8px] border border-[#4a6741]/20 flex flex-col gap-[8px]">
                    <input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="제목 *" className={inputCls} />
                    <div className="flex gap-[8px]">
                      <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className={inputCls + " flex-1"} />
                      <input value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} placeholder="시간" className={inputCls + " w-[100px]"} />
                    </div>
                    <input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="장소" className={inputCls} />
                    <input value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="설명" className={inputCls} />
                    <input value={newEvent.registerUrl} onChange={(e) => setNewEvent({ ...newEvent, registerUrl: e.target.value })} placeholder="참석 신청 URL" className={inputCls} />
                    <select value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })} className={inputCls + " w-[120px]"}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="flex gap-[8px] mt-[4px]">
                      <button onClick={() => setShowAddForm(false)} className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#767676] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-[#ddd] hover:border-[#999] cursor-pointer bg-white transition-colors">취소</button>
                      <button onClick={handleAddEvent} className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] bg-[#4a6741] hover:bg-[#3d5636] cursor-pointer border-none transition-colors">추가</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#4a6741] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-dashed border-[#4a6741]/30 hover:border-[#4a6741] transition-colors cursor-pointer bg-transparent"
              >
                <Plus size={14} />
                행사 추가
              </button>
            )}
          </div>
        </Section>

        {/* ═══ 5. 후원계좌 관리 ═══ */}
        <Section title="후원계좌 관리">
          <div className="flex flex-col gap-[14px]">
            <p
              className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px] leading-[1.6]"
              style={fv}
            >
              푸터에 표시될 후원계좌 정보를 입력합니다. 예: 농협 351-1307-9421-53 동북지회
            </p>
            <div>
              <Label>후원계좌</Label>
              <input
                value={donationAccount.text}
                onChange={(e) => {
                  setDonationAccount({ ...donationAccount, text: e.target.value });
                  setAccountError("");
                  setAccountSuccess("");
                }}
                placeholder="농협 351-1307-9421-53 동북지회"
                className={inputCls}
              />
            </div>
            {accountError && (
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-red-500 tracking-[-0.3px]"
                style={fv}
              >
                {accountError}
              </p>
            )}
            {accountSuccess && (
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#4a6741] tracking-[-0.3px]"
                style={fv}
              >
                {accountSuccess}
              </p>
            )}
            <div>
              <button
                onClick={() => {
                  setAccountError("");
                  setAccountSuccess("");
                  if (!donationAccount.text.trim()) {
                    setAccountError("후원계좌를 입력해주세요");
                    return;
                  }
                  saveDonationAccount(donationAccount);
                  setAccountSuccess("후원계좌가 변경되었습니다");
                  toast("후원계좌가 변경되었습니다");
                }}
                className="flex items-center gap-[6px] font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[16px] py-[10px] rounded-[8px] bg-[#4a6741] hover:bg-[#3d5636] transition-colors cursor-pointer border-none"
              >
                <Lock size={14} />
                후원계좌 변경
              </button>
            </div>
          </div>
        </Section>

        {/* ═══ 6. 브랜드 이미지 관리 ═══ */}
        <Section title="브랜드 이미지 관리">
          <div className="flex flex-col gap-[16px]">
            <p
              className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px] leading-[1.6]"
              style={fv}
            >
              사이트 전체에서 사용되는 로고, 엠블럼, QR코드를 관리합니다. 이미지를 업로드하면 즉시 반영됩니다.
            </p>

            {/* 로고 (가로형 마크) */}
            <div>
              <Label>로고 (헤더 좌측 마크)</Label>
              <div className="flex items-center gap-[12px]">
                <div className="w-[80px] h-[80px] rounded-[8px] border border-[#eee] overflow-hidden bg-[#fafaf8] shrink-0 flex items-center justify-center">
                  {brandImages.logo ? (
                    <img src={brandImages.logo} alt="로고" className="w-full h-full object-contain" />
                  ) : (
                    <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#ccc] tracking-[-0.3px]" style={fv}>없음</p>
                  )}
                </div>
                <div className="flex flex-col gap-[6px]">
                  <label className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#4a6741] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-dashed border-[#4a6741]/30 hover:border-[#4a6741] transition-colors cursor-pointer bg-transparent">
                    <Plus size={14} />
                    이미지 선택
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleBrandImageUpload("logo", f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {brandImages.logo && (
                    <button
                      onClick={() => handleBrandImageRemove("logo")}
                      className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#ccc] hover:text-red-400 tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-[#eee] hover:border-red-300 transition-colors cursor-pointer bg-white"
                    >
                      <Trash2 size={13} />
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 엠블럼 (원형) */}
            <div>
              <Label>엠블럼 (원형 로고 - 푸터, 서브페이지 헤더)</Label>
              <div className="flex items-center gap-[12px]">
                <div className="w-[80px] h-[80px] rounded-full border border-[#eee] overflow-hidden bg-[#fafaf8] shrink-0 flex items-center justify-center">
                  {brandImages.emblem ? (
                    <img src={brandImages.emblem} alt="엠블럼" className="w-full h-full object-cover" />
                  ) : (
                    <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#ccc] tracking-[-0.3px]" style={fv}>없음</p>
                  )}
                </div>
                <div className="flex flex-col gap-[6px]">
                  <label className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#4a6741] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-dashed border-[#4a6741]/30 hover:border-[#4a6741] transition-colors cursor-pointer bg-transparent">
                    <Plus size={14} />
                    이미지 선택
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleBrandImageUpload("emblem", f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {brandImages.emblem && (
                    <button
                      onClick={() => handleBrandImageRemove("emblem")}
                      className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#ccc] hover:text-red-400 tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-[#eee] hover:border-red-300 transition-colors cursor-pointer bg-white"
                    >
                      <Trash2 size={13} />
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* QR 코드 */}
            <div>
              <Label>QR 코드</Label>
              <div className="flex items-center gap-[12px]">
                <div className="w-[80px] h-[80px] rounded-[8px] border border-[#eee] overflow-hidden bg-[#fafaf8] shrink-0 flex items-center justify-center">
                  {brandImages.qrCode ? (
                    <img src={brandImages.qrCode} alt="QR코드" className="w-full h-full object-contain" />
                  ) : (
                    <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#ccc] tracking-[-0.3px]" style={fv}>없음</p>
                  )}
                </div>
                <div className="flex flex-col gap-[6px]">
                  <label className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#4a6741] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-dashed border-[#4a6741]/30 hover:border-[#4a6741] transition-colors cursor-pointer bg-transparent">
                    <Plus size={14} />
                    이미지 선택
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleBrandImageUpload("qrCode", f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {brandImages.qrCode && (
                    <button
                      onClick={() => handleBrandImageRemove("qrCode")}
                      className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#ccc] hover:text-red-400 tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-[#eee] hover:border-red-300 transition-colors cursor-pointer bg-white"
                    >
                      <Trash2 size={13} />
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══ 7. 홍보창 관리 ═══ */}
        <Section title="홍보창 관리">
          <div className="flex flex-col gap-[16px]">
            <p
              className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px] leading-[1.6]"
              style={fv}
            >
              메인 페이지에 표시될 홍보창을 관리합니다. 이미지를 업로드하면 즉시 반영됩니다.
            </p>

            {/* 홍보창 목록 */}
            {popups.map((popup) => (
              <div key={popup.id} className="p-[12px] bg-[#fafaf8] rounded-[8px] border border-[#f0f0f0]">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[80px] h-[80px] rounded-[8px] border border-[#eee] overflow-hidden bg-[#fafaf8] shrink-0 flex items-center justify-center">
                    {popup.image ? (
                      <img src={popup.image} alt="홍보 이미지" className="w-full h-full object-contain" />
                    ) : (
                      <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#ccc] tracking-[-0.3px]" style={fv}>없음</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <label className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#4a6741] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-dashed border-[#4a6741]/30 hover:border-[#4a6741] transition-colors cursor-pointer bg-transparent">
                      <Plus size={14} />
                      이미지 선택
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePopupImageUpload(popup.id, f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {popup.image && (
                      <button
                        onClick={() => removePopup(popup.id)}
                        className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#ccc] hover:text-red-400 tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-[#eee] hover:border-red-300 transition-colors cursor-pointer bg-white"
                      >
                        <Trash2 size={13} />
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-[8px] mt-[12px]">
                  <input
                    value={popup.title}
                    onChange={(e) => updatePopup(popup.id, { title: e.target.value })}
                    placeholder="제목"
                    className={inputCls}
                  />
                  <textarea
                    value={popup.description}
                    onChange={(e) => updatePopup(popup.id, { description: e.target.value })}
                    rows={2}
                    className={textareaCls}
                    placeholder="설명"
                  />
                  <input
                    value={popup.linkUrl}
                    onChange={(e) => updatePopup(popup.id, { linkUrl: e.target.value })}
                    placeholder="링크 URL"
                    className={inputCls}
                  />
                  <input
                    value={popup.linkLabel}
                    onChange={(e) => updatePopup(popup.id, { linkLabel: e.target.value })}
                    placeholder="링크 라벨"
                    className={inputCls}
                  />
                  <div className="flex items-center gap-[6px]">
                    <button
                      onClick={() => updatePopup(popup.id, { visible: !popup.visible })}
                      className={`p-[7px] rounded-[6px] border cursor-pointer transition-all duration-200 ${
                        popup.visible ? "border-[#4a6741] text-[#4a6741] bg-[#f0f5ef]" : "border-[#ddd] text-[#ccc] bg-white"
                      }`}
                    >
                      {popup.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* 추가 버튼 */}
            <div className="flex gap-[8px] mt-[4px]">
              <button
                onClick={addPopup}
                className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#4a6741] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-dashed border-[#4a6741]/30 hover:border-[#4a6741] transition-colors cursor-pointer bg-transparent"
              >
                <Plus size={14} />
                홍보창 추가
              </button>
            </div>
          </div>
        </Section>

        {/* ═══ 8. 비밀번호 변경 ═══ */}
        <Section title="비밀번호 변경">
          <div className="flex flex-col gap-[14px]">
            <div>
              <Label>현재 비밀번호</Label>
              <input
                type="password"
                inputMode="numeric"
                value={currentPw}
                onChange={(e) => { setCurrentPw(e.target.value); setPwError(""); setPwSuccess(""); }}
                placeholder="현재 비밀번호"
                className={inputCls}
              />
            </div>
            <div>
              <Label>새 비밀번호 (4자리 이상)</Label>
              <input
                type="password"
                inputMode="numeric"
                value={newPw}
                onChange={(e) => { setNewPw(e.target.value); setPwError(""); setPwSuccess(""); }}
                placeholder="새 비밀번호"
                className={inputCls}
              />
            </div>
            <div>
              <Label>새 비밀번호 확인</Label>
              <input
                type="password"
                inputMode="numeric"
                value={confirmPw}
                onChange={(e) => { setConfirmPw(e.target.value); setPwError(""); setPwSuccess(""); }}
                placeholder="새 비밀번호 확인"
                className={inputCls}
              />
            </div>
            {pwError && (
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-red-500 tracking-[-0.3px]"
                style={fv}
              >
                {pwError}
              </p>
            )}
            {pwSuccess && (
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#4a6741] tracking-[-0.3px]"
                style={fv}
              >
                {pwSuccess}
              </p>
            )}
            <div>
              <button
                onClick={handlePasswordChange}
                className="flex items-center gap-[6px] font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[16px] py-[10px] rounded-[8px] bg-[#4a6741] hover:bg-[#3d5636] transition-colors cursor-pointer border-none"
              >
                <Lock size={14} />
                비밀번호 변경
              </button>
            </div>
          </div>
        </Section>

        {/* 제작자 표시 */}
        <p
          className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[11px] text-[#bbb] tracking-[-0.3px] text-center mt-[20px]"
          style={fv}
        >
          2026년 제주성산교회 고지훈 청년 제작
        </p>
      </div>
    </div>
  );
}