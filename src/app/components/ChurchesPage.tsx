import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, X, Settings } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { getChurches, setDefaultChurches, type ChurchItem } from "./churchStore";
import { verifyPassword } from "./passwordStore";
import { getBrandImages } from "./brandStore";

const defaultChurchImages: Record<number, string> = {};

const churches = [
  {
    id: 1,
    name: "구좌제일교회",
    nameEn: "Gujwa Jeil Church",
    address: "제주 제주시 구좌읍 평대13길 48",
    image: "",
  },
  {
    id: 2,
    name: "김녕교회",
    nameEn: "Gimnyeong Church",
    address: "제주 제주시 구좌읍 김녕로14길 41",
    image: "",
  },
  {
    id: 3,
    name: "복된교회",
    nameEn: "Bokdoen Church",
    address: "제주 제주시 이도이동 동광로6길 29",
    image: "",
  },
  {
    id: 4,
    name: "봉개교회",
    nameEn: "Bonggae Church",
    address: "제주 제주시 번영로 561-8",
    image: "",
  },
  {
    id: 5,
    name: "삼양교회",
    nameEn: "Samyang Church",
    address: "제주 제주시 삼양이동 지석15길 10",
    image: "",
  },
  {
    id: 6,
    name: "송당교회",
    nameEn: "Songdang Church",
    address: "제주 제주시 구좌읍 중산간동로 2222-2",
    image: "",
  },
  {
    id: 7,
    name: "신촌교회",
    nameEn: "Sinchon Church",
    address: "제주 제주시 조천읍 신촌서5길 72-1",
    image: "",
  },
  {
    id: 8,
    name: "제주영락교회",
    nameEn: "Jeju Youngnak Church",
    address: "제주 제주시 동광로23길 15",
    image: "",
  },
  {
    id: 9,
    name: "영주교회",
    nameEn: "Youngju Church",
    address: "제주 제주시 동문로 153",
    image: "",
  },
  {
    id: 10,
    name: "제주산성교회",
    nameEn: "Jeju Sanseong Church",
    address: "제주 제주시 동문로18길 25",
    image: "",
  },
  {
    id: 11,
    name: "제주성산교회",
    nameEn: "Jeju Seongsan Church",
    address: "제주 제주시 새바위길 60-33",
    image: "",
  },
  {
    id: 12,
    name: "제주충신교회",
    nameEn: "Jeju Chungsin Church",
    address: "제주 제주시 연화로2길 17-6",
    image: "",
  },
  {
    id: 13,
    name: "제주화북교회",
    nameEn: "Jeju Hwabuk Church",
    address: "제주 제주시 진남로6길 31",
    image: "",
  },
  {
    id: 14,
    name: "조천교회",
    nameEn: "Jocheon Church",
    address: "제주 제주시 조천읍 조와로 10",
    image: "",
  },
  {
    id: 15,
    name: "함덕교회",
    nameEn: "Hamdeok Church",
    address: "제주 제주시 조천읍 신북로 478-1",
    image: "",
  },
  {
    id: 16,
    name: "행원교회",
    nameEn: "Haengwon Church",
    address: "제주특별자치도 제주시 구좌읍 행원로 44",
    image: "",
  },
];

// 기본 교회 데이터를 store에 등록
setDefaultChurches(
  churches.map((c) => ({
    ...c,
    visible: true,
  }))
);

function ChurchCard({
  church,
  index,
  onImageClick,
}: {
  church: ChurchItem;
  index: number;
  onImageClick: (church: ChurchItem) => void;
}) {
  return (
    <motion.div
      className="flex flex-col gap-[16px] w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
    >
      <div
        className="w-full aspect-[4/3] rounded-[6px] overflow-hidden cursor-pointer group"
        onClick={() => onImageClick(church)}
      >
        {church.image ? (
          <motion.img
            src={church.image}
            alt={church.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            style={{
              ...(church.id === 1
                ? { filter: "saturate(0.65) brightness(1.05) contrast(0.95)" }
                : church.id === 7
                  ? { filter: "saturate(1.2) brightness(1.05) contrast(1.0)" }
                  : church.id === 15
                    ? { filter: "saturate(1.2) brightness(1.05) contrast(1.0)" }
                    : {}),
            }}
            whileHover={{
              filter:
                church.id === 1
                  ? "saturate(0.8) brightness(1.08) contrast(0.98)"
                  : church.id === 7
                    ? "saturate(1.3) brightness(1.08) contrast(1.0)"
                    : church.id === 15
                      ? "saturate(1.3) brightness(1.08) contrast(1.0)"
                      : "brightness(1.05)",
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#f5f5f3] group-hover:bg-[#eeeeec] transition-colors">
            <p
              className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#bbb] tracking-[-0.3px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {church.name}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-[4px] sm:gap-[8px]">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-[2px] sm:gap-[8px]">
          <h3
            className="font-['Noto_Sans_KR:Medium',sans-serif] text-[14px] sm:text-[16px] md:text-[18px] text-black tracking-[-0.5px] leading-[1.4]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {church.name}
          </h3>
          <span
            className="font-['Instrument_Sans:Regular',sans-serif] text-[10px] sm:text-[11px] md:text-[12px] text-[#999] tracking-[-0.3px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {church.nameEn}
          </span>
        </div>
        <p
          className="font-['Noto_Sans_KR:Regular',sans-serif] text-[11px] sm:text-[12px] md:text-[13px] text-[#999] tracking-[-0.3px] leading-[1.6]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {church.address}
        </p>
      </div>
    </motion.div>
  );
}

function Lightbox({
  church,
  onClose,
}: {
  church: ChurchItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-[16px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-[900px] w-full"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-[44px] right-0 text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-[4px]"
        >
          <X size={24} />
        </button>
        <div className="rounded-[8px] overflow-hidden">
          <img
            src={church.image}
            alt={church.name}
            className="w-full h-auto max-h-[80vh] object-contain"
            style={
              church.id === 1
                ? {
                    filter:
                      "saturate(0.65) brightness(1.05) contrast(0.95)",
                  }
                : church.id === 7
                  ? {
                      filter:
                        "saturate(1.2) brightness(1.05) contrast(1.0)",
                    }
                  : church.id === 15
                    ? {
                        filter:
                          "saturate(1.2) brightness(1.05) contrast(1.0)",
                      }
                    : undefined
            }
          />
        </div>
        <div className="mt-[16px] text-center">
          <p
            className="font-['Noto_Sans_KR:Medium',sans-serif] text-[16px] md:text-[18px] tracking-[-0.5px] leading-[1.4]"
            style={{ fontVariationSettings: "'wdth' 100", color: "#ffffff" }}
          >
            {church.name}
          </p>
          <p
            className="font-['Instrument_Sans:Regular',sans-serif] text-[12px] md:text-[13px] tracking-[-0.3px] mt-[4px]"
            style={{ fontVariationSettings: "'wdth' 100", color: "rgba(255,255,255,0.6)" }}
          >
            {church.nameEn}
          </p>
          <p
            className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] md:text-[13px] tracking-[-0.3px] mt-[6px] leading-[1.6]"
            style={{ fontVariationSettings: "'wdth' 100", color: "rgba(255,255,255,0.5)" }}
          >
            {church.address}
          </p>
          {(church.pastor || church.youthLeader || church.phone) && (
            <div className="mt-[10px] flex flex-col items-center gap-[3px]">
              {church.pastor && (
                <p
                  className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] md:text-[13px] tracking-[-0.3px] leading-[1.6]"
                  style={{ fontVariationSettings: "'wdth' 100", color: "rgba(255,255,255,0.6)" }}
                >
                  담당 : {church.pastor}
                </p>
              )}
              {church.youthLeader && (
                <p
                  className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] md:text-[13px] tracking-[-0.3px] leading-[1.6]"
                  style={{ fontVariationSettings: "'wdth' 100", color: "rgba(255,255,255,0.6)" }}
                >
                  청년부회장 : {church.youthLeader}
                </p>
              )}
              {church.phone && (
                <a
                  href={`tel:${church.phone.replace(/[^0-9+]/g, "")}`}
                  className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] md:text-[13px] tracking-[-0.3px] leading-[1.6] no-underline hover:opacity-80 transition-opacity"
                  style={{ fontVariationSettings: "'wdth' 100", color: "rgba(255,255,255,0.6)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  ☎ {church.phone}
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ChurchesPage() {
  const [selectedChurch, setSelectedChurch] = useState<ChurchItem | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Store에서 visible한 교회만 표시
  const visibleChurches = getChurches().filter((c) => c.visible);

  const handleImageClick = useCallback((church: ChurchItem) => {
    setSelectedChurch(church);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedChurch(null);
  }, []);

  const handlePasswordSubmit = () => {
    if (verifyPassword(password)) {
      setShowPasswordModal(false);
      setPassword("");
      setError("");
      navigate("/admin/churches");
    } else {
      setError("비밀번호가 올바르지 않습니다");
      setPassword("");
    }
  };

  return (
    <div className="bg-white flex flex-col items-center relative w-full min-h-screen">
      {/* Header */}
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] pt-[24px] md:pt-[32px]">
        <div className="flex items-center gap-[12px] pb-[20px] md:pb-[28px] border-b border-black">
          <Link
            to="/"
            className="flex items-center gap-[6px] text-[#767676] hover:text-black transition-colors"
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

      {/* Title Section */}
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] pt-[16px] md:pt-[24px] lg:pt-[32px] pb-[30px] md:pb-[40px]">
        <div className="flex items-end gap-[12px] md:gap-[16px]">
          <div className="h-[40px] w-[40px] md:h-[50px] md:w-[50px] shrink-0 rounded-full overflow-hidden">
            {getBrandImages().emblem ? (
              <img
                src={getBrandImages().emblem}
                alt="logo"
                className="w-full h-full object-cover"
              />
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
              <p className="col-start-1 row-start-1 group-hover:opacity-0 transition-opacity duration-300 m-0">
                Affiliated Church
              </p>
              <p className="col-start-1 row-start-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-1.4px] md:tracking-[-1.8px] lg:tracking-[-2.2px] m-0">
                소속교회
              </p>
            </motion.div>
          </div>
        </div>
        <motion.p
          className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] md:text-[14px] lg:text-[16px] text-[#767676] tracking-[-0.3px] leading-[1.8] mt-[20px] md:mt-[28px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          동북시찰청년연합회 소속 교회를 소개합니다
        </motion.p>
      </div>

      {/* Church Grid */}
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] pb-[60px] md:pb-[80px]">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-[16px] gap-y-[28px] sm:gap-x-[24px] sm:gap-y-[32px] md:gap-[36px] lg:gap-[40px]">
          {visibleChurches.map((church, i) => (
            <ChurchCard key={church.id} church={church} index={i} onImageClick={handleImageClick} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedChurch && (
          <Lightbox church={selectedChurch} onClose={handleClose} />
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] py-[24px] border-t border-black">
        <div className="flex items-center justify-between">
          <p
            className="font-['Noto_Sans_KR:Regular',sans-serif] text-[10px] md:text-[11px] text-[#767676] tracking-[-0.33px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            동북시찰청년연합회 대한예수교장로회(통합)
          </p>
          <div className="flex items-center gap-[8px]">
            <Link
              to="/"
              className="font-['Instrument_Sans:Regular',sans-serif] text-[11px] text-[#767676] tracking-[-0.55px] hover:text-black transition-colors"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Back to Home
            </Link>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="text-[#ccc] hover:text-[#999] active:text-[#999] transition-colors duration-300 p-[6px] cursor-pointer bg-transparent border-none"
              aria-label="관리자 페이지"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 비밀번호 모달 */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => { setShowPasswordModal(false); setPassword(""); setError(""); }}
          >
            <motion.div
              className="bg-white w-full sm:w-[320px] sm:rounded-[12px] rounded-t-[16px] p-[24px] sm:p-[32px] shadow-lg"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 모바일 핸들 */}
              <div className="w-[36px] h-[4px] bg-[#ddd] rounded-full mx-auto mb-[20px] sm:hidden" />
              <p
                className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[16px] text-black tracking-[-0.4px] mb-[8px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                관리자 인증
              </p>
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#999] tracking-[-0.3px] mb-[20px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                비밀번호를 입력해주세요
              </p>
              <input
                type="password"
                inputMode="numeric"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handlePasswordSubmit(); }}
                placeholder="비밀번호"
                autoFocus
                className="w-full border border-[#ddd] rounded-[8px] px-[14px] py-[12px] text-[16px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors"
              />
              {error && (
                <p
                  className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-red-500 tracking-[-0.3px] mt-[8px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {error}
                </p>
              )}
              <div className="flex gap-[8px] mt-[20px]">
                <button
                  onClick={() => { setShowPasswordModal(false); setPassword(""); setError(""); }}
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