import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Pencil,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  X,
  ArrowUp,
  ArrowDown,
  Upload,
  Download
} from "lucide-react";
import { getPartners, savePartners, generatePartnerId, type PartnerItem } from "./partnerStore";

const CATEGORIES = ["식당", "카페", "서비스업", "판매업", "교육", "기타"];

export default function PartnerAdminPage() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<PartnerItem[]>(() => getPartners());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const downloadCSVTemplate = () => {
    const headers = ["업체명", "한줄_소개", "카테고리", "지역", "주소", "연락처", "운영시간", "지도_링크", "인스타_웹사이트", "소속_교회명", "대표자명"];
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + 
      "테스트업체,간단한 소개,식당,제주시,어딘가,010-0000-0000,매일 10시,https://map...,https://inst...,테스트교회,홍길동";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "업체등록_템플릿.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split(/\r?\n/).filter(r => r.trim());
      if (rows.length <= 1) {
          showSaveMsg("데이터가 없습니다.");
          return;
      }
      
      const newPartners: PartnerItem[] = [];
      let baseOrder = partners.length > 0 ? Math.max(...partners.map(p => p.sortOrder || 0)) + 1 : 0;
      
      const parseCSVRow = (text: string) => {
          let result = [];
          let cur = '';
          let inQuote = false;
          for (let i = 0; i < text.length; i++) {
              const char = text[i];
              if (char === '"') {
                  inQuote = !inQuote;
              } else if (char === ',' && !inQuote) {
                  result.push(cur);
                  cur = '';
              } else {
                  cur += char;
              }
          }
          result.push(cur);
          return result.map(s => s.trim().replace(/^"|"$/g, ''));
      };

      for (let i = 1; i < rows.length; i++) {
          const cells = parseCSVRow(rows[i]);
          if (cells.length < 1 || !cells[0]) continue;
          
          newPartners.push({
              id: generatePartnerId() + "-" + i,
              name: cells[0] || "",
              description: cells[1] || "",
              category: CATEGORIES.includes(cells[2]) ? cells[2] : "기타",
              region: cells[3] || "",
              address: cells[4] || "",
              phone: cells[5] || "",
              hours: cells[6] || "",
              mapUrl: cells[7] || "",
              contactUrl: cells[8] || "",
              churchName: cells[9] || "",
              ownerName: cells[10] || "",
              image: "",
              visible: true,
              sortOrder: baseOrder++,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
          });
      }

      if (newPartners.length > 0) {
          setPartners(prev => [...prev, ...newPartners]);
          showSaveMsg(`${newPartners.length}개 업체가 일괄 등록되었습니다`);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };


  const getEmptyPartner = (): Omit<PartnerItem, "id"> => ({
    name: "",
    description: "",
    category: "식당",
    region: "",
    churchName: "",
    ownerName: "",
    phone: "",
    address: "",
    hours: "",
    mapUrl: "",
    contactUrl: "",
    image: "",
    visible: true,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [newPartner, setNewPartner] = useState<Omit<PartnerItem, "id">>(getEmptyPartner());

  useEffect(() => {
    savePartners(partners);
  }, [partners]);

  const handleAdd = () => {
    if (!newPartner.name.trim()) return;
    const partner: PartnerItem = { 
        ...newPartner, 
        id: generatePartnerId(),
        sortOrder: partners.length > 0 ? Math.max(...partners.map(p => p.sortOrder || 0)) + 1 : 0
    };
    setPartners((prev) => [...prev, partner]);
    setNewPartner(getEmptyPartner());
    setShowAddForm(false);
    showSaveMsg("업체가 등록되었습니다");
  };

  const handleDelete = (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
    showSaveMsg("업체가 삭제되었습니다");
  };

  const handleToggleVis = (id: string) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p))
    );
  };

  const handleUpdate = (id: string, updates: Partial<PartnerItem>) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const newArr = [...partners];
    const temp = newArr[idx - 1].sortOrder;
    newArr[idx - 1].sortOrder = newArr[idx].sortOrder;
    newArr[idx].sortOrder = temp;
    newArr.sort((a,b) => a.sortOrder - b.sortOrder);
    setPartners(newArr);
    showSaveMsg("순서가 변경되었습니다");
  };

  const moveDown = (idx: number) => {
    if (idx === partners.length - 1) return;
    const newArr = [...partners];
    const temp = newArr[idx + 1].sortOrder;
    newArr[idx + 1].sortOrder = newArr[idx].sortOrder;
    newArr[idx].sortOrder = temp;
    newArr.sort((a,b) => a.sortOrder - b.sortOrder);
    setPartners(newArr);
    showSaveMsg("순서가 변경되었습니다");
  };

  const showSaveMsg = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean, partnerId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        if (isEdit && partnerId) {
          handleUpdate(partnerId, { image: base64Str });
        } else {
          setNewPartner({ ...newPartner, image: base64Str });
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = "";
  };

  const inputCls =
    "w-full border border-[#ddd] rounded-[8px] px-[12px] py-[10px] text-[14px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors bg-white";

  return (
    <div className="bg-[#f8f8f6] min-h-screen pb-[60px]">
      <div className="bg-white border-b border-[#eee] sticky top-0 z-10">
        <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[14px] md:py-[16px] flex items-center gap-[12px]">
          <button
            onClick={() => navigate("/partners")}
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
            className="font-['Instrument_Sans:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.4px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Community Businesses 관리
          </p>
        </div>
      </div>

      <AnimatePresence>
        {saveMessage && (
          <motion.div
            className="fixed top-[70px] left-[50%] z-50 bg-[#4a6741] text-white px-[16px] py-[10px] rounded-[8px] shadow-lg whitespace-nowrap"
            initial={{ opacity: 0, y: -10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px]">{saveMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[24px] md:py-[48px]">
        {/* CSV Actions */}
        <div className="flex justify-end gap-[10px] mb-[16px]">
            <input type="file" accept=".csv" ref={csvInputRef} className="hidden" onChange={handleCSVUpload} />
            <button
                onClick={downloadCSVTemplate}
                className="font-['Noto_Sans_KR:Medium',sans-serif] text-[13px] px-[14px] py-[8px] border border-[#ddd] rounded-[8px] text-[#555] bg-white hover:bg-[#fafaf8] transition-colors flex items-center gap-[6px]"
            >
                <Download size={14} /> CSV 양식 다운로드
            </button>
            <button
                onClick={() => csvInputRef.current?.click()}
                className="font-['Noto_Sans_KR:Medium',sans-serif] text-[13px] px-[14px] py-[8px] border border-[#4a6741] rounded-[8px] text-[#4a6741] bg-white hover:bg-[#f0f7ee] transition-colors flex items-center gap-[6px]"
            >
                <Upload size={14} /> CSV 파일 업로드
            </button>
        </div>

        {/* Add Part */}
        <div className="bg-white rounded-[12px] border border-[#eee] mb-[30px] overflow-hidden shadow-sm">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center gap-[10px] px-[16px] md:px-[24px] py-[16px] md:py-[18px] cursor-pointer bg-transparent border-none text-left active:bg-[#fafaf8] hover:bg-[#fafaf8]"
          >
            <div className="w-[28px] h-[28px] rounded-full bg-[#4a6741] flex items-center justify-center shrink-0">
              <Plus size={14} className="text-white" />
            </div>
            <p className="font-['Noto_Sans_KR:Medium',sans-serif] text-[15px] flex-1">새 업체 등록</p>
            {showAddForm ? <ChevronUp size={16} className="text-[#999]" /> : <ChevronDown size={16} className="text-[#999]" />}
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
                <div className="px-[16px] md:px-[24px] pb-[24px] border-t border-[#eee] pt-[24px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                    <div className="md:col-span-2">
                        <Label>대표 이미지 (권장 비율 4:3)</Label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, false)}
                        />
                        {newPartner.image ? (
                            <div className="relative w-full max-w-[300px] aspect-[4/3] rounded-[8px] overflow-hidden border border-[#eee] group">
                                <img src={newPartner.image} className="w-full h-full object-cover" alt="preview" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded flex items-center gap-1 text-sm"><ImageIcon size={14}/> 변경</button>
                                    <button onClick={() => setNewPartner({...newPartner, image: ""})} className="p-2 bg-white text-red-500 rounded flex items-center gap-1 text-sm"><X size={14}/> 삭제</button>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full max-w-[300px] aspect-[4/3] rounded-[8px] border-2 border-dashed border-[#ddd] flex flex-col items-center justify-center cursor-pointer hover:bg-[#fafaf8]"
                            >
                                <ImageIcon size={24} className="text-[#999] mb-2" />
                                <p className="text-sm text-[#767676]">이미지 업로드</p>
                            </div>
                        )}
                    </div>
                    {['name', 'description'].map(f => (
                      <div key={f} className={f === "description" ? "md:col-span-2" : ""}>
                         <Label>{f === 'name' ? '업체명 *' : '한줄 소개'}</Label>
                         <input type="text" value={(newPartner as any)[f]} onChange={(e) => setNewPartner({...newPartner, [f]: e.target.value})} className={inputCls} placeholder={f === 'name' ? '업체명을 입력하세요' : '간단한 소개를 작성해주세요'} />
                      </div>
                    ))}
                    <div>
                        <Label>카테고리</Label>
                        <select value={newPartner.category} onChange={(e) => setNewPartner({...newPartner, category: e.target.value})} className={inputCls}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label>지역 (예: 조천읍, 구좌읍, 남원읍)</Label>
                        <input type="text" value={newPartner.region} onChange={e => setNewPartner({...newPartner, region: e.target.value})} className={inputCls} placeholder="소속 지역 입력" />
                    </div>
                    <div>
                        <Label>주소</Label>
                        <input type="text" value={newPartner.address} onChange={e => setNewPartner({...newPartner, address: e.target.value})} className={inputCls} placeholder="주소" />
                    </div>
                    <div>
                        <Label>연락처</Label>
                        <input type="text" value={newPartner.phone} onChange={e => setNewPartner({...newPartner, phone: e.target.value})} className={inputCls} placeholder="010-0000-0000" />
                    </div>
                    <div>
                        <Label>운영시간</Label>
                        <input type="text" value={newPartner.hours} onChange={e => setNewPartner({...newPartner, hours: e.target.value})} className={inputCls} placeholder="매일 10:00 - 20:00 (화요일 휴무)" />
                    </div>
                    <div>
                        <Label>인스타 또는 웹사이트 링크</Label>
                        <input type="url" value={newPartner.contactUrl} onChange={e => setNewPartner({...newPartner, contactUrl: e.target.value})} className={inputCls} placeholder="https://..." />
                    </div>
                    <div>
                        <Label>비고: 소속 교회명</Label>
                        <input type="text" value={newPartner.churchName} onChange={e => setNewPartner({...newPartner, churchName: e.target.value})} className={inputCls} placeholder="조천교회" />
                    </div>
                    <div className="md:col-span-2">
                        <Label>지도 링크 (네이버/카카오)</Label>
                        <input type="url" value={newPartner.mapUrl} onChange={e => setNewPartner({...newPartner, mapUrl: e.target.value})} className={inputCls} placeholder="https://map.naver.com/..." />
                    </div>
                    <div className="md:col-span-2 p-3 bg-gray-50 rounded">
                        <Label>방문자에게 표시되지 않는 정보 (관리자용)</Label>
                        <input type="text" value={newPartner.ownerName} onChange={e => setNewPartner({...newPartner, ownerName: e.target.value})} className={inputCls} placeholder="대표자명" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-[8px] mt-[20px]">
                    <button onClick={() => { setShowAddForm(false); setNewPartner(getEmptyPartner()); }} className="px-[20px] py-[10px] rounded-[8px] border border-[#ddd] bg-white text-[#767676]">취소</button>
                    <button onClick={handleAdd} disabled={!newPartner.name.trim()} className="px-[20px] py-[10px] rounded-[8px] bg-[#4a6741] text-white disabled:opacity-40 flex items-center gap-[6px]"><Check size={14} /> 등록</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* List Part */}
        <div className="flex flex-col gap-[8px]">
          <p className="font-['Noto_Sans_KR:Medium',sans-serif] text-[14px] text-[#767676] mb-[6px] px-[4px]">
            등록된 업체 ({partners.length}개)
          </p>
          {partners.length === 0 ? (
            <div className="bg-white rounded-[12px] border border-[#eee] py-[48px] flex justify-center text-[#999]">등록된 업체가 없습니다.</div>
          ) : (
            partners.map((p, idx) => (
              <motion.div key={p.id} layout className={`bg-white rounded-[12px] border border-[#eee] overflow-hidden ${!p.visible ? "opacity-50" : ""}`}>
                <div className="px-[16px] md:px-[24px] py-[14px] md:py-[18px]">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-[12px] sm:gap-[16px]">
                     <div className="w-[60px] h-[60px] rounded-[6px] overflow-hidden shrink-0 border border-[#eee] bg-[#fafaf8]">
                        {p.image ? (
                           <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-[10px] text-[#ccc]">No Img</div>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[6px]">
                           <span className="font-['Noto_Sans_KR:Medium',sans-serif] text-[11px] bg-[#f0ede8] text-[#767676] px-[6px] py-[2px] rounded-[4px]">{p.category}</span>
                           <h3 className="font-['Noto_Sans_KR:Medium',sans-serif] text-[16px] m-0 truncate">{p.name}</h3>
                        </div>
                        <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#767676] mt-[4px] truncate">{p.region ? `[${p.region}] ` : ""}{p.description}</p>
                        {p.ownerName && <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[11px] text-blue-500 mt-[2px]">관리자메모: 대표자 {p.ownerName}</p>}
                     </div>
                     
                     <div className="flex items-center gap-[4px] shrink-0 self-end sm:self-center">
                        <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-[6px] text-[#999] disabled:opacity-30"><ArrowUp size={14}/></button>
                        <button onClick={() => moveDown(idx)} disabled={idx === partners.length - 1} className="p-[6px] text-[#999] disabled:opacity-30"><ArrowDown size={14}/></button>
                        <div className="w-[1px] h-[16px] bg-[#ddd] mx-[4px]"/>
                        <button onClick={() => handleToggleVis(p.id)} className={`p-[8px] rounded-[6px] transition-colors ${p.visible ? "text-[#4a6741] bg-[#f0f7ee]" : "text-[#ccc] bg-[#f5f5f5]"}`}>{p.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                        <button onClick={() => setEditingId(editingId === p.id ? null : p.id)} className="p-[8px] rounded-[6px] text-[#999] hover:bg-[#f5f5f5]"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteConfirmId(p.id)} className="p-[8px] rounded-[6px] text-[#ccc] hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                     </div>
                  </div>
                </div>

                <AnimatePresence>
                  {editingId === p.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[#fafaf8]">
                      <div className="p-[16px] md:p-[24px] border-t border-[#eee]">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                            {/* Image edit */}
                            <div className="md:col-span-2 mb-[10px]">
                                <Label>이미지 수정</Label>
                                <input type="file" accept="image/*" ref={editFileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, true, p.id)} />
                                <div className="flex gap-[12px] items-center">
                                    <button onClick={() => editFileInputRef.current?.click()} className="px-[12px] py-[6px] text-[12px] bg-white border border-[#ddd] rounded text-[#555]">새 이미지 찾기</button>
                                    {p.image && <button onClick={() => handleUpdate(p.id, {  image: ""})} className="px-[12px] py-[6px] text-[12px] bg-white border border-red-200 text-red-500 rounded">아미지 삭제</button>}
                                </div>
                            </div>
                            <div><Label>업체명</Label><input type="text" className={inputCls} value={p.name} onChange={e => handleUpdate(p.id, {name: e.target.value})} /></div>
                            <div><Label>카테고리</Label><select className={inputCls} value={p.category} onChange={e => handleUpdate(p.id, {category: e.target.value})}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                            <div className="md:col-span-2"><Label>한줄 소개</Label><input type="text" className={inputCls} value={p.description} onChange={e => handleUpdate(p.id, {description: e.target.value})} /></div>
                            <div><Label>지역</Label><input type="text" className={inputCls} value={p.region} onChange={e => handleUpdate(p.id, {region: e.target.value})} /></div>
                            <div><Label>주소</Label><input type="text" className={inputCls} value={p.address} onChange={e => handleUpdate(p.id, {address: e.target.value})} /></div>
                            <div><Label>연락처</Label><input type="text" className={inputCls} value={p.phone} onChange={e => handleUpdate(p.id, {phone: e.target.value})} /></div>
                            <div><Label>운영시간</Label><input type="text" className={inputCls} value={p.hours} onChange={e => handleUpdate(p.id, {hours: e.target.value})} /></div>
                            <div><Label>소속 교회명</Label><input type="text" className={inputCls} value={p.churchName} onChange={e => handleUpdate(p.id, {churchName: e.target.value})} /></div>
                            <div><Label>관리자 비고(대표자명)</Label><input type="text" className={inputCls} value={p.ownerName} onChange={e => handleUpdate(p.id, {ownerName: e.target.value})} /></div>
                            <div className="md:col-span-2"><Label>웹/인스타 링크</Label><input type="text" className={inputCls} value={p.contactUrl} onChange={e => handleUpdate(p.id, {contactUrl: e.target.value})} /></div>
                            <div className="md:col-span-2"><Label>지도 링크</Label><input type="text" className={inputCls} value={p.mapUrl} onChange={e => handleUpdate(p.id, {mapUrl: e.target.value})} /></div>
                         </div>
                         <div className="flex justify-end mt-[20px]">
                            <button onClick={() => { setEditingId(null); showSaveMsg("저장되었습니다"); }} className="px-[20px] py-[8px] bg-[#4a6741] text-white rounded-[8px] text-[13px]">수정 완료</button>
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

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[16px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-[12px] p-[24px] w-full max-w-[320px]">
              <p className="font-['Noto_Sans_KR:Medium',sans-serif] text-[16px] mb-[8px]">삭제 확인</p>
              <p className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#767676] mb-[24px]">이 업체를 삭제하시겠습니까? 복구할 수 없습니다.</p>
              <div className="flex gap-[8px]">
                 <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-[10px] bg-white border border-[#ddd] rounded-[8px] text-[#555]">취소</button>
                 <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-[10px] bg-red-500 text-white rounded-[8px]">삭제</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[12px] font-['Noto_Sans_KR:Medium',sans-serif] text-[#767676] mb-[6px]">{children}</label>;
}
