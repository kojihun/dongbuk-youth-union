import { getProjects } from "../app/components/projectStore";
import { getHomeData } from "../app/components/homeStore";
import { getDonationAccount } from "../app/components/donationStore";
import { getBrandImages } from "../app/components/brandStore";
import { getEvents, type EventItem } from "../app/components/eventStore";
import { getVerse } from "../app/components/verseStore";
import { verifyPassword } from "../app/components/passwordStore";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Settings } from "lucide-react";
import svgPaths from "./svg-m4b78paeab";

/** 프로젝트 스토어에서 최신순 이미지를 가져오는 헬퍼 */
function getSlideImages(): string[] {
  const projects = getProjects();
  const images = projects
    .filter((p) => p.visible && p.image)
    .map((p) => p.image);
  return images;
}

function LeftLogo() {
  const brand = getBrandImages();
  return (
    <motion.div
      className="h-[100px] w-[100px] md:h-[130px] md:w-[130px] lg:h-[149.864px] lg:w-[149.866px] relative shrink-0 overflow-visible"
      data-name="Left Logo"
      initial={{ x: -80, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {brand.logo ? (
        <img
          alt="동북시찰청년연합회 로고"
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={brand.logo}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f5f3] rounded-[6px]">
          <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#bbb] tracking-[-0.3px]" style={{ fontVariationSettings: "'wdth' 100" }}>로고</p>
        </div>
      )}
    </motion.div>
  );
}

function LogoContain() {
  const { navLinks } = getHomeData();
  const visibleLinks = navLinks.filter((l) => l.visible);
  const linkCls =
    "font-['Instrument_Sans:Regular',sans-serif] font-normal text-[10px] md:text-[11px] lg:text-[13px] text-[#999] tracking-[-0.4px] hover:text-black transition-colors no-underline whitespace-nowrap";

  return (
    <div
      className="flex flex-col md:flex-row gap-[6px] md:gap-[8px] items-start relative w-full overflow-visible"
      data-name="Logo contain"
    >
      <div className="flex gap-[8px] items-start">
        <LeftLogo />
        <div
          className="flex flex-col font-['Instrument_Sans:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-end leading-[0] relative text-[#767676] text-[10px] md:text-[11px] tracking-[-0.33px] h-[100px] md:h-[126px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <p className="leading-[1.4] whitespace-nowrap">
            동북시찰청년연합회 대한예수교장로회(통합)
          </p>
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex items-end md:h-[126px] pr-[0px] md:pr-[12px] lg:pr-[16px] self-end">
        <nav className="flex items-center gap-[12px] md:gap-[28px] lg:gap-[36px] pb-[1px]">
          {visibleLinks.map((link) =>
            link.isExternal ? (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkCls}
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.id}
                to={link.url}
                className={linkCls}
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {link.label}
              </Link>
            )
          )}
          <Link
            to="/ci"
            className={linkCls}
            style={{ fontVariationSettings: "'wdth' 100" }}
            title="CI 매뉴얼"
          >
            *
          </Link>
        </nav>
      </div>
    </div>
  );
}

function NavContain() {
  return (
    <div
      className="bg-white flex flex-col items-start py-[10px] relative w-full"
      data-name="Nav contain"
    >
      <LogoContain />
    </div>
  );
}

function NavSection() {
  return (
    <div
      className="bg-white flex flex-col items-start pt-[15px] px-[15px] md:px-[24px] relative w-full max-w-[1055px]"
      data-name="Nav section"
    >
      <NavContain />
    </div>
  );
}

function Frame() {
  const verse = getVerse();
  const enLines = verse.verseEn.split("\n");
  const alignClass = verse.align === "center" ? "text-center" : verse.align === "left" ? "text-left" : "text-right";

  return (
    <div className={`relative ${alignClass} w-full py-[30px] md:py-[40px] lg:py-[50px]`}>
      <motion.div
        className="flex flex-col font-['Instrument_Sans:Regular',sans-serif] font-normal justify-center leading-[1.15] text-[24px] md:text-[32px] lg:text-[44px] text-black tracking-[-1.2px] md:tracking-[-1.6px] lg:tracking-[-2.2px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {enLines.map((line, i) => (
          <p key={i} className="mb-0">{line}</p>
        ))}
        <p className="mt-[16px] md:mt-[20px] lg:mt-[28px] text-[20px] md:text-[26px] lg:text-[36px] tracking-[-1px] md:tracking-[-1.3px] lg:tracking-[-1.8px]">
          {verse.referenceEn}
        </p>
      </motion.div>
      <motion.div
        className={`mt-[24px] md:mt-[30px] lg:mt-[40px] ${alignClass}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <p
          className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] md:text-[14px] lg:text-[16px] text-[#767676] tracking-[-0.4px] leading-[1.6]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {verse.verseKo}
          <br className="md:hidden" />
          <span className="hidden md:inline">&nbsp;&nbsp;</span>
          {verse.referenceKo}
        </p>
      </motion.div>
    </div>
  );
}

function IntroSection() {
  return (
    <div
      className="flex flex-col items-start px-[15px] md:px-[24px] pt-[15px] relative w-full max-w-[1033px]"
      data-name="Intro section"
    >
      <div
        className="flex flex-col items-start pb-[24px] md:pb-[30px] lg:pb-[36px] pt-[10px] relative w-full"
        data-name="Intro content"
      >
        <div
          aria-hidden="true"
          className="absolute border-black border-solid border-t inset-0 pointer-events-none"
        />
        <Frame />
      </div>
    </div>
  );
}

function OurWorkContent() {
  const { intro } = getHomeData();
  const introAlign = intro.align || "left";
  return (
    <div
      className="flex items-center relative w-full py-[40px] md:py-[56px] lg:py-[72px]"
      data-name="Our work content"
    >
      <div
        aria-hidden="true"
        className="absolute border-b border-black border-solid border-t inset-0 pointer-events-none"
      />
      <div className={`flex flex-col ${introAlign === "center" ? "items-center" : introAlign === "right" ? "items-end" : "items-start"} justify-center relative w-full px-[20px] md:px-[40px] lg:px-[60px]`}>
        <motion.p
          className={`font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[20px] md:text-[23px] lg:text-[28px] text-black tracking-[-0.6px] leading-[1.4] mb-[36px] md:mb-[46px] lg:mb-[56px] w-full ${introAlign === "center" ? "text-center" : introAlign === "right" ? "text-right" : "text-left"}`}
          style={{ fontVariationSettings: "'wdth' 100" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {intro.title}
        </motion.p>
        <div className={`flex flex-col ${introAlign === "center" ? "items-center text-center" : introAlign === "right" ? "items-end text-right" : "items-start text-left"} w-full gap-[28px] md:gap-[35px] lg:gap-[42px]`}>
          {intro.paragraphs.map((para, i) => (
            <motion.p
              key={i}
              className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] md:text-[14px] lg:text-[17px] text-[#767676] tracking-[-0.3px] leading-[2] md:leading-[2.2]"
              style={{ fontVariationSettings: "'wdth' 100" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.1 * (i + 1), ease: [0.25, 0.1, 0.25, 1] }}
            >
              {para.split("\n").map((line, li) => (
                <span key={li}>
                  {li > 0 && <br />}
                  {line}
                </span>
              ))}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
}

function OurWorkSection() {
  return (
    <div
      className="flex flex-col items-start max-w-[1920px] px-[15px] md:px-[24px] py-[10px] md:py-[14px] relative w-full"
      data-name="Our work section"
    >
      <OurWorkContent />
    </div>
  );
}

function OurWorkContent1() {
  return (
    <motion.div
      className="relative w-full"
      data-name="Our work content"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <p
        className="font-['Instrument_Sans:Regular',sans-serif] font-normal leading-none text-[20px] md:text-[24px] text-black tracking-[-1.2px] whitespace-nowrap"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        Our Ministry
      </p>
    </motion.div>
  );
}

function ImageStrip() {
  const slideImages = getSlideImages();

  if (slideImages.length === 0) {
    return (
      <div className="w-full overflow-hidden" data-name="Image strip">
        <div className="flex items-center justify-center py-[40px] md:py-[60px]">
          <p
            className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] md:text-[14px] text-[#bbb] tracking-[-0.3px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            관리자 페이지에서 활동 이미지를 등록해주세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden"
      data-name="Image strip"
    >
      <motion.div
        className="flex gap-[16px]"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {[...slideImages, ...slideImages].map((src, i) => (
          <div
            key={i}
            className="shrink-0 w-[260px] h-[180px] md:w-[340px] md:h-[230px] lg:w-[420px] lg:h-[280px] rounded-[6px] overflow-hidden"
          >
            <img
              src={src}
              alt={`Our Ministry ${(i % slideImages.length) + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function TextLink4() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        to="/projects"
        className="flex font-['Instrument_Sans:Medium',sans-serif] font-medium gap-[3px] items-center leading-[1.1] relative shrink-0 text-[#767676] text-[16px] md:text-[20px] tracking-[-0.6px] whitespace-nowrap hover:text-black transition-colors no-underline"
        data-name="Text link"
      >
        <p
          className="relative shrink-0"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Explore
        </p>
        <p
          className="relative shrink-0"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          →
        </p>
      </Link>
    </motion.div>
  );
}

function NavHeader() {
  return (
    <div
      className="max-w-[1920px] relative w-full"
      data-name="Nav header"
    >
      <div className="flex flex-col gap-[20px] md:gap-[24px] items-end max-w-[inherit] pb-[20px] md:pb-[30px] px-[15px] md:px-0 relative w-full">
        <ImageStrip />
        <TextLink4 />
      </div>
    </div>
  );
}

function OurWorkSection1() {
  return (
    <div
      className="max-w-[1920px] relative w-full"
      data-name="Our work section"
    >
      <div className="flex flex-col gap-[24px] md:gap-[32px] items-start max-w-[inherit] px-[15px] md:px-[24px] pt-[4px] md:pt-[6px] pb-[20px] relative w-full">
        <div className="border-t border-black w-full pt-[26px] md:pt-[34px]" />
        <OurWorkContent1 />
        <NavHeader />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 다음 모임/행사 안내
// ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const day = d.getDate();
    const weekday = d.toLocaleString("ko-KR", { weekday: "short" });
    return `${month} ${day} (${weekday})`;
  } catch {
    return dateStr;
  }
}

function EventCard({ event, index }: { event: EventItem; index: number }) {
  return (
    <motion.div
      className="flex flex-col md:flex-row gap-[16px] md:gap-[32px] items-start md:items-center relative w-full py-[24px] md:py-[28px]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="shrink-0 w-[100px] md:w-[120px]">
        <p
          className="font-['Instrument_Sans:Medium',sans-serif] font-medium text-[14px] md:text-[16px] text-black tracking-[-0.5px] leading-[1.3]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {formatDate(event.date)}
        </p>
        <p
          className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[12px] md:text-[13px] text-[#999] tracking-[-0.3px] mt-[4px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {event.time}
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[15px] md:text-[17px] text-black tracking-[-0.4px] leading-[1.4]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {event.title}
        </p>
        <p
          className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] md:text-[14px] text-[#767676] tracking-[-0.3px] mt-[4px] leading-[1.5]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {event.location && <>장소: {event.location}</>}
        </p>
        {event.description && (
          <p
            className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] md:text-[14px] text-[#767676] tracking-[-0.3px] mt-[2px] leading-[1.5]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {event.description}
          </p>
        )}
      </div>
      {event.registerUrl && (
        <a
          href={event.registerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-['Instrument_Sans:Medium',sans-serif] font-medium text-[11px] md:text-[12px] text-[#767676] tracking-[-0.3px] border border-[#ddd] rounded-full px-[16px] md:px-[20px] py-[7px] md:py-[8px] hover:border-black hover:text-black transition-all duration-300 no-underline whitespace-nowrap"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          참석 신청 →
        </a>
      )}
    </motion.div>
  );
}

function UpcomingEventsSection() {
  const visibleEvents = getEvents().filter((e) => e.visible);

  return (
    <div className="flex flex-col items-start px-[15px] md:px-[24px] py-[10px] md:py-[14px] relative w-full max-w-[1035px]">
      <div className="relative w-full">
        <div className="pt-[30px] md:pt-[40px] pb-[20px] md:pb-[30px] w-full">
          <motion.p
            className="font-['Instrument_Sans:Regular',sans-serif] font-normal leading-none text-[20px] md:text-[24px] text-black tracking-[-1.2px] whitespace-nowrap mb-[20px] md:mb-[28px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Upcoming
          </motion.p>

          {visibleEvents.length === 0 ? (
            <motion.div
              className="py-[40px] flex justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5 }}
            >
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] md:text-[14px] text-[#999] tracking-[-0.3px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                예정된 모임이 없습니다
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col divide-y divide-[#eee]">
              {visibleEvents.map((event, i) => (
                <EventCard key={`${event.date}-${event.title}`} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Main() {
  return (
    <div
      className="flex flex-col gap-[6px] md:gap-[10px] lg:gap-[14px] items-start relative w-full max-w-[1035px]"
      data-name="Main"
    >
      <IntroSection />
      <OurWorkSection />
      <UpcomingEventsSection />
      <OurWorkSection1 />
    </div>
  );
}

function Logo() {
  const brand = getBrandImages();
  return (
    <div
      className="inline-grid place-items-start relative shrink-0"
      data-name="Logo"
    >
      <div className="h-[60px] w-[59.4px] md:h-[80px] md:w-[79.2px] lg:h-[100px] lg:w-[99.029px] relative">
        {brand.emblem ? (
          <img
            alt="company logo"
            className="absolute block max-w-none size-full"
            src={brand.emblem}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f5f3] rounded-full">
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[9px] text-[#bbb] tracking-[-0.3px]" style={{ fontVariationSettings: "'wdth' 100" }}>엠블럼</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactContain() {
  const donationAccount = getDonationAccount();
  
  return (
    <div
      className="bg-white flex flex-col gap-[10px] items-center md:items-start relative shrink-0 font-['Instrument_Sans:Regular',sans-serif] font-normal text-[#767676] text-[11px] tracking-[-0.55px]"
      data-name="Contact contain"
    >
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSemrPx-mGpGJSTiK5GR0aIUe1QW83Fs_mZC_mZUxM9cOZMrow/viewform?usp=publish-editor"
        target="_blank"
        rel="noopener noreferrer"
        className="leading-none hover:text-black transition-colors no-underline mb-[10px] md:mb-[20px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        CONTACT
      </a>
      <p
        className="font-['Noto_Sans_KR:Regular',sans-serif] leading-none tracking-[-0.3px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        후원계좌
      </p>
      <p
        className="font-['Noto_Sans_KR:Regular',sans-serif] leading-[1.4] tracking-[-0.3px] text-center md:text-left"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        {donationAccount.text}
      </p>
    </div>
  );
}

function SocialLinks1() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePasswordSubmit = () => {
    if (verifyPassword(password)) {
      setShowPasswordModal(false);
      setPassword("");
      setError("");
      navigate("/admin/home");
    } else {
      setError("비밀번호가 올바르지 않습니다");
      setPassword("");
    }
  };

  return (
    <div
      className="flex flex-col gap-[10px] items-center md:items-start relative w-full"
      data-name="Social links"
    >
      <a
        className="block leading-[0] relative"
        href="https://www.instagram.com/jeju.youth_dongbook?igsh=ZTA2OHBwczJocWk2"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="cursor-pointer leading-none">Instagram</p>
      </a>
      <p
        className="leading-none relative"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        Band
      </p>
      <button
        onClick={() => setShowPasswordModal(true)}
        className="text-[#ccc] hover:text-[#999] active:text-[#999] transition-colors duration-300 p-[4px] cursor-pointer bg-transparent border-none mt-[2px]"
        aria-label="대문 페이지 관리"
      >
        <Settings size={13} />
      </button>

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

function SocialContain1() {
  return (
    <div
      className="flex flex-col font-['Instrument_Sans:Regular',sans-serif] font-normal gap-[20px] md:gap-[30px] items-center md:items-start relative text-[#767676] text-[11px] tracking-[-0.55px]"
      data-name="Social contain"
    >
      <p
        className="leading-none relative"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        SOCIAL
      </p>
      <SocialLinks1 />
    </div>
  );
}

function FooterContent() {
  return (
    <motion.div
      className="flex flex-col md:flex-row gap-[30px] md:gap-[40px] items-center md:items-start relative w-full"
      data-name="Footer content"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="hidden md:flex items-end gap-[8px] shrink-0">
        <Logo />
        <div
          className="flex flex-col font-['Instrument_Sans:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal justify-end leading-[0] text-[#767676] text-[10px] md:text-[11px] tracking-[-0.33px] pb-[4px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <p className="leading-[1.1]">
            동북시찰청년연합회 대한예수교장로회(통합)
          </p>
        </div>
      </div>
      <div className="hidden md:block flex-1" />
      <div className="flex gap-[40px] md:gap-[60px] items-start">
        <ContactContain />
        <SocialContain1 />
      </div>
    </motion.div>
  );
}

function FooterSection() {
  return (
    <div
      className="flex flex-col items-center pb-[15px] pt-[16px] md:pt-[20px] px-[15px] md:px-[24px] relative w-full max-w-[1035px]"
      data-name="Footer section"
    >
      <FooterContent />
    </div>
  );
}

function FFLogo() {
  return (
    <div
      className="h-[16.28px] relative shrink-0 w-[37.912px]"
      data-name="F&F logo"
    >
      <svg
        className="absolute block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 37.9118 16.28"
      >
        <g id="F&F logo">
          <path
            d={svgPaths.p31247780}
            fill="var(--fill-0, black)"
            id="Vector"
          />
          <path
            d={svgPaths.p1e4f2a00}
            fill="var(--fill-0, black)"
            id="Vector_2"
          />
          <path
            d={svgPaths.p33d04b00}
            fill="var(--fill-0, black)"
            id="Vector_3"
          />
        </g>
      </svg>
    </div>
  );
}

function LogotypeContain() {
  return (
    <div
      className="flex-[1_0_0] h-full min-h-px min-w-px relative"
      data-name="Logotype contain"
    >
      <div
        aria-hidden="true"
        className="absolute border-b border-black border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center size-full">
        <div className="flex items-center pb-[10px] pr-[20px] pt-[12px] relative size-full">
          <FFLogo />
        </div>
      </div>
    </div>
  );
}

function TextLinks() {
  return (
    <div
      className="bg-white flex-[1_0_0] h-full min-h-px min-w-px relative"
      data-name="Text links"
    >
      <div
        aria-hidden="true"
        className="absolute border-b border-black border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-end justify-end size-full">
        <div className="flex gap-[30px] md:gap-[50px] items-end justify-end pb-[10px] pl-[20px] pt-[12px] relative size-full">
          <div
            className="flex items-center justify-center pb-[4px] relative shrink-0"
            data-name="Nav Link"
          >
            <p
              className="font-['Instrument_Sans:Regular',sans-serif] font-normal leading-none relative shrink-0 text-[11px] text-white tracking-[-0.55px] whitespace-nowrap"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Work
            </p>
          </div>
          <div
            className="flex items-center justify-center pb-[4px] relative shrink-0"
            data-name="Nav Link"
          >
            <p
              className="font-['Instrument_Sans:Regular',sans-serif] font-normal leading-none relative shrink-0 text-[11px] text-white tracking-[-0.55px] whitespace-nowrap"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              About
            </p>
          </div>
          <a
            className="cursor-pointer flex items-center justify-center pb-[4px] relative shrink-0"
            data-name="Nav Link"
            href="https://figma.com/sites"
          >
            <p
              className="font-['Instrument_Sans:Regular',sans-serif] font-normal leading-none relative shrink-0 text-[11px] text-left text-white tracking-[-0.55px] whitespace-nowrap"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Contact
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}

function LinksContain() {
  return (
    <div
      className="flex flex-[1_0_0] h-full items-start justify-end max-w-[615px] min-h-px min-w-px relative"
      data-name="Links contain"
    >
      <TextLinks />
    </div>
  );
}

function NavContain1() {
  return (
    <div
      className="bg-white h-[10px] relative w-full"
      data-name="Nav contain"
    >
      <div
        aria-hidden="true"
        className="absolute border-b border-black border-solid inset-0 pointer-events-none"
      />
    </div>
  );
}

function NavSection1() {
  return (
    <div
      className="bg-white flex flex-col items-start pt-[15px] px-[15px] md:px-[24px] relative w-full max-w-[1033px]"
      data-name="Nav section"
    >
      <NavContain1 />
    </div>
  );
}

export default function Desktop() {
  return (
    <div
      className="bg-white flex flex-col items-center relative w-full min-h-screen"
      data-name="Desktop"
    >
      <NavSection />
      <Main />
      <FooterSection />
      <NavSection1 />
    </div>
  );
}