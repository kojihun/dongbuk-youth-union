import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { getBrandImages } from "./brandStore";
import svgPaths from "../../imports/svg-m4b78paeab";

/** 색상 스와치 */
function ColorSwatch({
  color,
  name,
  hex,
  desc,
}: {
  color: string;
  name: string;
  hex: string;
  desc?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-[10px]">
      <div
        className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-[12px] border border-[#eee] shadow-sm"
        style={{ backgroundColor: color }}
      />
      <p
        className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] md:text-[14px] text-black tracking-[-0.3px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        {name}
      </p>
      <p
        className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        {hex}
      </p>
      {desc && (
        <p
          className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[11px] text-[#999] tracking-[-0.2px] text-center"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          {desc}
        </p>
      )}
    </div>
  );
}

/** 섹션 제목 */
function SectionTitle({ en, ko }: { en: string; ko: string }) {
  return (
    <motion.div
      className="mb-[28px] md:mb-[36px]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <p
        className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[22px] md:text-[28px] text-black tracking-[-1.2px] leading-none"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        {en}
      </p>
      <p
        className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] md:text-[14px] text-[#999] tracking-[-0.3px] mt-[8px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        {ko}
      </p>
    </motion.div>
  );
}

export default function CiManualPage() {
  return (
    <div className="bg-white flex flex-col items-center relative w-full min-h-screen">
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px]">
        {/* 상단 네비게이션 */}
        <div className="flex items-center gap-[12px] pt-[24px] md:pt-[32px] pb-[20px]">
          <Link
            to="/"
            className="flex items-center gap-[6px] text-[#999] hover:text-black transition-colors no-underline"
          >
            <ArrowLeft size={16} />
            <span
              className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[12px] md:text-[13px] tracking-[-0.4px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Home
            </span>
          </Link>
        </div>

        {/* 페이지 타이틀 */}
        <motion.div
          className="border-t border-black pt-[40px] md:pt-[56px] pb-[40px] md:pb-[50px]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p
            className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[32px] md:text-[44px] lg:text-[52px] text-black tracking-[-2px] leading-[1.1]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            CI Manual
          </p>
          <p
            className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] md:text-[16px] text-[#767676] tracking-[-0.4px] mt-[16px] leading-[1.6]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            동북시찰청년연합회 CI(Corporate Identity) 매뉴얼
          </p>
        </motion.div>

        {/* ─── 1. 심볼마크 ─── */}
        <div className="border-t border-[#eee] pt-[40px] md:pt-[50px] pb-[50px] md:pb-[60px]">
          <SectionTitle en="Symbol Mark" ko="심볼마크" />
          <motion.div
            className="flex flex-col md:flex-row items-center gap-[40px] md:gap-[60px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <div className="bg-[#f8f8f8] rounded-[16px] p-[40px] md:p-[50px] flex items-center justify-center">
              <img
                src={getBrandImages().logo}
                alt="동북시찰청년연합회 심볼마크"
                className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p
                className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[15px] md:text-[17px] text-black tracking-[-0.4px] leading-[1.6] mb-[16px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                심볼마크는 동북시찰청년연합회의 핵심 시각 요소입니다.
              </p>
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] md:text-[14px] text-[#767676] tracking-[-0.3px] leading-[1.8]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                과거 '동북지회'로 불리던 명칭에서
                <br />
                자음 ㄷ, ㅂ, ㅈ, ㅎ을 추출하여 조형화한 마크입니다.
                <br />
                네 자음이 하나의 형태로 결합된 구조는
                <br />
                그리스도 안에서 하나 되는 청년들의 연합을 상징하며,
                <br />
                십자가의 은혜 위에 세워진 공동체의 정체성을 담고 있습니다.
                <br />
                심볼마크는 단독 또는 텍스트와 함께 사용할 수 있으며,
                <br />
                최소 크기 24px 이상에서 사용해야 합니다.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── 2. 시그니처 로고 ─── */}
        <div className="border-t border-[#eee] pt-[40px] md:pt-[50px] pb-[50px] md:pb-[60px]">
          <SectionTitle en="Signature" ko="시그니처 로고" />
          <motion.div
            className="flex flex-col gap-[32px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {/* 가로형 */}
            <div>
              <p
                className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px] mb-[16px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Horizontal
              </p>
              <div className="bg-[#f8f8f8] rounded-[16px] p-[30px] md:p-[40px] flex items-center gap-[16px] md:gap-[20px]">
                <img
                  src={getBrandImages().logo}
                  alt="심볼마크"
                  className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] object-contain"
                />
                <div>
                  <p
                    className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[16px] md:text-[20px] text-black tracking-[-0.5px] leading-[1.3]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    동북시찰청년연합회
                  </p>
                  <p
                    className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[10px] md:text-[11px] text-[#767676] tracking-[-0.3px] mt-[2px]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    대한예수교장로회(통합)
                  </p>
                </div>
              </div>
            </div>

            {/* 세로형 */}
            <div>
              <p
                className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px] mb-[16px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Vertical
              </p>
              <div className="bg-[#f8f8f8] rounded-[16px] p-[40px] md:p-[50px] flex flex-col items-center gap-[16px]">
                <img
                  src={getBrandImages().logo}
                  alt="심볼마크"
                  className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] object-contain"
                />
                <div className="text-center">
                  <p
                    className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[16px] md:text-[20px] text-black tracking-[-0.5px] leading-[1.3]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    동북시찰청년연합회
                  </p>
                  <p
                    className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[10px] md:text-[11px] text-[#767676] tracking-[-0.3px] mt-[4px]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    대한예수교장로회(통합)
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── 3. 엠블럼 ─── */}
        <div className="border-t border-[#eee] pt-[40px] md:pt-[50px] pb-[50px] md:pb-[60px]">
          <SectionTitle en="Emblem" ko="엠블럼" />
          <motion.div
            className="flex flex-col md:flex-row items-center gap-[40px] md:gap-[60px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <div className="bg-[#f8f8f8] rounded-[16px] p-[40px] md:p-[50px] flex items-center justify-center">
              <img
                src={getBrandImages().emblem}
                alt="동북시찰청년연합회 엠블럼"
                className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] md:text-[14px] text-[#767676] tracking-[-0.3px] leading-[1.8]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                엠블럼은 심볼마크의 원형 변형으로,
                <br />
                프로필 이미지, 스탬프, 뱃지 등 원형 공간에
                <br />
                사용하기 적합한 형태입니다.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── 4. 워드마크 (F&F) ─── */}
        <div className="border-t border-[#eee] pt-[40px] md:pt-[50px] pb-[50px] md:pb-[60px] hidden">
          <SectionTitle en="Wordmark" ko="워드마크" />
          <motion.div
            className="flex flex-col gap-[32px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <div className="bg-[#f8f8f8] rounded-[16px] p-[40px] md:p-[50px] flex items-center justify-center">
              <svg
                className="w-[120px] h-[50px] md:w-[160px] md:h-[70px]"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
                viewBox="0 0 37.9118 16.28"
              >
                <path d={svgPaths.p33d04b00} fill="black" />
                <path d={svgPaths.p1e4f2a00} fill="black" />
                <path d={svgPaths.p31247780} fill="black" />
              </svg>
            </div>
            <p
              className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] md:text-[14px] text-[#767676] tracking-[-0.3px] leading-[1.8] text-center md:text-left"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              F&F 워드마크는 'Faith & Fellowship'을 의미하며,
              <br />
              푸터 등 보조 브랜딩 영역에 사용됩니다.
            </p>
          </motion.div>
        </div>

        {/* ─── 5. 전용 색상 ─── */}
        <div className="border-t border-[#eee] pt-[40px] md:pt-[50px] pb-[50px] md:pb-[60px]">
          <SectionTitle en="Brand Colors" ko="전용 색상" />
          <motion.div
            className="flex flex-wrap justify-center md:justify-start gap-[28px] md:gap-[40px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <ColorSwatch
              color="#1B3764"
              name="Primary Blue"
              hex="#1B3764"
              desc="마크 주 색상"
            />
            <ColorSwatch
              color="#2B5EA7"
              name="Medium Blue"
              hex="#2B5EA7"
              desc="마크 보조 색상"
            />
            <ColorSwatch
              color="#6DA4D9"
              name="Light Blue"
              hex="#6DA4D9"
              desc="마크 하이라이트"
            />
            <ColorSwatch
              color="#4a6741"
              name="Accent Green"
              hex="#4A6741"
              desc="UI 강조 색상"
            />
            <ColorSwatch
              color="#000000"
              name="Black"
              hex="#000000"
              desc="제목/본문"
            />
            <ColorSwatch
              color="#767676"
              name="Gray"
              hex="#767676"
              desc="보조 텍스트"
            />
            <ColorSwatch
              color="#ffffff"
              name="White"
              hex="#FFFFFF"
              desc="배경"
            />
          </motion.div>
        </div>

        {/* ─── 6. 전용 서체 ─── */}
        <div className="border-t border-[#eee] pt-[40px] md:pt-[50px] pb-[50px] md:pb-[60px]">
          <SectionTitle en="Typography" ko="전용 서체" />
          <motion.div
            className="flex flex-col gap-[36px] md:gap-[48px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {/* Instrument Sans */}
            <div>
              <p
                className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px] mb-[16px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                English — Instrument Sans
              </p>
              <div className="bg-[#f8f8f8] rounded-[16px] p-[30px] md:p-[40px]">
                <p
                  className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[28px] md:text-[36px] text-black tracking-[-1.5px] leading-[1.3] mb-[16px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  Aa Bb Cc Dd Ee Ff Gg
                </p>
                <p
                  className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[14px] md:text-[16px] text-[#767676] tracking-[-0.5px] leading-[1.6]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  <br />
                  abcdefghijklmnopqrstuvwxyz
                  <br />
                  0123456789
                </p>
              </div>
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] md:text-[13px] text-[#999] tracking-[-0.3px] mt-[12px] leading-[1.6]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                영문 제목, 네비게이션, 날짜 표기 등에 사용됩니다.
                <br />
                Variable Font으로 Regular~Bold(400~700) 웨이트를 지원합니다.
              </p>
            </div>

            {/* Noto Sans KR */}
            <div>
              <p
                className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px] mb-[16px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                Korean — Noto Sans KR
              </p>
              <div className="bg-[#f8f8f8] rounded-[16px] p-[30px] md:p-[40px]">
                <p
                  className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[28px] md:text-[36px] text-black tracking-[-1.5px] leading-[1.3] mb-[16px]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  가나다라마바사
                </p>
                <p
                  className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] md:text-[16px] text-[#767676] tracking-[-0.5px] leading-[1.6]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  동북시찰청년연합회
                  <br />
                  대한예수교장로회(통합)
                  <br />
                  아야어여오요우유으이
                </p>
              </div>
              <p
                className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] md:text-[13px] text-[#999] tracking-[-0.3px] mt-[12px] leading-[1.6]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                한글 본문, 소개글, 설명 등에 사용됩니다.
                <br />
                Regular(400)과 Medium(500) 웨이트를 주로 사용합니다.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── 7. 사용 금지 사항 ─── */}
        <div className="border-t border-[#eee] pt-[40px] md:pt-[50px] pb-[50px] md:pb-[60px]">
          <SectionTitle en="Incorrect Usage" ko="사용 금지 사항" />
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[24px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {[
              "심볼마크의 비율을 변형하지 않습니다.",
              "지정 색상 외의 색상을 사용하지 않습니다.",
              "심볼마크 위에 텍스트나 다른 요소를 겹치지 않습니다.",
              "심볼마크에 그림자, 외곽선 등 효과를 추가하지 않습니다.",
              "배경색과 대비가 충분하지 않은 곳에 사용하지 않습니다.",
              "최소 크기(24px) 미만으로 축소하지 않습니다.",
            ].map((rule, i) => (
              <div
                key={i}
                className="flex items-start gap-[12px] bg-[#fafafa] rounded-[12px] p-[20px]"
              >
                <span className="text-[#cc4444] text-[16px] font-bold shrink-0 mt-[1px]">
                  ✕
                </span>
                <p
                  className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] md:text-[14px] text-[#767676] tracking-[-0.3px] leading-[1.6]"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  {rule}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* 하단 여백 */}
        <div className="border-t border-black pt-[24px] pb-[40px] md:pb-[60px] flex justify-center">
          <p
            className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[11px] text-[#ccc] tracking-[-0.2px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            2026년 제주성산교회 고지훈 청년 제작
          </p>
        </div>
      </div>
    </div>
  );
}