import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Settings, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { getProjects, type ProjectItem } from "./projectStore";
import { verifyPassword } from "./passwordStore";
import { getBrandImages } from "./brandStore";

const tagColors: Record<string, string> = {
  수련회: "bg-blue-100 text-blue-700",
  찬양: "bg-purple-100 text-purple-700",
  봉사: "bg-green-100 text-green-700",
  교제: "bg-amber-100 text-amber-700",
  말씀: "bg-rose-100 text-rose-700",
  예배: "bg-indigo-100 text-indigo-700",
  체육: "bg-teal-100 text-teal-700",
  기타: "bg-gray-100 text-gray-700",
};

function ProjectCard({
  project,
  index,
}: {
  project: ProjectItem;
  index: number;
}) {
  return (
    <motion.div
      className="flex flex-col md:flex-row gap-[20px] md:gap-[32px] w-full"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="w-full md:w-[400px] lg:w-[460px] shrink-0 rounded-[6px] overflow-hidden aspect-[16/10]">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-[1.05]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#f5f5f3]">
            <p
              className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#bbb] tracking-[-0.3px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              이미지 미등록
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-[12px] md:gap-[16px] flex-1 py-[4px]">
        <div className="flex items-center gap-[10px]">
          <span
            className={`inline-block px-[10px] py-[4px] rounded-full text-[11px] tracking-[-0.3px] ${tagColors[project.tag] || "bg-gray-100 text-gray-700"}`}
          >
            {project.tag}
          </span>
          <span className="font-['Instrument_Sans:Regular',sans-serif] text-[12px] text-[#999] tracking-[-0.3px]">
            {project.date}
          </span>
        </div>
        <h3
          className="font-['Noto_Sans_KR:Medium',sans-serif] text-[18px] md:text-[20px] lg:text-[22px] text-black tracking-[-0.6px] leading-[1.4]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {project.title}
        </h3>
        <div
          className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] md:text-[14px] lg:text-[15px] text-[#767676] leading-[1.8] md:leading-[2]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {project.description.split("\n").map((line, i) => (
            <span key={i} className="block" style={{ letterSpacing: "-0.6px" }}>
              {line}
            </span>
          ))}
        </div>
        {project.pressUrl && (
          <a
            href={project.pressUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[6px] font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[12px] md:text-[13px] text-[#4a6741] tracking-[-0.3px] border border-[#4a6741]/30 rounded-full px-[14px] md:px-[16px] py-[7px] md:py-[8px] hover:bg-[#4a6741] hover:text-white transition-all duration-300 no-underline mt-[4px] w-fit"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <ExternalLink size={13} />
            보도자료 보기
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const allProjects = getProjects();
  const visibleProjects = allProjects.filter((p) => p.visible);
  const years = [...new Set(visibleProjects.map((p) => p.year))].sort((a, b) => b.localeCompare(a));

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handlePasswordSubmit = () => {
    if (verifyPassword(password)) {
      setShowPasswordModal(false);
      setPassword("");
      setError("");
      navigate("/admin/projects");
    } else {
      setError("비밀번호가 올바르지 않습니다");
      setPassword("");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
                Our Ministry
              </p>
              <p className="col-start-1 row-start-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-1.4px] md:tracking-[-1.8px] lg:tracking-[-2.2px] m-0">
                사역 소개
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
          동북시찰청년연합회가 함께 해온 활동들을 소개합니다
        </motion.p>
      </div>

      {/* Projects by Year */}
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] pb-[60px] md:pb-[80px]">
        {years.map((year) => (
          <div key={year} className="mb-[50px] md:mb-[70px] last:mb-0">
            <div className="flex items-center gap-[12px] mb-[28px] md:mb-[36px]">
              <span
                className="font-['Instrument_Sans:Regular',sans-serif] text-[20px] md:text-[24px] text-black tracking-[-1px] leading-none"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {year}
              </span>
              <div className="flex-1 h-px bg-black" />
            </div>
            <div className="flex flex-col gap-[36px] md:gap-[48px]">
              {visibleProjects
                .filter((p) => p.year === year)
                .map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] py-[24px] border-t border-black">
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
              className="font-['Instrument_Sans:Regular',sans-serif] text-[11px] text-[#767676] tracking-[-0.55px] hover:text-black transition-colors"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Back to Home
            </Link>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="text-[#ccc] hover:text-[#999] active:text-[#999] transition-colors duration-300 p-[4px] cursor-pointer bg-transparent border-none"
              aria-label="Our Ministry 관리"
            >
              <Settings size={13} />
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