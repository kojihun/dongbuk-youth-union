import { Link, useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  FileText,
  Image as ImageIcon,
  Receipt,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getActivities, saveActivities, generateActivityId, type ActivityItem } from "./activityStore";
import { verifyPassword } from "./passwordStore";
import { getBrandImages } from "./brandStore";
import { supabase } from "../../utils/supabaseClient";
import { compressImage } from "./imageUtils";

/* ─── 날짜 포맷 ─── */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return dateStr;
}

/* ─── 파일을 Data URI로 변환 ─── */
function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
});

/* ─── 게시글 작성/수정 모달 ─── */
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
        }
      : emptyForm()
  );
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const arr = Array.from(files);
      const compressedFiles = await Promise.all(arr.map(f => compressImage(f)));
      const uris = compressedFiles.map(f => URL.createObjectURL(f));
      
      setForm((f) => ({ ...f, photos: [...f.photos, ...uris] }));
      setPhotoFiles((prev) => [...prev, ...compressedFiles]);
    } finally { setUploading(false); }
  };

  const handleReceiptUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setReceiptUploading(true);
    try {
      const arr = Array.from(files);
      // 영수증은 압축 없이 올리거나, 이미지일 경우만 압축할 수 있습니다. 
      // 여기서는 파일 형식이 다양하므로 5MB 제한만 체크하고 원본을 유지합니다.
      const validFiles = arr.filter(f => f.size <= 5 * 1024 * 1024);
      if (validFiles.length < arr.length) alert("5MB를 초과하는 영수증 파일은 제외되었습니다.");
      
      const uris = await Promise.all(validFiles.map(fileToDataUri)); // 미리보기용 (PDF등은 아이콘으로 처리됨)
      
      setForm((prev) => ({
        ...prev,
        receipts: [...prev.receipts, ...uris],
        receiptNames: [...prev.receiptNames, ...validFiles.map((i) => i.name)],
      }));
      setReceiptFiles((prev) => [...prev, ...validFiles]);
    } finally { setReceiptUploading(false); }
  };

  const removePhoto = (idx: number) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));
    setPhotoFiles((f) => f.filter((_, i) => i !== idx));
  };
  const removeReceipt = (idx: number) => {
    setForm((f) => ({
      ...f,
      receipts: f.receipts.filter((_, i) => i !== idx),
      receiptNames: f.receiptNames.filter((_, i) => i !== idx),
    }));
    setReceiptFiles((f) => f.filter((_, i) => i !== idx));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) { alert("제목을 입력해주세요."); return; }
    if (!form.content.trim() && !form.report.trim() && photoFiles.length === 0) {
      alert("내용이나 사진을 최소 1개 이상 올려주세요.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. 이미지 및 영수증 먼저 스토리지(submission_files, Private)에 업로드
      const uploadPromises = [];
      const uploadedPhotoPaths: string[] = [];
      const uploadedReceiptPaths: string[] = [];

      // 활동 사진 업로드
      for (const file of photoFiles) {
        const ext = file.name.split('.').pop();
        const filePath = `photos/${Date.now()}_${Math.random().toString(36).substring(2,8)}.${ext}`;
        const p = supabase.storage.from("submission_files").upload(filePath, file).then(({ data, error }) => {
          if (error) throw error;
          if (data) uploadedPhotoPaths.push(data.path);
        });
        uploadPromises.push(p);
      }

      // 영수증 파일 업로드
      for (const file of receiptFiles) {
        const ext = file.name.split('.').pop();
        const filePath = `receipts/${Date.now()}_${Math.random().toString(36).substring(2,8)}.${ext}`;
        const p = supabase.storage.from("submission_files").upload(filePath, file).then(({ data, error }) => {
          if (error) throw error;
          if (data) uploadedReceiptPaths.push(data.path);
        });
        uploadPromises.push(p);
      }

      await Promise.all(uploadPromises);

      // 2. 테이블 (activity_submissions) 에 텍스트 데이터와 경로 저장 (INSERT)
      const submitData = {
        title: form.title,
        "groupName": form.groupName, // DB column matches
        author: form.author,
        "activityDate": form.activityDate,
        "activityPlace": form.activityPlace,
        participants: form.participants,
        content: form.content,
        report: form.report,
        photo_paths: uploadedPhotoPaths,
        receipt_paths: uploadedReceiptPaths,
        // created_at 은 DB에서 now()로 자동 생성됨
      };

      const { error: dbError } = await supabase.from("activity_submissions").insert([submitData]);
      if (dbError) throw dbError;

      alert("게시글이 성공적으로 접수되었습니다!\n관리자 검토 및 승인 후 홈페이지에 공개됩니다.");
      onClose(); // 성공 시 모달 닫기
    } catch (error: any) {
      console.error(error);
      alert(`업로드 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full border border-[#ddd] rounded-[8px] px-[14px] py-[10px] text-[14px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors placeholder:text-[#bbb]";
  const labelCls = "font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-[#555] tracking-[-0.3px] mb-[6px] block";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white w-full md:max-w-[700px] md:rounded-[16px] rounded-t-[20px] shadow-2xl flex flex-col max-h-[92vh] md:max-h-[88vh]"
        initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 80 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-[20px] md:px-[28px] pt-[16px] md:pt-[24px] pb-[16px] md:pb-[20px] border-b border-[#eee] shrink-0">
          <div className="w-[36px] h-[4px] bg-[#ddd] rounded-full mx-auto md:hidden absolute left-1/2 -translate-x-1/2 top-[10px]" />
          <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[16px] md:text-[18px] text-black tracking-[-0.4px]"
            style={{ fontVariationSettings: "'wdth' 100" }}>
            {isEdit ? "게시글 수정" : "새 게시글 작성"}
          </p>
          <button onClick={onClose} className="p-[6px] hover:bg-[#f5f5f5] rounded-full transition-colors cursor-pointer border-none bg-transparent">
            <X size={20} className="text-[#767676]" />
          </button>
        </div>

        {/* 폼 스크롤 */}
        <div className="flex-1 overflow-y-auto px-[20px] md:px-[28px] py-[20px] md:py-[24px] flex flex-col gap-[20px]">
          <div>
            <label className={labelCls}>제목 *</label>
            <input className={inputCls} placeholder="활동 제목을 입력하세요" value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className={labelCls}>소모임명</label>
              <input className={inputCls} placeholder="소모임 이름" value={form.groupName}
                onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>작성자</label>
              <input className={inputCls} placeholder="작성자 이름" value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className={labelCls}>활동일시</label>
              <input className={inputCls} placeholder="예: 2025. 03. 15" value={form.activityDate}
                onChange={(e) => setForm((f) => ({ ...f, activityDate: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>활동장소</label>
              <input className={inputCls} placeholder="장소명" value={form.activityPlace}
                onChange={(e) => setForm((f) => ({ ...f, activityPlace: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={labelCls}>참여인원</label>
            <input className={inputCls} placeholder="예: 15" type="number" value={form.participants}
              onChange={(e) => setForm((f) => ({ ...f, participants: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>활동내용</label>
            <textarea className={`${inputCls} min-h-[120px] resize-y`} placeholder="활동 내용을 상세히 입력하세요"
              value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>결과보고</label>
            <textarea className={`${inputCls} min-h-[100px] resize-y`} placeholder="활동 결과 및 소감을 입력하세요"
              value={form.report} onChange={(e) => setForm((f) => ({ ...f, report: e.target.value }))} />
          </div>

          {/* 활동사진 */}
          <div className="border border-[#ddd] rounded-[12px] p-[16px] md:p-[20px]">
            <div className="flex items-center gap-[8px] mb-[14px]">
              <ImageIcon size={16} className="text-[#4a6741]" />
              <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] text-black tracking-[-0.3px]"
                style={{ fontVariationSettings: "'wdth' 100" }}>활동사진</p>
              <span className="text-[12px] text-[#999] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.2px]">
                (여러 장 업로드 가능)
              </span>
            </div>
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
                    <button onClick={() => removePhoto(i)}
                      className="absolute top-[4px] right-[4px] w-[22px] h-[22px] bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center cursor-pointer border-none opacity-0 group-hover:opacity-100 transition-all">
                      <X size={12} color="white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => handlePhotoUpload(e.target.files)} />
            <button onClick={() => photoInputRef.current?.click()} disabled={uploading}
              className="w-full py-[10px] border-[1.5px] border-dashed border-[#4a6741]/40 rounded-[8px] flex items-center justify-center gap-[8px] text-[13px] text-[#4a6741] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] hover:bg-[#f0f5ef] transition-colors cursor-pointer disabled:opacity-50"
              style={{ fontVariationSettings: "'wdth' 100" }}>
              <Upload size={15} />
              {uploading ? "업로드 중..." : "사진 추가하기"}
            </button>
          </div>

          {/* 영수증 */}
          <div className="border border-[#ddd] rounded-[12px] p-[16px] md:p-[20px]">
            <div className="flex items-center gap-[8px] mb-[14px]">
              <Receipt size={16} className="text-[#767676]" />
              <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] text-black tracking-[-0.3px]"
                style={{ fontVariationSettings: "'wdth' 100" }}>영수증</p>
              <span className="text-[12px] text-[#999] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.2px]">
                (이미지 또는 파일)
              </span>
            </div>
            {form.receipts.length > 0 && (
              <div className="flex flex-col gap-[8px] mb-[12px]">
                {form.receipts.map((src, i) => {
                  const isImage = src.startsWith("data:image");
                  const name = form.receiptNames?.[i] || `영수증 ${i + 1}`;
                  return (
                    <div key={i} className="flex items-center gap-[10px] p-[10px] bg-[#f9f9f9] rounded-[8px]">
                      <div className="w-[36px] h-[36px] shrink-0 rounded-[4px] overflow-hidden bg-[#eee] flex items-center justify-center">
                        {isImage ? <img src={src} alt="" className="w-full h-full object-cover" /> : <Receipt size={16} className="text-[#bbb]" />}
                      </div>
                      <span className="flex-1 font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#555] tracking-[-0.2px] truncate"
                        style={{ fontVariationSettings: "'wdth' 100" }}>{name}</span>
                      <button onClick={() => removeReceipt(i)}
                        className="p-[4px] hover:bg-red-50 rounded-full cursor-pointer border-none bg-transparent text-[#bbb] hover:text-red-500 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <input ref={receiptInputRef} type="file" accept="image/*,.pdf,.xlsx,.xls,.docx,.doc,.txt,.hwp" multiple className="hidden"
              onChange={(e) => handleReceiptUpload(e.target.files)} />
            <button onClick={() => receiptInputRef.current?.click()} disabled={receiptUploading}
              className="w-full py-[10px] border-[1.5px] border-dashed border-[#ddd] rounded-[8px] flex items-center justify-center gap-[8px] text-[13px] text-[#767676] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] hover:bg-[#f9f9f9] transition-colors cursor-pointer disabled:opacity-50"
              style={{ fontVariationSettings: "'wdth' 100" }}>
              <Upload size={15} />
              {receiptUploading ? "업로드 중..." : "영수증 추가하기"}
            </button>
          </div>
        </div>

        {/* 모달 하단 버튼 */}
        <div className="shrink-0 px-[20px] md:px-[28px] py-[16px] md:py-[20px] border-t border-[#eee] flex gap-[10px]">
          <button onClick={onClose} disabled={isSubmitting}
            className="flex-1 py-[12px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#767676] tracking-[-0.3px] border border-[#ddd] rounded-[10px] hover:border-[#bbb] cursor-pointer bg-white transition-colors disabled:opacity-50">
            취소
          </button>
          <button onClick={handleSave} disabled={isSubmitting}
            className="flex-1 py-[12px] font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] text-white tracking-[-0.3px] bg-[#4a6741] hover:bg-[#3d5636] rounded-[10px] cursor-pointer border-none transition-colors disabled:opacity-50">
            {isSubmitting ? "업로드 중..." : "게시글 제출 (승인 후 공개)"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── 이미지 갤러리 모달 ─── */
function GalleryModal({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const prev = () => setIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col bg-[#050505] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <div className="absolute top-[20px] right-[20px] z-10">
        <button
          onClick={onClose}
          className="p-[8px] bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer border-none"
        >
          <X color="white" size={24} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center relative w-full h-full p-[20px] md:p-[60px]">
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-[20px] md:left-[40px] z-10 p-[12px] bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer border-none hidden md:block"
            >
              <ChevronLeft color="white" size={32} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-[20px] md:right-[40px] z-10 p-[12px] bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer border-none hidden md:block"
            >
              <ChevronRight color="white" size={32} />
            </button>
          </>
        )}
        <div
          className="w-full h-full flex items-center justify-center relative touch-pan-x"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            key={idx}
            src={images[idx]}
            alt={`활동 사진 ${idx + 1}`}
            className="max-w-full max-h-full object-contain"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
      {images.length > 1 && (
        <div
          className="h-[100px] w-full bg-black/80 flex items-center px-[20px] gap-[10px] overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-[10px] md:hidden pr-[10px] border-r border-white/20 shrink-0">
            <button onClick={prev} className="p-[6px] bg-white/10 rounded-full cursor-pointer border-none">
              <ChevronLeft color="white" size={20} />
            </button>
            <button onClick={next} className="p-[6px] bg-white/10 rounded-full cursor-pointer border-none">
              <ChevronRight color="white" size={20} />
            </button>
          </div>
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setIdx(i)}
              className={`w-[60px] h-[60px] shrink-0 rounded-[6px] overflow-hidden cursor-pointer transition-all ${
                i === idx ? "border-[2px] border-white scale-105" : "opacity-50 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`thumb ${i}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── 상세 페이지 ─── */
function ActivityDetail({
  activity,
  onBack,
}: {
  activity: ActivityItem;
  onBack: () => void;
}) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const handlePhotoClick = (i: number) => {
    setGalleryIndex(i);
    setGalleryOpen(true);
  };

  return (
    <div className="w-full max-w-[860px] mx-auto px-[15px] md:px-[24px] pb-[80px]">
      {/* 뒤로 */}
      <div className="pt-[24px] md:pt-[32px] pb-[20px] md:pb-[28px] border-b border-black">
        <button
          onClick={onBack}
          className="flex items-center gap-[6px] text-[#767676] hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowLeft size={18} />
          <span
            className="font-['Instrument_Sans:Regular',sans-serif] text-[13px] md:text-[14px] tracking-[-0.4px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            목록으로
          </span>
        </button>
      </div>

      {/* 헤더 정보 */}
      <motion.div
        className="pt-[28px] md:pt-[36px] pb-[24px] md:pb-[32px] border-b border-[#eee]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {activity.groupName && (
          <span className="inline-block px-[10px] py-[3px] rounded-full bg-[#f0f5ef] text-[#4a6741] text-[12px] font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-0.3px] mb-[14px]">
            {activity.groupName}
          </span>
        )}
        <h1
          className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[24px] md:text-[30px] lg:text-[34px] text-black tracking-[-1px] leading-[1.35] break-keep mb-[20px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {activity.title}
        </h1>
        <div className="flex flex-wrap gap-x-[24px] gap-y-[8px]">
          {activity.activityDate && (
            <div className="flex items-center gap-[6px] text-[#767676]">
              <Calendar size={14} />
              <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] tracking-[-0.3px]">
                {activity.activityDate}
              </span>
            </div>
          )}
          {activity.activityPlace && (
            <div className="flex items-center gap-[6px] text-[#767676]">
              <MapPin size={14} />
              <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] tracking-[-0.3px]">
                {activity.activityPlace}
              </span>
            </div>
          )}
          {activity.participants && (
            <div className="flex items-center gap-[6px] text-[#767676]">
              <Users size={14} />
              <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] tracking-[-0.3px]">
                {activity.participants}명 참여
              </span>
            </div>
          )}
          {activity.author && (
            <div className="flex items-center gap-[6px] text-[#767676]">
              <FileText size={14} />
              <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] tracking-[-0.3px]">
                작성자: {activity.author}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* 활동내용 */}
      {activity.content && (
        <motion.div
          className="py-[28px] md:py-[36px] border-b border-[#eee]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p
            className="font-['Instrument_Sans:Regular',sans-serif] text-[12px] md:text-[13px] text-[#999] tracking-[-0.3px] mb-[12px] uppercase"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            활동내용
          </p>
          <div
            className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] md:text-[15px] lg:text-[16px] text-[#333] leading-[1.9] tracking-[-0.3px] break-keep"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {activity.content.split("\n").map((line, i) => (
              <span key={i} className="block min-h-[1.9em]">
                {line}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* 결과보고 */}
      {activity.report && (
        <motion.div
          className="py-[28px] md:py-[36px] border-b border-[#eee]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <p
            className="font-['Instrument_Sans:Regular',sans-serif] text-[12px] md:text-[13px] text-[#999] tracking-[-0.3px] mb-[12px] uppercase"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            결과보고
          </p>
          <div
            className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] md:text-[15px] lg:text-[16px] text-[#333] leading-[1.9] tracking-[-0.3px] break-keep"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {activity.report.split("\n").map((line, i) => (
              <span key={i} className="block min-h-[1.9em]">
                {line}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* 활동사진 */}
      {activity.photos && activity.photos.length > 0 && (
        <motion.div
          className="py-[28px] md:py-[36px] border-b border-[#eee]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-[8px] mb-[16px]">
            <ImageIcon size={15} className="text-[#999]" />
            <p
              className="font-['Instrument_Sans:Regular',sans-serif] text-[12px] md:text-[13px] text-[#999] tracking-[-0.3px] uppercase"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              활동사진 ({activity.photos.length}장)
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[8px] md:gap-[12px]">
            {activity.photos.map((src, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-[6px] overflow-hidden cursor-pointer group relative"
                onClick={() => handlePhotoClick(i)}
              >
                <img
                  src={src}
                  alt={`활동사진 ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 영수증 */}
      {activity.receipts && activity.receipts.length > 0 && (
        <motion.div
          className="py-[28px] md:py-[36px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="flex items-center gap-[8px] mb-[16px]">
            <Receipt size={15} className="text-[#999]" />
            <p
              className="font-['Instrument_Sans:Regular',sans-serif] text-[12px] md:text-[13px] text-[#999] tracking-[-0.3px] uppercase"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              영수증 ({activity.receipts.length}개)
            </p>
          </div>
          <div className="flex flex-col gap-[8px]">
            {activity.receipts.map((src, i) => {
              const isImage = src.startsWith("data:image") || /\.(jpg|jpeg|png|gif|webp)$/i.test(src);
              const name = activity.receiptNames?.[i] || `영수증 ${i + 1}`;
              return (
                <div
                  key={i}
                  className="flex items-center gap-[12px] p-[12px] md:p-[14px] border border-[#eee] rounded-[8px] hover:border-[#bbb] transition-colors"
                >
                  <div className="w-[44px] h-[44px] rounded-[6px] overflow-hidden shrink-0 bg-[#f5f5f3] flex items-center justify-center">
                    {isImage ? (
                      <img src={src} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <Receipt size={20} className="text-[#bbb]" />
                    )}
                  </div>
                  <span
                    className="flex-1 font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] md:text-[14px] text-[#333] tracking-[-0.3px] truncate"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    {name}
                  </span>
                  <a
                    href={src}
                    download={name}
                    className="flex items-center gap-[6px] shrink-0 font-['Instrument_Sans:Regular',sans-serif] text-[12px] text-[#767676] hover:text-black tracking-[-0.3px] transition-colors no-underline px-[10px] py-[6px] border border-[#ddd] rounded-full hover:border-black"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    <Download size={13} />
                    다운로드
                  </a>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 이미지 갤러리 모달 */}
      <AnimatePresence>
        {galleryOpen && activity.photos && activity.photos.length > 0 && (
          <GalleryModal
            images={activity.photos}
            initialIndex={galleryIndex}
            onClose={() => setGalleryOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 목록 카드 ─── */
function ActivityCard({
  activity,
  index,
  onClick,
}: {
  activity: ActivityItem;
  index: number;
  onClick: () => void;
}) {
  const cover = activity.photos?.[0];
  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-[16px] md:gap-[24px] w-full py-[24px] md:py-[28px] border-b border-[#eee] cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      onClick={onClick}
    >
      {/* 대표사진 */}
      <div className="w-full sm:w-[160px] md:w-[200px] lg:w-[240px] shrink-0 aspect-[4/3] rounded-[6px] overflow-hidden bg-[#f5f5f3]">
        {cover ? (
          <img
            src={cover}
            alt={activity.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={28} className="text-[#ddd]" />
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex flex-col gap-[8px] justify-center flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-[8px]">
          {activity.groupName && (
            <span className="inline-block px-[8px] py-[2px] rounded-full bg-[#f0f5ef] text-[#4a6741] text-[11px] font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-0.2px] shrink-0">
              {activity.groupName}
            </span>
          )}
          {activity.activityDate && (
            <span className="font-['Instrument_Sans:Regular',sans-serif] text-[12px] md:text-[13px] text-[#999] tracking-[-0.3px]"
              style={{ fontVariationSettings: "'wdth' 100" }}>
              {activity.activityDate}
            </span>
          )}
        </div>
        <h3
          className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[16px] md:text-[19px] text-black tracking-[-0.6px] leading-[1.4] break-keep group-hover:text-[#4a6741] transition-colors"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {activity.title}
        </h3>
        {activity.content && (
          <p
            className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] md:text-[14px] text-[#767676] tracking-[-0.3px] leading-[1.7] line-clamp-2 break-keep"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {activity.content.split("\n")[0]}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px] mt-[4px]">
          {activity.activityPlace && (
            <div className="flex items-center gap-[5px] text-[#aaa]">
              <MapPin size={12} />
              <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] tracking-[-0.2px]">
                {activity.activityPlace}
              </span>
            </div>
          )}
          {activity.participants && (
            <div className="flex items-center gap-[5px] text-[#aaa]">
              <Users size={12} />
              <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] tracking-[-0.2px]">
                {activity.participants}명
              </span>
            </div>
          )}
          {activity.photos && activity.photos.length > 0 && (
            <div className="flex items-center gap-[5px] text-[#aaa]">
              <ImageIcon size={12} />
              <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] tracking-[-0.2px]">
                사진 {activity.photos.length}장
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── 메인 페이지 컴포넌트 ─── */
export default function ActivityBoardPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const allActivities = getActivities();
  const visibleActivities = allActivities
    .filter((a) => a.visible)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [writeModal, setWriteModal] = useState(false);

  const handlePasswordSubmit = () => {
    if (verifyPassword(password)) {
      setShowPasswordModal(false);
      setPassword("");
      setPasswordError("");
      navigate("/admin/activity");
    } else {
      setPasswordError("비밀번호가 올바르지 않습니다");
      setPassword("");
    }
  };

  const handleWriteSave = (item: ActivityItem) => {
    // 이제 ActivityFormModal 내부에서 Supabase 통신을 전담하므로,
    // 이 함수는 단순히 모달을 닫는 용도로만 남겨둡니다. (로컬 반영 안 함)
    setWriteModal(false);
  };

  // 상세 페이지 여부
  const selectedActivity = id ? visibleActivities.find((a) => a.id === id) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="bg-white flex flex-col items-center relative w-full min-h-screen">
      {/* ─── 공통 헤더 ─── */}
      <div className="w-full max-w-[900px] px-[15px] md:px-[24px] pt-[24px] md:pt-[32px]">
        <div className="flex items-center gap-[12px] pb-[20px] md:pb-[28px] border-b border-black">
          <Link
            to="/"
            className="flex items-center gap-[6px] text-[#767676] hover:text-black transition-colors no-underline"
          >
            <ArrowLeft size={18} />
            <span
              className="font-['Instrument_Sans:Regular',sans-serif] text-[13px] md:text-[14px] tracking-[-0.4px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Home
            </span>
          </Link>
        </div>
      </div>

      {selectedActivity ? (
        /* ─── 상세 페이지 ─── */
        <ActivityDetail
          activity={selectedActivity}
          onBack={() => navigate("/activity")}
        />
      ) : (
        /* ─── 목록 페이지 ─── */
        <div className="w-full max-w-[900px] px-[15px] md:px-[24px]">
          {/* 타이틀 + 글쓰기 버튼 */}
          <div className="pt-[16px] md:pt-[24px] lg:pt-[32px] pb-[28px] md:pb-[36px]">
            <div className="flex items-end justify-between gap-[12px] md:gap-[16px]">
              <div className="flex items-end gap-[12px] md:gap-[16px]">
                <div className="h-[40px] w-[40px] md:h-[50px] md:w-[50px] shrink-0 rounded-full overflow-hidden">
                  {getBrandImages().emblem ? (
                    <img src={getBrandImages().emblem} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#f5f5f3] rounded-full" />
                  )}
                </div>
                <div>
                  <motion.div
                    className="group grid place-items-start font-['Instrument_Sans:Regular',sans-serif] text-[28px] md:text-[36px] lg:text-[44px] text-black tracking-[-1.4px] md:tracking-[-1.8px] lg:tracking-[-2.2px] leading-[1.1]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="col-start-1 row-start-1 group-hover:opacity-0 transition-opacity duration-300 m-0">Activity Board</p>
                    <p className="col-start-1 row-start-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-1.4px] md:tracking-[-1.8px] lg:tracking-[-2.2px] m-0">활동 게시판</p>
                  </motion.div>
                </div>
              </div>
              {/* 글쓰기 버튼 */}
              <motion.button
                onClick={() => setWriteModal(true)}
                className="shrink-0 flex items-center gap-[6px] bg-[#4a6741] hover:bg-[#3d5636] text-white font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] tracking-[-0.3px] px-[14px] md:px-[18px] py-[8px] md:py-[10px] rounded-[8px] cursor-pointer border-none transition-colors"
                style={{ fontVariationSettings: "'wdth' 100" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Plus size={15} />
                글쓰기
              </motion.button>
            </div>
            <motion.p
              className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] md:text-[14px] lg:text-[16px] text-[#767676] tracking-[-0.3px] leading-[1.8] mt-[20px] md:mt-[28px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              동북시찰청년연합회 소모임별 활동 기록입니다
            </motion.p>
          </div>

          {/* 게시글 목록 */}
          <div className="pb-[60px] md:pb-[80px]">
            {visibleActivities.length === 0 ? (
              <div className="py-[80px] flex flex-col items-center justify-center gap-[12px]">
                <p
                  className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#bbb] tracking-[-0.3px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  아직 등록된 활동이 없습니다
                </p>
                <button
                  onClick={() => setWriteModal(true)}
                  className="flex items-center gap-[6px] text-[#4a6741] font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] tracking-[-0.3px] border border-[#4a6741]/30 rounded-full px-[18px] py-[8px] hover:bg-[#f0f5ef] cursor-pointer bg-transparent transition-colors"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  <Plus size={14} />
                  첫 게시글 작성하기
                </button>
              </div>
            ) : (
              <div>
                {visibleActivities.map((activity, i) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    index={i}
                    onClick={() => navigate(`/activity/${activity.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 푸터 ─── */}
      <div className="w-full max-w-[900px] px-[15px] md:px-[24px] py-[24px] border-t border-black">
        <div className="flex items-center justify-between">
          <p
            className="font-['Noto_Sans_KR:Regular',sans-serif] text-[10px] md:text-[11px] text-[#767676] tracking-[-0.33px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            동북시찰청년연합회 대한예수교장로회(통합)
          </p>
          <div className="flex items-center gap-[12px]">
            <Link
              to="/"
              className="font-['Instrument_Sans:Regular',sans-serif] text-[11px] text-[#767676] tracking-[-0.55px] hover:text-black transition-colors no-underline"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Back to Home
            </Link>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="text-[#ccc] hover:text-[#999] active:text-[#999] transition-colors duration-300 p-[4px] cursor-pointer bg-transparent border-none"
              aria-label="활동 게시판 관리"
            >
              <Settings size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 글쓰기 모달 */}
      <AnimatePresence>
        {writeModal && (
          <ActivityFormModal
            initial={null}
            onSave={handleWriteSave}
            onClose={() => setWriteModal(false)}
          />
        )}
      </AnimatePresence>

      {/* 비밀번호 모달 */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => { setShowPasswordModal(false); setPassword(""); setPasswordError(""); }}
          >
            <motion.div
              className="bg-white w-full sm:w-[320px] sm:rounded-[12px] rounded-t-[16px] p-[24px] sm:p-[32px] shadow-lg"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-[36px] h-[4px] bg-[#ddd] rounded-full mx-auto mb-[20px] sm:hidden" />
              <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[16px] text-black tracking-[-0.4px] mb-[8px]"
                style={{ fontVariationSettings: "'wdth' 100" }}>
                관리자 인증
              </p>
              <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#999] tracking-[-0.3px] mb-[20px]"
                style={{ fontVariationSettings: "'wdth' 100" }}>
                비밀번호를 입력해주세요
              </p>
              <input
                type="password"
                inputMode="numeric"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handlePasswordSubmit(); }}
                placeholder="비밀번호"
                autoFocus
                className="w-full border border-[#ddd] rounded-[8px] px-[14px] py-[12px] text-[16px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors"
              />
              {passwordError && (
                <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-red-500 tracking-[-0.3px] mt-[8px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}>
                  {passwordError}
                </p>
              )}
              <div className="flex gap-[8px] mt-[20px]">
                <button
                  onClick={() => { setShowPasswordModal(false); setPassword(""); setPasswordError(""); }}
                  className="flex-1 sm:flex-none font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#767676] tracking-[-0.3px] px-[16px] py-[11px] rounded-[8px] border border-[#ddd] active:border-[#999] hover:border-[#999] transition-colors cursor-pointer bg-white"
                >
                  취소
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 sm:flex-none font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[16px] py-[11px] rounded-[8px] bg-[#4a6741] active:bg-[#3d5636] hover:bg-[#3d5636] transition-colors cursor-pointer border-none"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
