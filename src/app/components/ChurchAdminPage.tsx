import { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Upload,
  X,
} from "lucide-react";
import {
  getChurches,
  saveChurches,
  generateChurchId,
  type ChurchItem,
} from "./churchStore";

const inputCls =
  "w-full border border-[#ddd] rounded-[8px] px-[12px] py-[10px] text-[14px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors bg-white";

/* ─── 이미지 업로드 컴포넌트 ─── */
function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const uid = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB 이하만 가능합니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const img = new Image();
        img.onload = () => {
          const maxW = 1200;
          const maxH = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxW) { h = h * (maxW / w); w = maxW; }
          if (h > maxH) { w = w * (maxH / h); h = maxH; }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            onChange(canvas.toDataURL("image/jpeg", 0.8));
          }
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div>
      <p
        className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[12px] text-[#767676] tracking-[-0.3px] mb-[6px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        이미지
      </p>

      {/* 미리보기 */}
      {value && (
        <div className="relative mb-[8px] inline-block">
          <div className="w-[160px] h-[100px] rounded-[6px] overflow-hidden bg-[#f5f5f3]">
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
          <button
            onClick={() => onChange("")}
            className="absolute -top-[6px] -right-[6px] w-[20px] h-[20px] bg-black/70 text-white rounded-full flex items-center justify-center cursor-pointer border-none hover:bg-black transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* 드래그 앤 드롭 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-[8px] p-[16px] text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-[#4a6741] bg-[#f0f5ef]"
            : "border-[#ddd] bg-[#fafaf8] hover:border-[#bbb]"
        }`}
        onClick={() => document.getElementById("church-img-" + uid)?.click()}
      >
        <input
          id={"church-img-" + uid}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-[6px]">
          <div className={`p-[6px] rounded-full ${isDragging ? "bg-[#4a6741]/10 text-[#4a6741]" : "bg-[#eee] text-[#999]"}`}>
            <Upload size={18} />
          </div>
          <p
            className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {isDragging ? (
              <span className="text-[#4a6741] font-medium">여기에 놓아주세요</span>
            ) : (
              <>이미지를 끌어다 놓거나 <span className="text-[#4a6741] underline">파일 선택</span></>
            )}
          </p>
          <p
            className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[10px] text-[#bbb] tracking-[-0.2px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            JPG, PNG, GIF, WebP · 최대 5MB
          </p>
        </div>
      </div>

      {/* URL 직접 입력 */}
      <div className="mt-[6px]">
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[11px] text-[#999] tracking-[-0.3px] hover:text-[#666] transition-colors cursor-pointer bg-transparent border-none p-0 underline"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {showUrlInput ? "URL 입력 닫기" : "URL로 직접 입력"}
        </button>
        {showUrlInput && (
          <input
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... (이미지 주소)"
            className={inputCls + " mt-[6px]"}
          />
        )}
      </div>
    </div>
  );
}

export default function ChurchAdminPage() {
  const navigate = useNavigate();
  const [churches, setChurches] = useState<ChurchItem[]>(() => getChurches());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const emptyChurch: Omit<ChurchItem, "id"> = {
    name: "",
    nameEn: "",
    address: "",
    image: "",
    pastor: "",
    youthLeader: "",
    phone: "",
    visible: true,
  };

  const [newChurch, setNewChurch] = useState<Omit<ChurchItem, "id">>(emptyChurch);

  useEffect(() => {
    saveChurches(churches);
  }, [churches]);

  const handleAddChurch = () => {
    if (!newChurch.name.trim()) return;
    const church: ChurchItem = { ...newChurch, id: generateChurchId() };
    setChurches((prev) => [...prev, church]);
    setNewChurch({ ...emptyChurch });
    setShowAddForm(false);
    showSaveMsg("교회가 추가되었습니다");
  };

  const handleDeleteChurch = (id: number) => {
    setChurches((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirmId(null);
    showSaveMsg("교회가 삭제되었습니다");
  };

  const handleToggleVisibility = (id: number) => {
    setChurches((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    );
  };

  const handleUpdateChurch = (id: number, updates: Partial<ChurchItem>) => {
    setChurches((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setChurches((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === churches.length - 1) return;
    setChurches((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const showSaveMsg = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <p
      className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[12px] text-[#767676] tracking-[-0.3px] mb-[6px]"
      style={{ fontVariationSettings: "'wdth' 100" }}
    >
      {children}
    </p>
  );

  return (
    <div className="bg-[#f8f8f6] min-h-screen pb-[60px]">
      {/* Sticky Header */}
      <div className="bg-white border-b border-[#eee] sticky top-0 z-10">
        <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[14px] md:py-[16px] flex items-center gap-[12px]">
          <button
            onClick={() => navigate("/churches")}
            className="flex items-center gap-[6px] text-[#767676] hover:text-black active:text-black transition-colors cursor-pointer bg-transparent border-none p-[6px] -ml-[6px]"
          >
            <ArrowLeft size={18} />
            <span
              className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[13px] tracking-[-0.3px] hidden sm:inline"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              돌아가기
            </span>
          </button>
          <div className="flex-1" />
          <p
            className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.4px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            교회 관리
          </p>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            className="fixed top-[70px] left-[50%] z-50 bg-[#4a6741] text-white px-[16px] py-[10px] rounded-[8px] shadow-lg whitespace-nowrap"
            initial={{ opacity: 0, y: -10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            transition={{ duration: 0.2 }}
          >
            <p
              className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] tracking-[-0.3px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {saveMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[24px] md:py-[48px]">
        {/* 새 교회 추가 */}
        <div className="bg-white rounded-[12px] border border-[#eee] mb-[20px] md:mb-[24px] overflow-hidden">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center gap-[10px] px-[16px] md:px-[24px] py-[16px] md:py-[18px] cursor-pointer bg-transparent border-none text-left active:bg-[#fafaf8] hover:bg-[#fafaf8] transition-colors"
          >
            <div className="w-[28px] h-[28px] rounded-full bg-[#4a6741] flex items-center justify-center shrink-0">
              <Plus size={14} className="text-white" />
            </div>
            <p
              className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.4px] flex-1"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              새 교회 추가
            </p>
            {showAddForm ? (
              <ChevronUp size={16} className="text-[#999]" />
            ) : (
              <ChevronDown size={16} className="text-[#999]" />
            )}
          </button>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-[16px] md:px-[24px] pb-[20px] md:pb-[24px] border-t border-[#f0f0f0] pt-[16px] md:pt-[20px]">
                  <div className="flex flex-col gap-[14px]">
                    <div>
                      <Label>교회 이름 (한글) *</Label>
                      <input
                        type="text"
                        value={newChurch.name}
                        onChange={(e) =>
                          setNewChurch({ ...newChurch, name: e.target.value })
                        }
                        placeholder="예: 함덕교회"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label>교회 이름 (영문)</Label>
                      <input
                        type="text"
                        value={newChurch.nameEn}
                        onChange={(e) =>
                          setNewChurch({ ...newChurch, nameEn: e.target.value })
                        }
                        placeholder="예: Hamdeok Church"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label>주소</Label>
                      <input
                        type="text"
                        value={newChurch.address}
                        onChange={(e) =>
                          setNewChurch({ ...newChurch, address: e.target.value })
                        }
                        placeholder="예: 제주 제주시 조천읍 신북로 478-1"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label>담당목사 (선택)</Label>
                      <input
                        type="text"
                        value={newChurch.pastor || ""}
                        onChange={(e) =>
                          setNewChurch({ ...newChurch, pastor: e.target.value })
                        }
                        placeholder="예: 홍길동 목사"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label>청년부 리더 (선택)</Label>
                      <input
                        type="text"
                        value={newChurch.youthLeader || ""}
                        onChange={(e) =>
                          setNewChurch({ ...newChurch, youthLeader: e.target.value })
                        }
                        placeholder="예: 김철수 리더"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label>연락처 (선택)</Label>
                      <input
                        type="text"
                        value={newChurch.phone || ""}
                        onChange={(e) =>
                          setNewChurch({ ...newChurch, phone: e.target.value })
                        }
                        placeholder="예: 010-1234-5678"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <ImageUploadField
                        value={newChurch.image}
                        onChange={(url) => setNewChurch({ ...newChurch, image: url })}
                      />
                    </div>
                    <div className="flex gap-[8px] mt-[4px]">
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewChurch({ ...emptyChurch });
                        }}
                        className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#767676] tracking-[-0.3px] px-[16px] py-[10px] rounded-[8px] border border-[#ddd] hover:border-[#999] transition-colors cursor-pointer bg-white"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleAddChurch}
                        disabled={!newChurch.name.trim()}
                        className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[16px] py-[10px] rounded-[8px] bg-[#4a6741] hover:bg-[#3d5636] transition-colors cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 등록된 교회 목록 */}
        <div className="mb-[12px] md:mb-[16px]">
          <p
            className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] md:text-[14px] text-[#767676] tracking-[-0.3px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            등록된 교회 ({churches.length}개)
          </p>
        </div>

        <div className="flex flex-col gap-[10px] md:gap-[12px]">
          {churches.map((church, index) => (
            <div
              key={church.id}
              className={`bg-white rounded-[12px] border overflow-hidden transition-colors ${
                !church.visible ? "border-[#eee] opacity-60" : "border-[#eee]"
              }`}
            >
              {/* 교회 카드 헤더 */}
              <div className="flex items-center gap-[10px] md:gap-[16px] px-[12px] md:px-[20px] py-[14px] md:py-[16px]">
                {/* 순서 이동 */}
                <div className="flex flex-col gap-[2px] shrink-0">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="text-[#bbb] hover:text-[#666] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-transparent border-none p-[2px]"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === churches.length - 1}
                    className="text-[#bbb] hover:text-[#666] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-transparent border-none p-[2px]"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* 썸네일 */}
                {church.image && (
                  <div className="w-[48px] h-[36px] md:w-[60px] md:h-[45px] rounded-[4px] overflow-hidden shrink-0 bg-[#f5f5f5]">
                    <img
                      src={church.image}
                      alt={church.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-[6px]">
                    <p
                      className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.3px] leading-[1.4]"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {church.name}
                    </p>
                    {church.nameEn && (
                      <span
                        className="font-['Instrument_Sans:Regular',sans-serif] text-[11px] text-[#999] tracking-[-0.3px] hidden sm:inline"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        {church.nameEn}
                      </span>
                    )}
                  </div>
                  {church.address && (
                    <p
                      className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[11px] md:text-[12px] text-[#999] tracking-[-0.3px] mt-[2px] truncate"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {church.address}
                    </p>
                  )}
                </div>

                {/* 액션 버튼들 */}
                <div className="flex items-center gap-[4px] md:gap-[6px] shrink-0">
                  <button
                    onClick={() => handleToggleVisibility(church.id)}
                    className={`p-[8px] rounded-[6px] transition-colors cursor-pointer bg-transparent border-none ${
                      church.visible
                        ? "text-[#4a6741] hover:bg-[#f0f5ef]"
                        : "text-[#ccc] hover:bg-[#f5f5f5]"
                    }`}
                    title={church.visible ? "숨기기" : "표시하기"}
                  >
                    {church.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() =>
                      setEditingId(editingId === church.id ? null : church.id)
                    }
                    className={`p-[8px] rounded-[6px] transition-colors cursor-pointer bg-transparent border-none ${
                      editingId === church.id
                        ? "text-[#4a6741] bg-[#f0f5ef]"
                        : "text-[#999] hover:bg-[#f5f5f5]"
                    }`}
                    title="수정"
                  >
                    <GripVertical size={16} />
                  </button>
                  {deleteConfirmId === church.id ? (
                    <div className="flex items-center gap-[4px]">
                      <button
                        onClick={() => handleDeleteChurch(church.id)}
                        className="p-[8px] rounded-[6px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none"
                        title="삭제 확인"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-[8px] rounded-[6px] text-[#999] hover:bg-[#f5f5f5] transition-colors cursor-pointer bg-transparent border-none text-[12px] font-['Noto_Sans_KR:Regular',sans-serif]"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(church.id)}
                      className="p-[8px] rounded-[6px] text-[#ccc] hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* 수정 폼 */}
              <AnimatePresence>
                {editingId === church.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-[12px] md:px-[20px] pb-[16px] md:pb-[20px] border-t border-[#f0f0f0] pt-[14px] md:pt-[16px]">
                      <div className="flex flex-col gap-[12px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                          <div>
                            <Label>교회 이름 (한글)</Label>
                            <input
                              type="text"
                              value={church.name}
                              onChange={(e) =>
                                handleUpdateChurch(church.id, {
                                  name: e.target.value,
                                })
                              }
                              placeholder="교회 이름"
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <Label>교회 이름 (영문)</Label>
                            <input
                              type="text"
                              value={church.nameEn}
                              onChange={(e) =>
                                handleUpdateChurch(church.id, {
                                  nameEn: e.target.value,
                                })
                              }
                              placeholder="영문 이름"
                              className={inputCls}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>주소</Label>
                          <input
                            type="text"
                            value={church.address}
                            onChange={(e) =>
                              handleUpdateChurch(church.id, {
                                address: e.target.value,
                              })
                            }
                            placeholder="주소"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <Label>담당목사 (선택)</Label>
                          <input
                            type="text"
                            value={church.pastor || ""}
                            onChange={(e) =>
                              handleUpdateChurch(church.id, {
                                pastor: e.target.value,
                              })
                            }
                            placeholder="예: 홍길동 목사"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <Label>청년부 리더 (선택)</Label>
                          <input
                            type="text"
                            value={church.youthLeader || ""}
                            onChange={(e) =>
                              handleUpdateChurch(church.id, {
                                youthLeader: e.target.value,
                              })
                            }
                            placeholder="예: 김철수 리더"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <Label>연락처 (선택)</Label>
                          <input
                            type="text"
                            value={church.phone || ""}
                            onChange={(e) =>
                              handleUpdateChurch(church.id, {
                                phone: e.target.value,
                              })
                            }
                            placeholder="예: 010-1234-5678"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <ImageUploadField
                            value={church.image}
                            onChange={(url) =>
                              handleUpdateChurch(church.id, { image: url })
                            }
                          />
                        </div>
                        <div className="flex justify-end mt-[4px]">
                          <button
                            onClick={() => {
                              setEditingId(null);
                              showSaveMsg("수정사항이 저장되었습니다");
                            }}
                            className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[16px] py-[10px] rounded-[8px] bg-[#4a6741] hover:bg-[#3d5636] transition-colors cursor-pointer border-none"
                          >
                            수정 완료
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {churches.length === 0 && (
          <div className="bg-white rounded-[12px] border border-[#eee] py-[60px] flex items-center justify-center">
            <p
              className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] text-[#999] tracking-[-0.3px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              등록된 교회가 없습니다
            </p>
          </div>
        )}

        {/* 제작자 표시 */}
        <p
          className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[11px] text-[#bbb] tracking-[-0.3px] text-center mt-[20px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          2026년 제주성산교회 고지훈 청년 제작
        </p>
      </div>
    </div>
  );
}