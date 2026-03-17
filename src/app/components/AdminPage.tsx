import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getEvents, saveEvents, generateId, type EventItem } from "./eventStore";

const CATEGORIES = ["공지", "예배", "행사", "교육", "봉사", "기타"];

export default function AdminPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>(() => getEvents());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const emptyEvent: Omit<EventItem, "id"> = {
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    location: "",
    description: "",
    registerUrl: "",
    visible: true,
    category: "공지",
  };

  const [newEvent, setNewEvent] = useState<Omit<EventItem, "id">>(emptyEvent);

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;
    const event: EventItem = { ...newEvent, id: generateId() };
    setEvents((prev) => [event, ...prev]);
    setNewEvent({ ...emptyEvent });
    setShowAddForm(false);
    showSaveMsg("소식이 추가되었습니다");
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirmId(null);
    showSaveMsg("소식이 삭제되었습니다");
  };

  const handleToggleVisibility = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e))
    );
  };

  const handleUpdateEvent = (id: string, updates: Partial<EventItem>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const showSaveMsg = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  /* ─── shared input style ─── */
  const inputCls =
    "w-full border border-[#ddd] rounded-[8px] px-[12px] py-[10px] text-[14px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors bg-white";

  return (
    <div className="bg-[#f8f8f6] min-h-screen pb-[60px]">
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-[#eee] sticky top-0 z-10">
        <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[14px] md:py-[16px] flex items-center gap-[12px]">
          <button
            onClick={() => navigate("/")}
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
            관리자
          </p>
        </div>
      </div>

      {/* ── Toast ── */}
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
        {/* ════════════════════════════════════════
            새 소식 추가
        ════════════════════════════════════════ */}
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
              새 소식 추가
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
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-[16px] md:px-[24px] pb-[20px] md:pb-[24px] border-t border-[#eee] pt-[20px] md:pt-[24px]">
                  <div className="flex flex-col gap-[14px] md:gap-[16px]">
                    {/* 제목 */}
                    <div>
                      <Label>제목 *</Label>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, title: e.target.value })
                        }
                        placeholder="행사 제목을 입력하세요"
                        className={inputCls}
                      />
                    </div>

                    {/* 카테고리 · 날짜 */}
                    <div className="grid grid-cols-2 gap-[10px]">
                      <div>
                        <Label>카테고리</Label>
                        <select
                          value={newEvent.category}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, category: e.target.value })
                          }
                          className={inputCls}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>날짜</Label>
                        <input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, date: e.target.value })
                          }
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* 시간 · 장소 */}
                    <div className="grid grid-cols-2 gap-[10px]">
                      <div>
                        <Label>시간</Label>
                        <input
                          type="time"
                          value={newEvent.time}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, time: e.target.value })
                          }
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <Label>장소</Label>
                        <input
                          type="text"
                          value={newEvent.location}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, location: e.target.value })
                          }
                          placeholder="장소"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* 내용 */}
                    <div>
                      <Label>내용</Label>
                      <textarea
                        value={newEvent.description}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, description: e.target.value })
                        }
                        placeholder="상세 내용을 입력하세요"
                        rows={3}
                        className={inputCls + " resize-none"}
                      />
                    </div>

                    {/* 신청 링크 */}
                    <div>
                      <Label>참석 신청 링크</Label>
                      <input
                        type="url"
                        value={newEvent.registerUrl}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, registerUrl: e.target.value })
                        }
                        placeholder="https://docs.google.com/forms/..."
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-[8px] mt-[20px]">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewEvent({ ...emptyEvent });
                      }}
                      className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#767676] tracking-[-0.3px] px-[16px] md:px-[20px] py-[10px] rounded-[8px] border border-[#ddd] active:border-[#999] hover:border-[#999] transition-colors cursor-pointer bg-white"
                    >
                      초기화
                    </button>
                    <button
                      onClick={handleAddEvent}
                      disabled={!newEvent.title.trim()}
                      className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[16px] md:px-[20px] py-[10px] rounded-[8px] bg-[#4a6741] active:bg-[#3d5636] hover:bg-[#3d5636] transition-colors cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-[6px]"
                    >
                      <Check size={14} />
                      추가
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ════════════════════════════════════════
            등록된 소식 목록
        ════════════════════════════════════════ */}
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between px-[4px] mb-[6px]">
            <p
              className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] md:text-[14px] text-[#767676] tracking-[-0.3px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              등록된 소식 ({events.length}건)
            </p>
          </div>

          {events.length === 0 ? (
            <div className="bg-white rounded-[12px] border border-[#eee] px-[20px] py-[48px] flex flex-col items-center gap-[12px]">
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] text-[#999] tracking-[-0.3px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                등록된 소식이 없습니다
              </p>
            </div>
          ) : (
            events.map((event) => (
              <motion.div
                key={event.id}
                layout
                className={`bg-white rounded-[12px] border border-[#eee] overflow-hidden ${
                  !event.visible ? "opacity-50" : ""
                }`}
              >
                {/* ── 카드 헤더 (모바일: 2줄 스택 / 데스크탑: 1줄) ── */}
                <div className="px-[16px] md:px-[24px] py-[14px] md:py-[18px]">
                  {/* 상단: 카테고리 + 날짜 + 액션 */}
                  <div className="flex items-center gap-[8px] md:gap-[16px]">
                    <span className="shrink-0 font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[11px] tracking-[-0.2px] px-[8px] py-[3px] rounded-[4px] bg-[#f0ede8] text-[#767676]">
                      {event.category || "기타"}
                    </span>
                    <p
                      className="shrink-0 font-['Instrument_Sans:Medium',sans-serif] font-medium text-[12px] md:text-[13px] text-[#999] tracking-[-0.3px]"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {event.date}
                      {event.time && (
                        <span className="ml-[6px] text-[#bbb]">{event.time}</span>
                      )}
                    </p>
                    <div className="flex-1" />
                    {/* 액션 버튼들 */}
                    <div className="flex items-center gap-[2px] shrink-0">
                      <button
                        onClick={() => handleToggleVisibility(event.id)}
                        className={`p-[6px] md:p-[8px] rounded-[6px] cursor-pointer bg-transparent border-none transition-colors ${
                          event.visible
                            ? "text-[#4a6741] active:bg-[#f0f7ee] hover:bg-[#f0f7ee]"
                            : "text-[#ccc] active:bg-[#f5f5f5] hover:bg-[#f5f5f5]"
                        }`}
                        title={event.visible ? "숨기기" : "표시하기"}
                      >
                        {event.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button
                        onClick={() =>
                          setEditingId(editingId === event.id ? null : event.id)
                        }
                        className="p-[6px] md:p-[8px] rounded-[6px] cursor-pointer bg-transparent border-none text-[#999] active:text-black hover:text-black active:bg-[#f5f5f5] hover:bg-[#f5f5f5] transition-colors"
                        title="수정"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(event.id)}
                        className="p-[6px] md:p-[8px] rounded-[6px] cursor-pointer bg-transparent border-none text-[#ccc] active:text-red-500 hover:text-red-500 active:bg-red-50 hover:bg-red-50 transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 하단: 제목 + 설명 */}
                  <div className="mt-[8px] md:mt-[6px]">
                    <p
                      className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.3px] leading-[1.4]"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {event.title}
                    </p>
                    {(event.location || event.description) && (
                      <p
                        className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px] mt-[3px] leading-[1.4] line-clamp-2"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        {event.location}
                        {event.location && event.description && " · "}
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── 인라인 수정 폼 ── */}
                <AnimatePresence>
                  {editingId === event.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-[16px] md:px-[24px] pb-[16px] md:pb-[20px] pt-[14px] border-t border-[#eee]">
                        <div className="flex flex-col gap-[10px]">
                          <input
                            type="text"
                            value={event.title}
                            onChange={(e) =>
                              handleUpdateEvent(event.id, { title: e.target.value })
                            }
                            placeholder="제목"
                            className={inputCls}
                          />
                          <div className="grid grid-cols-2 gap-[10px]">
                            <input
                              type="date"
                              value={event.date}
                              onChange={(e) =>
                                handleUpdateEvent(event.id, { date: e.target.value })
                              }
                              className={inputCls}
                            />
                            <input
                              type="time"
                              value={event.time}
                              onChange={(e) =>
                                handleUpdateEvent(event.id, { time: e.target.value })
                              }
                              className={inputCls}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                            <input
                              type="text"
                              value={event.location}
                              onChange={(e) =>
                                handleUpdateEvent(event.id, {
                                  location: e.target.value,
                                })
                              }
                              placeholder="장소"
                              className={inputCls}
                            />
                            <input
                              type="text"
                              value={event.description}
                              onChange={(e) =>
                                handleUpdateEvent(event.id, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="설명"
                              className={inputCls}
                            />
                          </div>
                          <input
                            type="url"
                            value={event.registerUrl}
                            onChange={(e) =>
                              handleUpdateEvent(event.id, {
                                registerUrl: e.target.value,
                              })
                            }
                            placeholder="참석 신청 링크"
                            className={inputCls}
                          />
                          <div className="grid grid-cols-2 gap-[10px]">
                            <select
                              value={event.category}
                              onChange={(e) =>
                                handleUpdateEvent(event.id, {
                                  category: e.target.value,
                                })
                              }
                              className={inputCls}
                            >
                              {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                showSaveMsg("수정이 저장되었습니다");
                              }}
                              className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] rounded-[8px] bg-[#4a6741] active:bg-[#3d5636] hover:bg-[#3d5636] transition-colors cursor-pointer border-none"
                            >
                              저장
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════
          삭제 확인 모달
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              className="bg-white w-full sm:w-[320px] sm:rounded-[12px] rounded-t-[16px] p-[24px] sm:p-[28px] shadow-lg"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모바일 핸들 */}
              <div className="w-[36px] h-[4px] bg-[#ddd] rounded-full mx-auto mb-[20px] sm:hidden" />
              <p
                className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[15px] text-black tracking-[-0.4px] mb-[8px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                소식 삭제
              </p>
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#767676] tracking-[-0.3px] mb-[24px] leading-[1.5]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                이 소식을 삭제하시겠습니까?
                <br />
                삭제된 소식은 복구할 수 없습니다.
              </p>
              <div className="flex gap-[8px]">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 sm:flex-none font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#767676] tracking-[-0.3px] px-[16px] py-[11px] rounded-[8px] border border-[#ddd] active:border-[#999] hover:border-[#999] transition-colors cursor-pointer bg-white"
                >
                  취소
                </button>
                <button
                  onClick={() => handleDeleteEvent(deleteConfirmId)}
                  className="flex-1 sm:flex-none font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[16px] py-[11px] rounded-[8px] bg-red-500 active:bg-red-600 hover:bg-red-600 transition-colors cursor-pointer border-none"
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

/* ── 공용 Label ── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[12px] md:text-[13px] text-[#555] tracking-[-0.3px] mb-[5px]"
      style={{ fontVariationSettings: "'wdth' 100" }}
    >
      {children}
    </label>
  );
}
