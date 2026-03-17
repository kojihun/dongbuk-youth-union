import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { getVerse, saveVerse, DEFAULT_VERSE, type VerseData } from "./verseStore";

export default function VerseAdminPage() {
  const navigate = useNavigate();
  const [verse, setVerse] = useState<VerseData>(() => getVerse());
  const [saveMessage, setSaveMessage] = useState("");

  const handleSave = () => {
    saveVerse(verse);
    showSaveMsg("성경구절이 저장되었습니다");
  };

  const handleReset = () => {
    setVerse({ ...DEFAULT_VERSE });
    saveVerse({ ...DEFAULT_VERSE });
    showSaveMsg("기본값으로 복원되었습니다");
  };

  const showSaveMsg = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const inputCls =
    "w-full border border-[#ddd] rounded-[8px] px-[12px] py-[10px] text-[14px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors bg-white";

  const textareaCls =
    "w-full border border-[#ddd] rounded-[8px] px-[12px] py-[10px] text-[14px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors bg-white resize-none";

  const Label = ({ children }: { children: React.ReactNode }) => (
    <p
      className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[12px] text-[#767676] tracking-[-0.3px] mb-[6px]"
      style={{ fontVariationSettings: "'wdth' 100" }}
    >
      {children}
    </p>
  );

  const enLines = verse.verseEn.split("\n");
  const alignClass = verse.align === "center" ? "text-center" : verse.align === "left" ? "text-left" : "text-right";

  const alignOptions: { value: VerseData["align"]; label: string; icon: React.ReactNode }[] = [
    {
      value: "left",
      label: "왼쪽",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3h12M2 6h8M2 9h10M2 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      value: "center",
      label: "가운데",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3h12M4 6h8M3 9h10M5 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      value: "right",
      label: "오른쪽",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3h12M6 6h8M4 9h10M8 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-[#f8f8f6] min-h-screen pb-[60px]">
      {/* Sticky Header */}
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
            성경구절 관리
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
        {/* 미리보기 */}
        <div className="bg-white rounded-[12px] border border-[#eee] mb-[20px] md:mb-[24px] overflow-hidden">
          <div className="px-[16px] md:px-[24px] py-[14px] md:py-[16px] border-b border-[#f0f0f0]">
            <p
              className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.4px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              미리보기
            </p>
          </div>
          <div className="px-[16px] md:px-[24px] py-[24px] md:py-[36px]">
            <div className={alignClass}>
              <div
                className="font-['Instrument_Sans:Regular',sans-serif] font-normal leading-[1.15] text-[20px] md:text-[28px] lg:text-[36px] text-black tracking-[-1.2px] md:tracking-[-1.6px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {enLines.map((line, i) => (
                  <p key={i} className="mb-0">{line}</p>
                ))}
                <p className="mt-[12px] md:mt-[16px] text-[16px] md:text-[22px] lg:text-[28px] tracking-[-0.8px] md:tracking-[-1.2px]">
                  {verse.referenceEn}
                </p>
              </div>
              <div className="mt-[16px] md:mt-[24px]">
                <p
                  className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[12px] md:text-[14px] text-[#767676] tracking-[-0.4px] leading-[1.6]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {verse.verseKo}&nbsp;&nbsp;{verse.referenceKo}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 편집 폼 */}
        <div className="bg-white rounded-[12px] border border-[#eee] overflow-hidden">
          <div className="px-[16px] md:px-[24px] py-[14px] md:py-[16px] border-b border-[#f0f0f0]">
            <p
              className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.4px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              구절 편집
            </p>
          </div>
          <div className="px-[16px] md:px-[24px] py-[16px] md:py-[20px]">
            <div className="flex flex-col gap-[16px]">
              {/* 정렬 옵션 */}
              <div>
                <Label>텍스트 정렬</Label>
                <div className="flex gap-[6px]">
                  {alignOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setVerse({ ...verse, align: opt.value })}
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
                  onChange={(e) => setVerse({ ...verse, verseEn: e.target.value })}
                  rows={4}
                  className={textareaCls}
                  placeholder="For where two or three gather&#10;in my name,&#10;there am I with them"
                />
              </div>
              <div>
                <Label>영문 출처</Label>
                <input
                  type="text"
                  value={verse.referenceEn}
                  onChange={(e) => setVerse({ ...verse, referenceEn: e.target.value })}
                  placeholder="예: Matthew 18:20"
                  className={inputCls}
                />
              </div>
              <div>
                <Label>한글 구절</Label>
                <textarea
                  value={verse.verseKo}
                  onChange={(e) => setVerse({ ...verse, verseKo: e.target.value })}
                  rows={2}
                  className={textareaCls}
                  placeholder="두세 사람이 내 이름으로 모인 곳에는 나도 그들 중에 있느니라"
                />
              </div>
              <div>
                <Label>한글 출처</Label>
                <input
                  type="text"
                  value={verse.referenceKo}
                  onChange={(e) => setVerse({ ...verse, referenceKo: e.target.value })}
                  placeholder="예: 마태복음 18장 20절"
                  className={inputCls}
                />
              </div>
              <div className="flex gap-[8px] mt-[8px]">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#767676] tracking-[-0.3px] px-[16px] py-[10px] rounded-[8px] border border-[#ddd] hover:border-[#999] transition-colors cursor-pointer bg-white"
                >
                  <RotateCcw size={13} />
                  기본값 복원
                </button>
                <button
                  onClick={handleSave}
                  className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[20px] py-[10px] rounded-[8px] bg-[#4a6741] hover:bg-[#3d5636] transition-colors cursor-pointer border-none"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}