import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Settings, Search, MapPin, Phone, Globe, Instagram, Check, LayoutGrid, List } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { getPartners, type PartnerItem } from "./partnerStore";
import { verifyPassword } from "./passwordStore";
import { getBrandImages } from "./brandStore";

const CATEGORIES = ["전체", "식당", "카페", "서비스업", "판매업", "교육", "기타"];

const DEFAULT_IMAGES: Record<string, string> = {
  "식당": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600",
  "카페": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600",
  "서비스업": "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=600",
  "판매업": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600",
  "교육": "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600",
  "기타": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600"
};

export default function PartnerBusinessesPage() {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [viewMode, setViewMode] = useState<'grid'|'list'>('list');

  const partners = getPartners().filter(p => p.visible);

  // 동적 지역 리스트 생성
  const regions = useMemo(() => {
    const list = new Set<string>();
    partners.forEach(p => {
      if (p.region && p.region.trim()) {
        list.add(p.region.trim());
      }
    });
    return ["전체", ...Array.from(list)];
  }, [partners]);

  // 필터링 적용
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchName = p.name.includes(searchQuery) || p.description.includes(searchQuery);
      const matchCat = selectedCategory === "전체" || p.category === selectedCategory;
      const matchReg = selectedRegion === "전체" || p.region === selectedRegion;
      return matchName && matchCat && matchReg;
    });
  }, [searchQuery, selectedCategory, selectedRegion, partners]);

  const handlePasswordSubmit = () => {
    if (verifyPassword(password)) {
      setShowPasswordModal(false);
      setPassword("");
      setError("");
      navigate("/admin/partners");
    } else {
      setError("비밀번호가 올바르지 않습니다");
      setPassword("");
    }
  };

  return (
    <div className="bg-[#f8f8f6] flex flex-col items-center relative w-full min-h-screen">
      {/* Header */}
      <div className="bg-white w-full border-b border-[#eee] sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[14px] md:py-[16px] flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-[6px] text-[#767676] hover:text-black transition-colors"
          >
            <ArrowLeft size={18} />
            <span
              className="font-['Instrument_Sans:Regular',sans-serif] text-[13px] md:text-[14px] tracking-[-0.4px] hidden sm:inline"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Home
            </span>
          </Link>
          <div className="flex-1" />
          <p
            className="font-['Instrument_Sans:Medium',sans-serif] text-[15px] md:text-[16px] text-black tracking-[-0.5px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Community Businesses
          </p>
          <div className="flex-1 flex justify-end">
             <div className="w-[18px]" />
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] pt-[24px] md:pt-[40px] pb-[20px] md:pb-[30px]">
        <div className="flex flex-col items-center text-center">
          <div className="h-[50px] w-[50px] md:h-[60px] md:w-[60px] rounded-full overflow-hidden mb-[16px]">
            {getBrandImages().emblem ? (
              <img
                src={getBrandImages().emblem}
                alt="logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#e8e8e6] rounded-full" />
            )}
          </div>
          <motion.div
            className="font-['Noto_Sans_KR:Medium',sans-serif] text-[20px] md:text-[28px] lg:text-[32px] text-black tracking-[-1px] md:tracking-[-1.5px] leading-[1.4] mb-[12px] break-keep px-[10px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            우리 공동체 안의 업체를 함께 이용하며 서로를 응원합시다.
          </motion.div>
          <motion.p
            className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] md:text-[15px] text-[#767676] tracking-[-0.3px] leading-[1.7] max-w-[600px] break-keep px-[15px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            성도님들과 가정이 운영하는 업체를 소개하고, 필요할 때 서로를 돌아보며 믿음 안에서 사랑과 나눔으로 함께 세워가는 상생의 공간입니다.
          </motion.p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] pb-[20px]">
        <div className="bg-white rounded-[12px] shadow-sm border border-[#eee] p-[16px] md:p-[20px] flex flex-col gap-[16px]">
          {/* Search & Region */}
          <div className="flex flex-col md:flex-row gap-[12px]">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-[12px] flex items-center pointer-events-none">
                <Search size={16} className="text-[#999]" />
              </div>
              <input
                type="text"
                placeholder="업체명 또는 한줄 소개 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[44px] pl-[36px] pr-[12px] rounded-[8px] bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#ddd] outline-none text-[14px] font-['Noto_Sans_KR:Regular',sans-serif] transition-colors"
                title="업체 검색"
              />
            </div>
            <div className="relative w-full md:w-[150px] shrink-0">
              <div className="absolute inset-y-0 left-[12px] flex items-center pointer-events-none">
                <MapPin size={16} className="text-[#999]" />
              </div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full h-[44px] pl-[36px] pr-[12px] rounded-[8px] bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#ddd] outline-none text-[14px] font-['Noto_Sans_KR:Medium',sans-serif] text-[#555] cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                title="지역 필터"
              >
                {regions.map(r => (
                  <option key={r} value={r}>{r === "전체" ? "모든 지역" : r}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-[8px]">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-[14px] py-[6px] rounded-full text-[13px] font-['Noto_Sans_KR:Medium',sans-serif] tracking-[-0.3px] transition-colors ${
                  selectedCategory === cat 
                  ? "bg-[#4a6741] text-white border border-[#4a6741]" 
                  : "bg-white text-[#767676] border border-[#ddd] hover:border-[#bbb] hover:text-[#555]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid / List */}
      <div className="w-full max-w-[1035px] px-[15px] md:px-[24px] pb-[60px] min-h-[40vh]">
        <div className="flex items-center justify-between mb-[16px]">
          <p className="font-['Noto_Sans_KR:Medium',sans-serif] text-[13px] text-[#767676]">
            총 {filteredPartners.length}개
          </p>
          <div className="flex items-center bg-white border border-[#eee] rounded-[8px] p-[2px] shadow-sm">
             <button onClick={() => setViewMode('grid')} className={`p-[6px] rounded-[6px] transition-colors ${viewMode === 'grid' ? "bg-[#f5f5f3] text-black" : "text-[#999] hover:text-[#555]"}`}>
               <LayoutGrid size={16} />
             </button>
             <button onClick={() => setViewMode('list')} className={`p-[6px] rounded-[6px] transition-colors ${viewMode === 'list' ? "bg-[#f5f5f3] text-black" : "text-[#999] hover:text-[#555]"}`}>
               <List size={16} />
             </button>
          </div>
        </div>

        {filteredPartners.length === 0 ? (
          <div className="w-full py-[60px] flex flex-col items-center justify-center text-center">
            <div className="w-[48px] h-[48px] rounded-full bg-[#eee] flex items-center justify-center mb-[16px]">
              <Search size={20} className="text-[#999]" />
            </div>
            <p className="font-['Noto_Sans_KR:Medium',sans-serif] text-[15px] text-[#555] tracking-[-0.3px] mb-[8px]">
              검색 결과가 없습니다
            </p>
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#999] tracking-[-0.3px]">
              다른 조건으로 검색해보세요.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px] md:gap-[24px]">
            <AnimatePresence>
              {filteredPartners.map((partner, i) => (
                <motion.div
                  key={partner.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.2) }}
                  className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-[#eee] flex flex-col transition-shadow hover:shadow-md h-full"
                >
                  <div className="w-full aspect-[4/3] bg-[#f5f5f3] relative border-b border-[#eee] group overflow-hidden">
                    <img 
                       src={partner.image || DEFAULT_IMAGES[partner.category] || DEFAULT_IMAGES["기타"]} 
                       alt={partner.name} 
                       className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!partner.image && "opacity-80"}`} 
                       loading="lazy" 
                    />
                    {!partner.image && (
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none flex items-end p-[16px]">
                          <span className="font-['Noto_Sans_KR:Medium',sans-serif] text-[12px] text-white/90 tracking-[-0.3px] px-[8px] py-[3px] bg-black/40 backdrop-blur-sm rounded-[4px]">
                             이미지 준비중
                          </span>
                       </div>
                    )}
                    <div className="absolute top-[12px] right-[12px] flex gap-[6px]">
                      <span className="bg-white/90 backdrop-blur-sm text-[#4a6741] font-['Noto_Sans_KR:Medium',sans-serif] text-[11px] px-[8px] py-[4px] rounded-[6px] shadow-sm tracking-[-0.3px]">
                        {partner.category}
                      </span>
                      {partner.region && (
                        <span className="bg-[#4a6741]/90 backdrop-blur-sm text-white font-['Noto_Sans_KR:Medium',sans-serif] text-[11px] px-[8px] py-[4px] rounded-[6px] shadow-sm tracking-[-0.3px]">
                          {partner.region}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-[20px] flex flex-col flex-1">
                    <div className="flex items-center gap-[6px] mb-[4px]">
                      <h3 className="font-['Noto_Sans_KR:Medium',sans-serif] text-[18px] text-black tracking-[-0.5px] leading-[1.3] truncate">
                        {partner.name}
                      </h3>
                    </div>
                    {partner.description && (
                      <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#767676] tracking-[-0.3px] mb-[16px] line-clamp-2 leading-[1.5]">
                        {partner.description}
                      </p>
                    )}
                    
                    <div className="flex flex-col gap-[6px] mt-auto pb-[16px] border-b border-[#eee] mb-[16px]">
                      {partner.hours && (
                         <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#555] tracking-[-0.3px] flex items-start gap-[6px]">
                           <span className="shrink-0 text-[#999] mt-[2px]">운영</span>
                           <span className="leading-[1.5]">{partner.hours}</span>
                         </p>
                      )}
                      {partner.address && (
                         <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#555] tracking-[-0.3px] flex items-start gap-[6px]">
                           <span className="shrink-0 text-[#999] mt-[2px]">주소</span>
                           <span className="leading-[1.5] break-keep">{partner.address}</span>
                         </p>
                      )}
                      {partner.churchName && (
                        <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#555] tracking-[-0.3px] flex items-start gap-[6px]">
                          <span className="shrink-0 text-[#999] mt-[2px]">소속</span>
                          <span className="leading-[1.5]">{partner.churchName}</span>
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-[8px]">
                      {partner.phone && (
                        <a href={`tel:${partner.phone}`} className="flex items-center justify-center gap-[4px] py-[8px] bg-[#f8f8f6] hover:bg-[#f0f0ee] rounded-[8px] font-['Noto_Sans_KR:Medium',sans-serif] text-[12px] text-[#555] tracking-[-0.3px] transition-colors no-underline">
                          <Phone size={14} /> 전화
                        </a>
                      )}
                      {partner.mapUrl && (
                        <a href={partner.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-[4px] py-[8px] bg-[#f8f8f6] hover:bg-[#f0f0ee] rounded-[8px] font-['Noto_Sans_KR:Medium',sans-serif] text-[12px] text-[#555] tracking-[-0.3px] transition-colors no-underline">
                          <MapPin size={14} /> 지도
                        </a>
                      )}
                      {partner.contactUrl && (
                        <a href={partner.contactUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-[4px] py-[8px] bg-[#f8f8f6] hover:bg-[#f0f0ee] rounded-[8px] font-['Noto_Sans_KR:Medium',sans-serif] text-[12px] text-[#555] tracking-[-0.3px] transition-colors no-underline ${(partner.phone && partner.mapUrl) ? "col-span-2 lg:col-span-1" : ""}`}>
                          {partner.contactUrl.includes("instagram") ? <Instagram size={14} /> : <Globe size={14} />} 링크
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            <AnimatePresence>
              {filteredPartners.map((partner, i) => (
                <motion.div
                  key={partner.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.2) }}
                  className="bg-white rounded-[12px] p-[16px] md:p-[20px] shadow-sm border border-[#eee] flex flex-col md:flex-row md:items-center gap-[16px] hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0 flex flex-col">
                     <div className="flex items-center gap-[8px] mb-[6px]">
                        <span className="bg-[#4a6741] text-white font-['Noto_Sans_KR:Medium',sans-serif] text-[11px] px-[8px] py-[3px] rounded-[4px] tracking-[-0.3px]">{partner.category}</span>
                        {partner.region && <span className="bg-[#f0f7ee] text-[#4a6741] border border-[#d6e8d2] font-['Noto_Sans_KR:Medium',sans-serif] text-[11px] px-[8px] py-[3px] rounded-[4px] tracking-[-0.3px]">{partner.region}</span>}
                     </div>
                     <h3 className="font-['Noto_Sans_KR:Medium',sans-serif] text-[17px] text-black tracking-[-0.5px] leading-[1.3] truncate mb-[4px]">{partner.name}</h3>
                     {partner.description && <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#767676] tracking-[-0.3px] line-clamp-1 mb-[8px]">{partner.description}</p>}
                     
                     <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px] mt-[4px]">
                        {partner.phone && <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#555] flex items-center gap-[4px] tracking-[-0.3px]"><Phone size={12} className="text-[#999]"/>{partner.phone}</span>}
                        {partner.churchName && <span className="font-['Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#555] flex items-center gap-[4px] tracking-[-0.3px]"><span className="text-[#999]">소속</span>{partner.churchName}</span>}
                     </div>
                  </div>
                  
                  <div className="flex md:flex-col gap-[8px] shrink-0 w-full md:w-[100px] mt-[8px] md:mt-0">
                    {partner.phone && (
                       <a href={`tel:${partner.phone}`} className="flex-1 md:flex-none flex items-center justify-center gap-[6px] py-[8px] md:py-[6px] bg-[#f8f8f6] hover:bg-[#f0f0ee] rounded-[6px] font-['Noto_Sans_KR:Medium',sans-serif] text-[12px] text-[#555] no-underline tracking-[-0.3px]">
                         <Phone size={12} /> 전화
                       </a>
                    )}
                    {partner.mapUrl && (
                       <a href={partner.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-[6px] py-[8px] md:py-[6px] bg-[#f8f8f6] hover:bg-[#f0f0ee] rounded-[6px] font-['Noto_Sans_KR:Medium',sans-serif] text-[12px] text-[#555] no-underline tracking-[-0.3px]">
                         <MapPin size={12} /> 지도
                       </a>
                    )}
                    {partner.contactUrl && !partner.phone && !partner.mapUrl && (
                       <a href={partner.contactUrl} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-[6px] py-[8px] md:py-[6px] bg-[#f8f8f6] hover:bg-[#f0f0ee] rounded-[6px] font-['Noto_Sans_KR:Medium',sans-serif] text-[12px] text-[#555] no-underline tracking-[-0.3px]">
                         {partner.contactUrl.includes("instagram") ? <Instagram size={12} /> : <Globe size={12} />} 링크
                       </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="w-full border-t border-[#eee] bg-white mt-auto">
        <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[24px] flex items-center justify-between">
          <div className="flex flex-col gap-[4px]">
            <p
              className="font-['Noto_Sans_KR:Medium',sans-serif] text-[11px] md:text-[12px] text-[#555] tracking-[-0.3px]"
            >
              본 페이지는 교인 간 상생을 위한 안내 목적입니다.
            </p>
            <p
              className="font-['Noto_Sans_KR:Regular',sans-serif] text-[10px] md:text-[11px] text-[#aaa] tracking-[-0.33px]"
            >
              거래 및 이용 과정에서 발생하는 문제는 연합회와 무관함을 알려드립니다.
            </p>
          </div>
          
          {/* Admin entry */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="text-[#ddd] hover:text-[#bbb] transition-colors duration-300 p-[8px] cursor-pointer bg-transparent border-none ml-[16px]"
            aria-label="관리자 페이지"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* 비밀번호 모달 */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40"
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
                title="비밀번호"
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
