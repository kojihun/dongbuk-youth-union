import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Send, CheckCircle, Lock, Eye, EyeOff, X, Settings } from "lucide-react";
import { useState } from "react";
import { getBrandImages } from "./brandStore";
import { getContacts, addContact, type Submission } from "./contactStore";
import { verifyPassword } from "./passwordStore";

const categories = [
  "연합 예배",
  "수련회 / 캠프",
  "봉사 활동",
  "체육 대회",
  "찬양 집회",
  "세미나 / 강연",
  "친교 행사",
  "신규가입",
  "기타",
];


export default function ContactPage() {
  const [name, setName] = useState("");
  const [church, setChurch] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>(getContacts());

  // Password modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalPassword, setModalPassword] = useState("");
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<Set<number>>(new Set());

  // Admin routing state
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleAdminPasswordSubmit = () => {
    if (verifyPassword(adminPassword)) {
      setShowAdminPasswordModal(false);
      setAdminPassword("");
      setAdminError("");
      navigate("/admin/contact");
    } else {
      setAdminError("비밀번호가 올바르지 않습니다");
      setAdminPassword("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !password.trim()) return;

    const newSubmission: Submission = {
      id: Date.now(),
      name: name || "익명",
      church: church || "미지정",
      category: category || "기타",
      message,
      password,
      date: new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    addContact(newSubmission);
    setSubmissions(getContacts());
    setName("");
    setChurch("");
    setCategory("");
    setMessage("");
    setPassword("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleCardClick = (id: number) => {
    if (unlockedIds.has(id)) return;
    setSelectedId(id);
    setModalPassword("");
    setPasswordError(false);
    setShowModalPassword(false);
    setModalOpen(true);
  };

  const handleUnlock = () => {
    const item = submissions.find((s) => s.id === selectedId);
    if (!item) return;

    if (modalPassword === item.password || modalPassword === "동북시찰청년연합회") {
      setUnlockedIds((prev) => new Set(prev).add(item.id));
      setModalOpen(false);
      setModalPassword("");
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUnlock();
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
                Contact
              </p>
              <p className="col-start-1 row-start-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-1.4px] md:tracking-[-1.8px] lg:tracking-[-2.2px] m-0">
                문의
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
          동북시찰청년연합회가 운영했으면 하는 활동이나 의견을 자유롭게 남겨주세요
        </motion.p>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] pb-[40px] md:pb-[60px]">
        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-[24px] md:gap-[28px] w-full max-w-[640px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Name & Church Row */}
          <div className="flex flex-col md:flex-row gap-[16px] md:gap-[20px]">
            <div className="flex flex-col gap-[8px] flex-1">
              <label
                className="font-['Instrument_Sans:Regular',sans-serif] text-[11px] text-[#999] tracking-[-0.4px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                이름 (선택)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요"
                className="border-b border-[#ddd] pb-[8px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black tracking-[-0.3px] outline-none focus:border-black transition-colors bg-transparent placeholder:text-[#ccc]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              />
            </div>
            <div className="flex flex-col gap-[8px] flex-1">
              <label
                className="font-['Instrument_Sans:Regular',sans-serif] text-[11px] text-[#999] tracking-[-0.4px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                소속교회 (선택)
              </label>
              <input
                type="text"
                value={church}
                onChange={(e) => setChurch(e.target.value)}
                placeholder="소속교회를 입력해주세요"
                className="border-b border-[#ddd] pb-[8px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black tracking-[-0.3px] outline-none focus:border-black transition-colors bg-transparent placeholder:text-[#ccc]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-[10px]">
            <label
              className="font-['Instrument_Sans:Regular',sans-serif] text-[11px] text-[#999] tracking-[-0.4px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              카테고리 (선택)
            </label>
            <div className="flex flex-wrap gap-[8px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(category === cat ? "" : cat)}
                  className={`px-[14px] py-[7px] rounded-full border text-[12px] tracking-[-0.3px] transition-all font-['Noto_Sans_KR:Regular',sans-serif] cursor-pointer ${
                    category === cat
                      ? "border-black bg-black text-white"
                      : "border-[#ddd] bg-white text-[#767676] hover:border-[#999]"
                  }`}
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-[8px]">
            <label
              className="font-['Instrument_Sans:Regular',sans-serif] text-[11px] text-[#999] tracking-[-0.4px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              의견 *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="동북시찰청년연합회가 운영했으면 하는 활동이나 의견을 작성해주세요"
              rows={5}
              required
              className="border border-[#ddd] rounded-[6px] p-[14px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black tracking-[-0.3px] outline-none focus:border-black transition-colors bg-transparent placeholder:text-[#ccc] resize-none"
              style={{ fontVariationSettings: "'wdth' 100" }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-[8px] max-w-[300px]">
            <label
              className="font-['Instrument_Sans:Regular',sans-serif] text-[11px] text-[#999] tracking-[-0.4px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              비밀번호 * <span className="text-[10px]">(의견 열람 시 필요)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 설정해주세요"
                required
                className="w-full border-b border-[#ddd] pb-[8px] pr-[32px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black tracking-[-0.3px] outline-none focus:border-black transition-colors bg-transparent placeholder:text-[#ccc]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 text-[#bbb] hover:text-[#767676] transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-[16px]">
            <button
              type="submit"
              disabled={!message.trim() || !password.trim()}
              className={`flex items-center gap-[8px] px-[24px] py-[11px] rounded-full text-[13px] tracking-[-0.3px] transition-all font-['Noto_Sans_KR:Regular',sans-serif] cursor-pointer ${
                message.trim() && password.trim()
                  ? "bg-black text-white hover:bg-[#333]"
                  : "bg-[#eee] text-[#bbb] cursor-not-allowed"
              }`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              <Send size={14} />
              의견 보내기
            </button>
            {submitted && (
              <motion.div
                className="flex items-center gap-[6px] text-[#4CAF50] text-[13px] font-['Noto_Sans_KR:Regular',sans-serif]"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle size={16} />
                <span>의견이 등록되었습니다!</span>
              </motion.div>
            )}
          </div>
        </motion.form>
      </div>

      {/* Submitted Opinions */}
      {submissions.length > 0 && (
        <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] pb-[60px] md:pb-[80px]">
          <div className="border-t border-black pt-[24px] md:pt-[32px]">
            <div className="flex items-center gap-[8px] mb-[24px] md:mb-[32px]">
              <p
                className="font-['Instrument_Sans:Regular',sans-serif] text-[18px] md:text-[22px] text-black tracking-[-0.8px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                제출된 의견
              </p>
              <span
                className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#bbb] tracking-[-0.3px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                비공개 · 비밀번호 입력 후 열람 가능
              </span>
            </div>
            <div className="flex flex-col gap-[12px] md:gap-[16px]">
              {submissions.map((item, i) => {
                const isUnlocked = unlockedIds.has(item.id);
                return (
                  <motion.div
                    key={item.id}
                    className={`border rounded-[8px] p-[20px] md:p-[24px] transition-all ${
                      isUnlocked
                        ? "border-[#eee] bg-white"
                        : "border-[#eee] bg-[#fafafa] cursor-pointer hover:border-[#ccc] hover:bg-[#f5f5f5]"
                    }`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    onClick={() => handleCardClick(item.id)}
                  >
                    <div className="flex flex-wrap items-center gap-[8px] md:gap-[12px]">
                      {!isUnlocked && (
                        <Lock size={14} className="text-[#bbb] shrink-0" />
                      )}
                      <span
                        className="font-['Noto_Sans_KR:Medium',sans-serif] text-[14px] text-black tracking-[-0.3px]"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        {item.name}
                      </span>
                      <span
                        className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#999] tracking-[-0.3px]"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        {item.church}
                      </span>
                      <span className="px-[10px] py-[3px] rounded-full bg-[#f0f0f0] text-[11px] text-[#767676] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px]">
                        {item.category}
                      </span>
                      <span
                        className="ml-auto font-['Instrument_Sans:Regular',sans-serif] text-[11px] text-[#bbb] tracking-[-0.3px]"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        {item.date}
                      </span>
                    </div>

                    {isUnlocked ? (
                      <motion.p
                        className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] md:text-[14px] text-[#555] tracking-[-0.3px] leading-[1.8] whitespace-pre-wrap mt-[14px] pt-[14px] border-t border-[#f0f0f0]"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.message}
                      </motion.p>
                    ) : (
                      <p
                        className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#ccc] tracking-[-0.3px] mt-[10px]"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        비밀번호를 입력하면 내용을 확인할 수 있습니다
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-[16px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setModalOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-white rounded-[12px] p-[28px] md:p-[36px] w-full max-w-[380px] shadow-lg"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-[16px] right-[16px] text-[#bbb] hover:text-black transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-[10px] mb-[20px]">
                <div className="w-[36px] h-[36px] rounded-full bg-[#f5f5f5] flex items-center justify-center">
                  <Lock size={16} className="text-[#767676]" />
                </div>
                <div>
                  <p
                    className="font-['Noto_Sans_KR:Medium',sans-serif] text-[15px] text-black tracking-[-0.3px]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    비공개 의견
                  </p>
                  <p
                    className="font-['Noto_Sans_KR:Regular',sans-serif] text-[11px] text-[#999] tracking-[-0.3px] mt-[2px]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    비밀번호를 입력해주세요
                  </p>
                </div>
              </div>

              <div className="relative mb-[8px]">
                <input
                  type={showModalPassword ? "text" : "password"}
                  value={modalPassword}
                  onChange={(e) => {
                    setModalPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  onKeyDown={handleModalKeyDown}
                  placeholder="비밀번호 입력"
                  autoFocus
                  className={`w-full border-b pb-[10px] pr-[32px] font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black tracking-[-0.3px] outline-none transition-colors bg-transparent placeholder:text-[#ccc] ${
                    passwordError ? "border-[#e53935]" : "border-[#ddd] focus:border-black"
                  }`}
                  style={{ fontVariationSettings: "'wdth' 100" }}
                />
                <button
                  type="button"
                  onClick={() => setShowModalPassword(!showModalPassword)}
                  className="absolute right-0 top-0 text-[#bbb] hover:text-[#767676] transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  {showModalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <AnimatePresence>
                {passwordError && (
                  <motion.p
                    className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#e53935] tracking-[-0.3px] mb-[12px]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    비밀번호가 일치하지 않습니다
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                onClick={handleUnlock}
                disabled={!modalPassword.trim()}
                className={`w-full mt-[12px] py-[12px] rounded-full text-[13px] tracking-[-0.3px] transition-all font-['Noto_Sans_KR:Regular',sans-serif] cursor-pointer ${
                  modalPassword.trim()
                    ? "bg-black text-white hover:bg-[#333]"
                    : "bg-[#eee] text-[#bbb] cursor-not-allowed"
                }`}
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                확인
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] py-[24px] border-t border-black mt-auto">
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
              onClick={() => setShowAdminPasswordModal(true)}
              className="text-[#ccc] hover:text-[#999] active:text-[#999] transition-colors duration-300 p-[4px] cursor-pointer bg-transparent border-none"
              aria-label="의견 관리자페이지 이동"
            >
              <Settings size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Password Modal */}
      <AnimatePresence>
        {showAdminPasswordModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => { setShowAdminPasswordModal(false); setAdminPassword(""); setAdminError(""); }}
          >
            <motion.div
              className="bg-white w-full md:w-[320px] md:rounded-[12px] rounded-t-[16px] p-[24px] md:p-[32px] shadow-lg"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-[36px] h-[4px] bg-[#ddd] rounded-full mx-auto mb-[20px] md:hidden" />
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
                value={adminPassword}
                onChange={(e) => { setAdminPassword(e.target.value); setAdminError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdminPasswordSubmit(); }}
                placeholder="비밀번호"
                autoFocus
                className="w-full border border-[#ddd] rounded-[8px] px-[14px] py-[12px] text-[16px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors"
              />
              {adminError && (
                <p
                  className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-red-500 tracking-[-0.3px] mt-[8px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {adminError}
                </p>
              )}
              <div className="flex gap-[8px] mt-[20px]">
                <button
                  onClick={() => { setShowAdminPasswordModal(false); setAdminPassword(""); setAdminError(""); }}
                  className="flex-1 font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#767676] tracking-[-0.3px] px-[16px] py-[11px] rounded-[8px] border border-[#ddd] active:border-[#999] hover:border-[#999] transition-colors cursor-pointer bg-white"
                >
                  취소
                </button>
                <button
                  onClick={handleAdminPasswordSubmit}
                  className="flex-1 font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[16px] py-[11px] rounded-[8px] bg-[#4a6741] active:bg-[#3d5636] hover:bg-[#3d5636] transition-colors cursor-pointer border-none"
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