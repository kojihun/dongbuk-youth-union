import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  X,
  Upload,
  ImageIcon,
  Receipt,
  Check,
  Star,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  getActivities,
  saveActivities,
  generateActivityId,
  type ActivityItem,
} from "./activityStore";
import { supabase } from "../../utils/supabaseClient";

/* ─── 빈 폼 ─── */
const emptyForm = (): Omit<ActivityItem, "id" | "createdAt"> => ({
  title: "",
  groupName: "",
  author: "",
  activityDate: "",
  activityPlace: "",
  participants: "",
  content: "",
  report: "",
  photos: [],
  receipts: [],
  receiptNames: [],
  visible: true,
  isMain: true,
});

/* ─── 파일을 Data URI로 변환 ─── */
function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ─── 게시글 편집 모달 ─── */
function ActivityFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<ActivityItem> | null;
  onSave: (item: ActivityItem) => void;
  onClose: () => void;
}) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<Omit<ActivityItem, "id" | "createdAt">>(
    initial
      ? {
          title: initial.title || "",
          groupName: initial.groupName || "",
          author: initial.author || "",
          activityDate: initial.activityDate || "",
          activityPlace: initial.activityPlace || "",
          participants: initial.participants || "",
          content: initial.content || "",
          report: initial.report || "",
          photos: initial.photos || [],
          receipts: initial.receipts || [],
          receiptNames: initial.receiptNames || [],
          visible: initial.visible !== false,
          isMain: initial.isMain !== false,
        }
      : emptyForm()
  );
  const [uploading, setUploading] = useState(false);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  /* 활동사진 업로드 (다중) */
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uris = await Promise.all(Array.from(files).map(fileToDataUri));
      setForm((f) => ({ ...f, photos: [...f.photos, ...uris] }));
    } finally {
      setUploading(false);
    }
  };

  /* 영수증 업로드 (이미지 또는 파일) */
  const handleReceiptUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setReceiptUploading(true);
    try {
      const items = await Promise.all(
        Array.from(files).map(async (f) => ({
          uri: await fileToDataUri(f),
          name: f.name,
        }))
      );
      setForm((prev) => ({
        ...prev,
        receipts: [...prev.receipts, ...items.map((i) => i.uri)],
        receiptNames: [...prev.receiptNames, ...items.map((i) => i.name)],
      }));
    } finally {
      setReceiptUploading(false);
    }
  };

  const removePhoto = (idx: number) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));
  };

  const removeReceipt = (idx: number) => {
    setForm((f) => ({
      ...f,
      receipts: f.receipts.filter((_, i) => i !== idx),
      receiptNames: f.receiptNames.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    const item: ActivityItem = {
      ...form,
      id: initial?.id || generateActivityId(),
      createdAt: initial?.createdAt || new Date().toISOString(),
    };
    onSave(item);
  };

  const inputCls =
    "w-full border border-[#ddd] rounded-[8px] px-[14px] py-[10px] text-[14px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors placeholder:text-[#bbb]";
  const labelCls =
    "font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-[#555] tracking-[-0.3px] mb-[6px] block";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white w-full md:max-w-[700px] md:rounded-[16px] rounded-t-[20px] shadow-2xl flex flex-col max-h-[92vh] md:max-h-[88vh]"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-[20px] md:px-[28px] pt-[16px] md:pt-[24px] pb-[16px] md:pb-[20px] border-b border-[#eee] shrink-0">
          <div className="w-[36px] h-[4px] bg-[#ddd] rounded-full mx-auto md:hidden absolute left-1/2 -translate-x-1/2 top-[10px]" />
          <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[16px] md:text-[18px] text-black tracking-[-0.4px]"
            style={{ fontVariationSettings: "'wdth' 100" }}>
            {isEdit ? "게시글 수정" : "게시글 작성"}
          </p>
          <button
            onClick={onClose}
            className="p-[6px] hover:bg-[#f5f5f5] rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={20} className="text-[#767676]" />
          </button>
        </div>

        {/* 폼 본문 (스크롤) */}
        <div className="flex-1 overflow-y-auto px-[20px] md:px-[28px] py-[20px] md:py-[24px] flex flex-col gap-[20px]">
          {/* 가시성 */}
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, visible: !f.visible }))}
              className={`relative w-[44px] h-[24px] rounded-full transition-colors cursor-pointer border-none shrink-0 ${
                form.visible ? "bg-[#4a6741]" : "bg-[#ddd]"
              }`}
            >
              <span
                className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all ${
                  form.visible ? "left-[23px]" : "left-[3px]"
                }`}
              />
            </button>
            <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#555] tracking-[-0.3px]"
              style={{ fontVariationSettings: "'wdth' 100" }}>
              {form.visible ? "공개" : "비공개"}
            </span>
          </div>

          {/* 제목 */}
          <div>
            <label className={labelCls}>제목 *</label>
            <input
              className={inputCls}
              placeholder="활동 제목을 입력하세요"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* 소모임명 / 작성자 */}
          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className={labelCls}>소모임명</label>
              <input
                className={inputCls}
                placeholder="소모임 이름"
                value={form.groupName}
                onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>작성자</label>
              <input
                className={inputCls}
                placeholder="작성자 이름"
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              />
            </div>
          </div>

          {/* 활동일시 / 활동장소 */}
          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className={labelCls}>활동일시</label>
              <input
                className={inputCls}
                placeholder="예: 2025. 03. 15"
                value={form.activityDate}
                onChange={(e) => setForm((f) => ({ ...f, activityDate: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>활동장소</label>
              <input
                className={inputCls}
                placeholder="장소명"
                value={form.activityPlace}
                onChange={(e) => setForm((f) => ({ ...f, activityPlace: e.target.value }))}
              />
            </div>
          </div>

          {/* 참여인원 */}
          <div>
            <label className={labelCls}>참여인원</label>
            <input
              className={inputCls}
              placeholder="예: 15"
              type="number"
              value={form.participants}
              onChange={(e) => setForm((f) => ({ ...f, participants: e.target.value }))}
            />
          </div>

          {/* 활동내용 */}
          <div>
            <label className={labelCls}>활동내용</label>
            <textarea
              className={`${inputCls} min-h-[120px] resize-y`}
              placeholder="활동 내용을 상세히 입력하세요"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </div>

          {/* 결과보고 */}
          <div>
            <label className={labelCls}>결과보고</label>
            <textarea
              className={`${inputCls} min-h-[100px] resize-y`}
              placeholder="활동 결과 및 소감을 입력하세요"
              value={form.report}
              onChange={(e) => setForm((f) => ({ ...f, report: e.target.value }))}
            />
          </div>

          {/* ─── 활동사진 업로드 영역 ─── */}
          <div className="border border-[#ddd] rounded-[12px] p-[16px] md:p-[20px]">
            <div className="flex items-center gap-[8px] mb-[14px]">
              <ImageIcon size={16} className="text-[#4a6741]" />
              <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] text-black tracking-[-0.3px]"
                style={{ fontVariationSettings: "'wdth' 100" }}>
                활동사진
              </p>
              <span className="text-[12px] text-[#999] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.2px]">
                (여러 장 업로드 가능)
              </span>
            </div>

            {/* 사진 그리드 */}
            {form.photos.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-[8px] mb-[12px]">
                {form.photos.map((src, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-[6px] overflow-hidden group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute top-[4px] left-[4px] bg-[#4a6741] text-white text-[10px] px-[6px] py-[2px] rounded-full font-['Noto_Sans_KR:Medium',sans-serif]">
                        대표
                      </div>
                    )}
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-[4px] right-[4px] w-[22px] h-[22px] bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center cursor-pointer border-none opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={12} color="white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoUpload(e.target.files)}
            />
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={uploading}
              className="w-full py-[10px] border-[1.5px] border-dashed border-[#4a6741]/40 rounded-[8px] flex items-center justify-center gap-[8px] text-[13px] text-[#4a6741] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] hover:bg-[#f0f5ef] transition-colors cursor-pointer disabled:opacity-50"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              <Upload size={15} />
              {uploading ? "업로드 중..." : "사진 추가하기"}
            </button>
          </div>

          {/* ─── 영수증 업로드 영역 ─── */}
          <div className="border border-[#ddd] rounded-[12px] p-[16px] md:p-[20px]">
            <div className="flex items-center gap-[8px] mb-[14px]">
              <Receipt size={16} className="text-[#767676]" />
              <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] text-black tracking-[-0.3px]"
                style={{ fontVariationSettings: "'wdth' 100" }}>
                영수증
              </p>
              <span className="text-[12px] text-[#999] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.2px]">
                (이미지 또는 파일)
              </span>
            </div>

            {/* 영수증 목록 */}
            {form.receipts.length > 0 && (
              <div className="flex flex-col gap-[8px] mb-[12px]">
                {form.receipts.map((src, i) => {
                  const isImage = src.startsWith("data:image");
                  const name = form.receiptNames?.[i] || `영수증 ${i + 1}`;
                  return (
                    <div key={i} className="flex items-center gap-[10px] p-[10px] bg-[#f9f9f9] rounded-[8px]">
                      <div className="w-[36px] h-[36px] shrink-0 rounded-[4px] overflow-hidden bg-[#eee] flex items-center justify-center">
                        {isImage ? (
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Receipt size={16} className="text-[#bbb]" />
                        )}
                      </div>
                      <span className="flex-1 font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#555] tracking-[-0.2px] truncate"
                        style={{ fontVariationSettings: "'wdth' 100" }}>
                        {name}
                      </span>
                      <button
                        onClick={() => removeReceipt(i)}
                        className="p-[4px] hover:bg-red-50 rounded-full cursor-pointer border-none bg-transparent text-[#bbb] hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <input
              ref={receiptInputRef}
              type="file"
              accept="image/*,.pdf,.xlsx,.xls,.docx,.doc,.txt,.hwp"
              multiple
              className="hidden"
              onChange={(e) => handleReceiptUpload(e.target.files)}
            />
            <button
              onClick={() => receiptInputRef.current?.click()}
              disabled={receiptUploading}
              className="w-full py-[10px] border-[1.5px] border-dashed border-[#ddd] rounded-[8px] flex items-center justify-center gap-[8px] text-[13px] text-[#767676] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] hover:bg-[#f9f9f9] transition-colors cursor-pointer disabled:opacity-50"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              <Upload size={15} />
              {receiptUploading ? "업로드 중..." : "영수증 추가하기"}
            </button>
          </div>
        </div>

        {/* 모달 하단 버튼 */}
        <div className="shrink-0 px-[20px] md:px-[28px] py-[16px] md:py-[20px] border-t border-[#eee] flex gap-[10px]">
          <button
            onClick={onClose}
            className="flex-1 py-[12px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#767676] tracking-[-0.3px] border border-[#ddd] rounded-[10px] hover:border-[#bbb] active:border-[#bbb] cursor-pointer bg-white transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-[12px] font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] text-white tracking-[-0.3px] bg-[#4a6741] hover:bg-[#3d5636] active:bg-[#3d5636] rounded-[10px] cursor-pointer border-none transition-colors"
          >
            {isEdit ? "수정 저장" : "게시글 등록"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── 관리자 전용 파일 미리보기 컴포넌트 ─── */
function AdminFileViewer({ path, type }: { path: string, type: 'photo' | 'receipt' }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.storage.from('submission_files').createSignedUrl(path, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl);
    });
  }, [path]);

  if (!url) return <div className="text-[11px] text-[#aaa] w-[80px] h-[60px] md:w-[120px] md:h-[90px] flex shrink-0 items-center justify-center bg-[#f5f5f5] rounded-[6px] border border-[#ddd]">로딩 중...</div>;

  const isImage = path.match(/\.(jpeg|jpg|gif|png|webp|heic)$/i) != null;
  const fileName = path.split('/').pop() || path;

  if (type === 'photo' || isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="shrink-0 block w-[80px] h-[60px] md:w-[120px] md:h-[90px] rounded-[6px] border border-[#ddd] overflow-hidden group relative">
        <img src={url} alt="첨부 파일" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <span className="text-white text-[12px] font-['Noto_Sans_KR:Medium',sans-serif]">크게 보기</span>
        </div>
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-[6px] px-[10px] py-[6px] bg-[#f9f9f9] hover:bg-[#f0f0f0] rounded-[6px] border border-[#ddd] text-[13px] text-[#555] no-underline transition-colors shrink-0 max-w-[200px]">
      <Receipt size={14} className="text-[#888] shrink-0" />
      <span className="truncate">{fileName}</span>
      <span className="text-[11px] text-[#767676] bg-white px-[6px] py-[2px] rounded-[4px] border border-[#ddd] shrink-0">보기/다운</span>
    </a>
  );
}

/* ─── 메인 관리자 페이지 ─── */
export default function ActivityAdminPage() {
  const [activities, setActivities] = useState<ActivityItem[]>(getActivities());
  const [saved, setSaved] = useState(false);
  const [formModal, setFormModal] = useState<{ open: boolean; item: Partial<ActivityItem> | null }>({ open: false, item: null });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // -- Supabase Auth -- //
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // -- 탭 및 인박스 -- //
  const [activeTab, setActiveTab] = useState<"published" | "inbox">("published");
  const [inboxItems, setInboxItems] = useState<any[]>([]);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [isDeletingOrigin, setIsDeletingOrigin] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchInbox = async () => {
    setIsLoadingInbox(true);
    const { data, error } = await supabase.from("activity_submissions").select("*").order("created_at", { ascending: false });
    setIsLoadingInbox(false);
    if (!error && data) setInboxItems(data);
  };

  useEffect(() => {
    if (session && activeTab === "inbox") fetchInbox();
  }, [session, activeTab]);

  const handlePublish = async (submission: any) => {
    if (!window.confirm("이 항목을 홈페이지에 공개하시겠습니까?")) return;
    setIsPublishing(submission.id);
    try {
      // 1. submission_files (Private) 에서 published_files (Public) 로 사진 복사 (영수증 제외)
      const newPhotoPaths: string[] = [];
      const photos = submission.photo_paths || [];
      for (const path of photos) {
        const fileName = path.split("/").pop();
        const newPath = `public_photos/${Date.now()}_${fileName}`;
        // Storage에서 다운로드 후 바로 재업로드!
        const { data: blobData, error: downloadError } = await supabase.storage.from("submission_files").download(path);
        if (downloadError) throw downloadError;
        if (blobData) {
          const { data, error: uploadError } = await supabase.storage.from("published_files").upload(newPath, blobData);
          if (uploadError) throw uploadError;
          // 공개 URL 가져오기
          const { data: urlData } = supabase.storage.from("published_files").getPublicUrl(newPath);
          newPhotoPaths.push(urlData.publicUrl);
        }
      }

      // 2. activityStore (홈페이지 JSON) 구조에 맞게 매핑
      const newItem: ActivityItem = {
        id: generateActivityId(),
        title: submission.title,
        groupName: submission.groupName || "",
        author: submission.author || "",
        activityDate: submission.activityDate || "",
        activityPlace: submission.activityPlace || "",
        participants: submission.participants || "",
        content: submission.content || "",
        report: submission.report || "",
        photos: newPhotoPaths, // 새로 발급된 Public 버킷 URL들이 들어감
        receipts: [], // 영수증 누락으로 공백
        receiptNames: [],
        createdAt: new Date(submission.created_at).toISOString(),
        visible: true,
      };

      // 3. 기존 JSON에 누적 저장
      const existing = getActivities();
      const next = [newItem, ...existing];
      saveActivities(next);
      setActivities(next); // admin 화면 갱신
      
      alert("홈페이지에 성공적으로 공개되었습니다!\n관리자 수동 파기 전까지 원본은 접수함에 보존됩니다.");
      setActiveTab("published");
    } catch (err: any) {
      console.error(err);
      alert("공개 중 오류 발생: " + err.message);
    } finally {
      setIsPublishing(null);
    }
  };

  const handleDeleteSubmission = async (submission: any) => {
    if (!window.confirm("주의! 원본 데이터를 파기하시겠습니까?\n이 작업은 복구가 불가능하며 파일도 함께 삭제됩니다.")) return;
    setIsDeletingOrigin(submission.id);
    try {
      const photos = submission.photo_paths || [];
      const receipts = submission.receipt_paths || [];
      const allFiles = [...photos, ...receipts];
      
      if (allFiles.length > 0) {
        await supabase.storage.from("submission_files").remove(allFiles);
      }
      
      await supabase.from("activity_submissions").delete().eq("id", submission.id);
      alert("원본 문서가 파기되었습니다.");
      fetchInbox();
    } catch (err: any) {
      alert("파기 중 오류 발생: " + err.message);
    } finally {
      setIsDeletingOrigin(null);
    }
  };

  const persist = (next: ActivityItem[]) => {
    setActivities(next);
    saveActivities(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const openEdit = (item: ActivityItem) => setFormModal({ open: true, item });
  const closeModal = () => setFormModal({ open: false, item: null });

  const handleSave = (item: ActivityItem) => {
    const exists = activities.some((a) => a.id === item.id);
    const next = exists
      ? activities.map((a) => (a.id === item.id ? item : a))
      : [item, ...activities];
    persist(next);
    closeModal();
  };

  const handleDelete = (id: string) => {
    persist(activities.filter((a) => a.id !== id));
    setDeleteTarget(null);
  };

  const toggleVisible = (id: string) => {
    persist(activities.map((a) => (a.id === id ? { ...a, visible: !a.visible } : a)));
  };

  const toggleMain = (id: string) => {
    persist(activities.map((a) => (a.id === id ? { ...a, isMain: a.isMain === false } : a)));
  };

  if (isLoadingAuth) return <div className="min-h-screen bg-white" />;

  if (!session) {
    return (
      <div className="bg-white flex flex-col items-center justify-center min-h-screen relative w-full px-[20px]">
        <div className="w-full max-w-[360px] p-[30px] rounded-[16px] shadow-lg border border-[#eee]">
          <h2 className="text-[20px] font-['Noto_Sans_KR:Medium',sans-serif] text-center tracking-[-0.5px] mb-[24px]">관리자 로그인 (Supabase)</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-[12px]">
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="아이디(이메일)" className="w-full border border-[#ddd] p-[12px] rounded-[8px] outline-none focus:border-[#4a6741]" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호" className="w-full border border-[#ddd] p-[12px] rounded-[8px] outline-none focus:border-[#4a6741]" />
            {loginError && <p className="text-red-500 text-[12px] mt-[-4px]">{loginError}</p>}
            <button type="submit" className="w-full bg-[#4a6741] text-white py-[12px] rounded-[8px] mt-[8px]">로그인</button>
          </form>
          <Link to="/activity" className="block text-center mt-[20px] text-[#999] text-[13px] hover:text-[#555]">홈페이지로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col items-center relative w-full min-h-screen">
      {/* ─── 헤더 ─── */}
      <div className="w-full max-w-[900px] px-[15px] md:px-[24px] pt-[24px] md:pt-[32px]">
        <div className="flex items-center justify-between pb-[20px] md:pb-[28px] border-b border-black">
          <div className="flex items-center gap-[12px]">
            <Link
              to="/activity"
              className="flex items-center gap-[6px] text-[#767676] hover:text-black transition-colors no-underline"
            >
              <ArrowLeft size={18} />
              <span className="font-['Instrument_Sans:Regular',sans-serif] text-[13px] md:text-[14px] tracking-[-0.4px]"
                style={{ fontVariationSettings: "'wdth' 100" }}>
                활동 게시판
              </span>
            </Link>
            <span className="text-[#ddd] text-[14px]">/</span>
              <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#999] tracking-[-0.3px]"
                style={{ fontVariationSettings: "'wdth' 100" }}>
                관리
              </span>
            </div>
            <div className="flex items-center gap-[12px]">
              {saved && (
                <motion.div
                  className="flex items-center gap-[6px] text-[#4a6741]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Check size={15} />
                  <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] tracking-[-0.3px]"
                    style={{ fontVariationSettings: "'wdth' 100" }}>
                    저장됨
                  </span>
                </motion.div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-[6px] px-[12px] py-[6px] text-[12px] font-['Noto_Sans_KR:Medium',sans-serif] text-[#767676] bg-[#f9f9f9] hover:bg-[#f0f0f0] rounded-[6px] border border-[#ddd] transition-colors cursor-pointer"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                <LogOut size={14} />
                로그아웃
              </button>
            </div>
          </div>
        
        {/* 탭 네비게이션 */}
        <div className="flex items-center gap-[20px] mt-[20px] border-b border-[#eee]">
          <button 
            onClick={() => setActiveTab("published")} 
            className={`pb-[10px] text-[15px] font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-0.3px] transition-colors bg-transparent border-none cursor-pointer ${activeTab==='published' ? 'text-[#4a6741] border-b-[2px] border-[#4a6741]' : 'text-[#aaa] hover:text-[#777]'}`}
          >
            발행된 공개본
          </button>
          <button 
            onClick={() => setActiveTab("inbox")} 
            className={`pb-[10px] text-[15px] font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-0.3px] transition-colors bg-transparent border-none cursor-pointer ${activeTab==='inbox' ? 'text-[#4a6741] border-b-[2px] border-[#4a6741]' : 'text-[#aaa] hover:text-[#777]'}`}
          >
            접수 대기함
          </button>
        </div>
      </div>

      {activeTab === "inbox" && (
        <div className="w-full max-w-[900px] px-[15px] md:px-[24px] pt-[20px] pb-[80px]">
          {isLoadingInbox ? (
            <p className="text-center py-[40px] text-[#999]">불러오는 중...</p>
          ) : inboxItems.length === 0 ? (
            <p className="text-center py-[40px] text-[#999]">새롭게 접수된 내역이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-[16px]">
              {inboxItems.map(item => (
                <div key={item.id} className="border border-[#ddd] p-[20px] rounded-[12px]">
                  <div className="flex justify-between items-start mb-[12px]">
                    <div>
                      <h3 className="font-bold text-[18px]">{item.title}</h3>
                      <p className="text-[#666] text-[13px]">{item.groupName} | {item.author} | {new Date(item.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-[8px]">
                      <button onClick={() => handleDeleteSubmission(item)} disabled={isDeletingOrigin === item.id} className="px-[12px] py-[6px] text-[12px] bg-red-50 text-red-500 rounded border border-red-200">원본 파기</button>
                      <button onClick={() => handlePublish(item)} disabled={isPublishing === item.id} className="px-[12px] py-[6px] text-[12px] bg-[#4a6741] text-white rounded">공개(Publish)</button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-[14px] text-[#333] mb-[12px]">{item.content}</p>
                  
                  {/* 사진 및 파일 미리보기 */}
                  <div className="flex flex-col gap-[16px] mt-[16px] p-[16px] bg-[#fcfcfc] rounded-[10px] border border-[#f0f0f0]">
                    {item.photo_paths?.length > 0 && (
                      <div>
                        <p className="text-[13px] font-['Noto_Sans_KR:Medium',sans-serif] text-[#555] mb-[8px] tracking-[-0.3px]">
                          📸 활동 사진 ({item.photo_paths.length}장)
                        </p>
                        <div className="flex gap-[10px] overflow-x-auto pb-[6px]">
                          {item.photo_paths.map((p: string, idx: number) => (
                            <AdminFileViewer key={idx} path={p} type="photo" />
                          ))}
                        </div>
                      </div>
                    )}
                    {item.receipt_paths?.length > 0 && (
                      <div>
                        <p className="text-[13px] font-['Noto_Sans_KR:Medium',sans-serif] text-[#555] mb-[8px] tracking-[-0.3px]">
                          🧾 영수증 <span className="text-[11px] text-[#999] ml-[4px] font-['Noto_Sans_KR:Regular',sans-serif]">(관리자만 조회 가능)</span>
                        </p>
                        <div className="flex gap-[8px] overflow-x-auto pb-[6px]">
                          {item.receipt_paths.map((p: string, idx: number) => (
                            <AdminFileViewer key={idx} path={p} type="receipt" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {(isPublishing === item.id || isDeletingOrigin === item.id) && <p className="text-blue-500 text-[12px] mt-[10px]">처리 중...</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 게시글 목록 ─── */}
      {activeTab === "published" && (
      <div className="w-full max-w-[900px] px-[15px] md:px-[24px] pt-[8px] pb-[80px]">
        {activities.length === 0 ? (
          <div className="py-[80px] flex flex-col items-center gap-[14px]">
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#bbb] tracking-[-0.3px]"
              style={{ fontVariationSettings: "'wdth' 100" }}>
              등록된 게시글이 없습니다
            </p>
            <Link
              to="/activity"
              className="flex items-center gap-[6px] text-[#4a6741] font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] tracking-[-0.3px] border border-[#4a6741]/30 rounded-full px-[18px] py-[8px] hover:bg-[#f0f5ef] no-underline transition-colors"
            >
              활동 게시판으로 이동
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#eee]">
            {activities.map((activity, i) => (
              <motion.div
                key={activity.id}
                className="flex items-start gap-[14px] py-[16px] md:py-[20px]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                {/* 대표사진 */}
                <div className="w-[64px] h-[48px] md:w-[80px] md:h-[60px] shrink-0 rounded-[6px] overflow-hidden bg-[#f5f5f3] flex items-center justify-center">
                  {activity.photos?.[0] ? (
                    <img
                      src={activity.photos[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={20} className="text-[#ddd]" />
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-[8px] mb-[4px]">
                    {activity.groupName && (
                      <span className="inline-block px-[8px] py-[1px] rounded-full bg-[#f0f5ef] text-[#4a6741] text-[11px] font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-0.2px]">
                        {activity.groupName}
                      </span>
                    )}
                    {!activity.visible && (
                      <span className="inline-block px-[8px] py-[1px] rounded-full bg-[#fff3f3] text-red-400 text-[11px] font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-0.2px]">
                        비공개
                      </span>
                    )}
                    {activity.isMain !== false && (
                      <span className="inline-block px-[8px] py-[1px] rounded-full bg-[#fffcf0] text-[#b89514] border border-[#f5e6a8] text-[11px] font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-0.2px]">
                        메인 노출됨
                      </span>
                    )}
                  </div>
                  <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.4px] leading-[1.4] break-keep truncate"
                    style={{ fontVariationSettings: "'wdth' 100" }}>
                    {activity.title}
                  </p>
                  <div className="flex flex-wrap gap-x-[12px] gap-y-[2px] mt-[4px]">
                    {activity.activityDate && (
                      <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#999] tracking-[-0.2px]">
                        {activity.activityDate}
                      </span>
                    )}
                    {activity.activityPlace && (
                      <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#999] tracking-[-0.2px]">
                        {activity.activityPlace}
                      </span>
                    )}
                    {activity.photos?.length > 0 && (
                      <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#bbb] tracking-[-0.2px]">
                        사진 {activity.photos.length}장
                      </span>
                    )}
                    {activity.receipts?.length > 0 && (
                      <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#bbb] tracking-[-0.2px]">
                        영수증 {activity.receipts.length}개
                      </span>
                    )}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-[6px] shrink-0">
                  <button
                    onClick={() => toggleMain(activity.id)}
                    title={activity.isMain !== false ? "메인 화면에서 숨기기" : "메인 화면에 노출하기"}
                    className={`p-[7px] rounded-full border transition-colors cursor-pointer ${
                      activity.isMain !== false
                        ? "border-[#f5e6a8] text-[#eab308] hover:border-[#eab308] bg-[#fffcf0]"
                        : "border-[#ddd] text-[#bbb] hover:border-[#999] bg-transparent"
                    }`}
                  >
                    <Star size={15} fill={activity.isMain !== false ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => toggleVisible(activity.id)}
                    title={activity.visible ? "비공개로 전환" : "공개로 전환"}
                    className={`p-[7px] rounded-full border transition-colors cursor-pointer ${
                      activity.visible
                        ? "border-[#ddd] text-[#767676] hover:border-[#bbb]"
                        : "border-red-200 text-red-300 hover:border-red-400"
                    } bg-transparent`}
                  >
                    {activity.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    onClick={() => openEdit(activity)}
                    title="수정"
                    className="p-[7px] rounded-full border border-[#ddd] text-[#767676] hover:border-[#bbb] bg-transparent cursor-pointer transition-colors"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(activity.id)}
                    title="삭제"
                    className="p-[7px] rounded-full border border-[#ddd] text-[#767676] hover:border-red-300 hover:text-red-400 bg-transparent cursor-pointer transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* 게시글 편집 모달 */}
      <AnimatePresence>
        {formModal.open && (
          <ActivityFormModal
            initial={formModal.item}
            onSave={handleSave}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>

      {/* 삭제 확인 모달 */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              className="bg-white rounded-[14px] p-[24px] md:p-[30px] w-[300px] md:w-[360px] shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[16px] text-black tracking-[-0.4px] mb-[8px]"
                style={{ fontVariationSettings: "'wdth' 100" }}>
                게시글을 삭제할까요?
              </p>
              <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#767676] tracking-[-0.3px] mb-[22px]"
                style={{ fontVariationSettings: "'wdth' 100" }}>
                삭제된 게시글은 복구할 수 없습니다.
              </p>
              <div className="flex gap-[8px]">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-[11px] font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#767676] border border-[#ddd] rounded-[8px] hover:border-[#bbb] cursor-pointer bg-white transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  className="flex-1 py-[11px] font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white bg-red-500 hover:bg-red-600 rounded-[8px] cursor-pointer border-none transition-colors"
                >
                  삭제
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
