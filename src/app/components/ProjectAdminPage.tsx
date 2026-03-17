import { useState, useId } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Pencil,
  ImageIcon,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";
import {
  getProjects,
  saveProjects,
  generateProjectId,
  DEFAULT_PROJECTS,
  TAG_LIST,
  type ProjectItem,
} from "./projectStore";

const fv = { fontVariationSettings: "'wdth' 100" };
const inputCls =
  "w-full border border-[#ddd] rounded-[8px] px-[12px] py-[10px] text-[14px] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px] outline-none focus:border-[#4a6741] transition-colors bg-white";
const textareaCls = inputCls + " resize-none";

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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[12px] text-[#767676] tracking-[-0.3px] mb-[6px]"
      style={fv}
    >
      {children}
    </p>
  );
}

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
    // 이미지 크기 제한 (5MB) — localStorage 용량 고려
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB 이하만 가능합니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // 큰 이미지를 리사이즈하여 저장
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
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            onChange(dataUrl);
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
      <Label>이미지</Label>
      {/* 미리보기 + 삭제 */}
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

      {/* 드래그 앤 드롭 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-[8px] p-[16px] md:p-[20px] text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-[#4a6741] bg-[#f0f5ef]"
            : "border-[#ddd] bg-[#fafaf8] hover:border-[#bbb]"
        }`}
        onClick={() => document.getElementById("img-upload-" + uid)?.click()}
      >
        <input
          id={"img-upload-" + uid}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-[8px]">
          <div className={`p-[8px] rounded-full ${isDragging ? "bg-[#4a6741]/10 text-[#4a6741]" : "bg-[#eee] text-[#999]"}`}>
            <Upload size={20} />
          </div>
          <p
            className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#999] tracking-[-0.3px]"
            style={fv}
          >
            {isDragging ? (
              <span className="text-[#4a6741] font-medium">여기에 놓아주세요</span>
            ) : (
              <>
                이미지를 끌어다 놓거나 <span className="text-[#4a6741] underline">파일 선택</span>
              </>
            )}
          </p>
          <p
            className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[11px] text-[#bbb] tracking-[-0.2px]"
            style={fv}
          >
            JPG, PNG, GIF, WebP · 최대 5MB
          </p>
        </div>
      </div>

      {/* URL 직접 입력 토글 */}
      <div className="mt-[8px]">
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px] hover:text-[#666] transition-colors cursor-pointer bg-transparent border-none p-0 underline"
          style={fv}
        >
          {showUrlInput ? "URL 입력 닫기" : "URL로 직접 입력"}
        </button>
        {showUrlInput && (
          <input
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className={inputCls + " mt-[6px]"}
          />
        )}
      </div>
    </div>
  );
}

export default function ProjectAdminPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectItem[]>(() => getProjects());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const emptyProject: Omit<ProjectItem, "id"> = {
    year: new Date().getFullYear().toString(),
    title: "",
    date: "",
    description: "",
    image: "",
    tag: "행사",
    pressUrl: "",
    visible: true,
  };
  const [newProject, setNewProject] = useState<Omit<ProjectItem, "id">>(emptyProject);

  const toast = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const handleSave = () => {
    saveProjects(projects);
    toast("저장되었습니다");
  };

  const handleReset = () => {
    const reset = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
    setProjects(reset);
    saveProjects(reset);
    toast("기본값으로 복원되었습니다");
  };

  const updateProject = (id: string, patch: Partial<ProjectItem>) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
  };

  const moveProject = (idx: number, dir: -1 | 1) => {
    const arr = [...projects];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    setProjects(arr);
  };

  const handleAddProject = () => {
    if (!newProject.title.trim()) return;
    const updated = [{ ...newProject, id: generateProjectId() }, ...projects];
    setProjects(updated);
    setNewProject(emptyProject);
    setShowAddForm(false);
  };

  /* 연도별 그룹 */
  const years = [...new Set(projects.map((p) => p.year))].sort((a, b) => b.localeCompare(a));

  return (
    <div className="bg-[#f8f8f6] min-h-screen pb-[60px]">
      {/* ─── 헤더 ─── */}
      <div className="bg-white border-b border-[#eee] sticky top-0 z-10">
        <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[14px] md:py-[16px] flex items-center gap-[12px]">
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-[6px] text-[#767676] hover:text-black active:text-black transition-colors cursor-pointer bg-transparent border-none p-[6px] -ml-[6px]"
          >
            <ArrowLeft size={18} />
            <span
              className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[13px] tracking-[-0.3px] hidden sm:inline"
              style={fv}
            >
              돌아가기
            </span>
          </button>
          <div className="flex-1" />
          <p
            className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] md:text-[15px] text-black tracking-[-0.4px]"
            style={fv}
          >
            Our Ministry 관리
          </p>
          <div className="flex-1" />
          <button
            onClick={handleSave}
            className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[16px] py-[9px] rounded-[8px] bg-[#4a6741] hover:bg-[#3d5636] transition-colors cursor-pointer border-none"
          >
            저장
          </button>
        </div>
      </div>

      {/* ─── Toast ─── */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            className="fixed top-[70px] left-[50%] z-50 bg-[#4a6741] text-white px-[16px] py-[10px] rounded-[8px] shadow-lg whitespace-nowrap"
            initial={{ opacity: 0, y: -10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] tracking-[-0.3px]" style={fv}>
              {saveMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[24px] md:py-[36px] flex flex-col gap-[16px] md:gap-[20px]">

        {/* 상단 버튼 */}
        <div className="flex gap-[8px] flex-wrap">
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#4a6741] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-dashed border-[#4a6741]/30 hover:border-[#4a6741] transition-colors cursor-pointer bg-white"
            >
              <Plus size={14} />
              활동 추가
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-[6px] font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#999] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-[#ddd] hover:border-[#999] transition-colors cursor-pointer bg-white"
          >
            <RotateCcw size={12} />
            기본값 복원
          </button>
        </div>

        {/* ─── 추가 폼 ─── */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-[12px] border border-[#4a6741]/20 p-[16px] md:p-[20px] flex flex-col gap-[12px]">
                <p className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] text-black tracking-[-0.4px]" style={fv}>
                  새 활동 추가
                </p>
                <div className="flex flex-col sm:flex-row gap-[8px]">
                  <div className="sm:w-[100px]">
                    <Label>연도</Label>
                    <input
                      value={newProject.year}
                      onChange={(e) => setNewProject({ ...newProject, year: e.target.value })}
                      placeholder="2026"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>제목 *</Label>
                    <input
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="활동 제목"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-[8px]">
                  <div className="flex-1">
                    <Label>날짜</Label>
                    <input
                      value={newProject.date}
                      onChange={(e) => setNewProject({ ...newProject, date: e.target.value })}
                      placeholder="2026. 01. 01"
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:w-[120px]">
                    <Label>태그</Label>
                    <select
                      value={newProject.tag}
                      onChange={(e) => setNewProject({ ...newProject, tag: e.target.value })}
                      className={inputCls}
                    >
                      {TAG_LIST.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>설명 (줄바꿈 가능)</Label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={4}
                    className={textareaCls}
                    placeholder="활동 설명을 입력하세요"
                  />
                </div>
                <ImageUploadField
                  value={newProject.image}
                  onChange={(url) => setNewProject({ ...newProject, image: url })}
                />
                <div>
                  <Label>보도자료 URL (선택)</Label>
                  <div className="flex items-center gap-[6px]">
                    <ExternalLink size={14} className="text-[#999] shrink-0" />
                    <input
                      value={newProject.pressUrl}
                      onChange={(e) => setNewProject({ ...newProject, pressUrl: e.target.value })}
                      placeholder="https://news.example.com/article/..."
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="flex gap-[8px] mt-[4px]">
                  <button
                    onClick={() => { setShowAddForm(false); setNewProject(emptyProject); }}
                    className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#767676] tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] border border-[#ddd] hover:border-[#999] cursor-pointer bg-white transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAddProject}
                    className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-white tracking-[-0.3px] px-[14px] py-[9px] rounded-[8px] bg-[#4a6741] hover:bg-[#3d5636] cursor-pointer border-none transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── 프로젝트 목록 (연도별) ─── */}
        {years.map((year) => {
          const yearProjects = projects.filter((p) => p.year === year);
          return (
            <div key={year} className="bg-white rounded-[12px] border border-[#eee] overflow-hidden">
              <div className="px-[16px] md:px-[24px] py-[12px] md:py-[14px] border-b border-[#f0f0f0] flex items-center gap-[10px]">
                <p
                  className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[18px] md:text-[20px] text-black tracking-[-0.8px]"
                  style={fv}
                >
                  {year}
                </p>
                <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px]" style={fv}>
                  {yearProjects.length}개
                </p>
              </div>
              <div className="flex flex-col divide-y divide-[#f5f5f3]">
                {yearProjects.map((project) => {
                  const globalIdx = projects.findIndex((p) => p.id === project.id);
                  const isEditing = editingId === project.id;

                  return (
                    <div key={project.id} className="px-[16px] md:px-[24px] py-[12px] md:py-[14px]">
                      {isEditing ? (
                        /* ── 편집 모드 ── */
                        <div className="flex flex-col gap-[10px]">
                          <div className="flex flex-col sm:flex-row gap-[8px]">
                            <div className="sm:w-[100px]">
                              <Label>연도</Label>
                              <input value={project.year} onChange={(e) => updateProject(project.id, { year: e.target.value })} className={inputCls} />
                            </div>
                            <div className="flex-1">
                              <Label>제목</Label>
                              <input value={project.title} onChange={(e) => updateProject(project.id, { title: e.target.value })} className={inputCls} />
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-[8px]">
                            <div className="flex-1">
                              <Label>날짜</Label>
                              <input value={project.date} onChange={(e) => updateProject(project.id, { date: e.target.value })} className={inputCls} />
                            </div>
                            <div className="sm:w-[120px]">
                              <Label>태그</Label>
                              <select value={project.tag} onChange={(e) => updateProject(project.id, { tag: e.target.value })} className={inputCls}>
                                {TAG_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <Label>설명 (줄바꿈 가능)</Label>
                            <textarea
                              value={project.description}
                              onChange={(e) => updateProject(project.id, { description: e.target.value })}
                              rows={4}
                              className={textareaCls}
                            />
                          </div>
                          <ImageUploadField
                            value={project.image}
                            onChange={(url) => updateProject(project.id, { image: url })}
                          />
                          <div>
                            <Label>보도자료 URL (선택)</Label>
                            <div className="flex items-center gap-[6px]">
                              <ExternalLink size={14} className="text-[#999] shrink-0" />
                              <input
                                value={project.pressUrl || ""}
                                onChange={(e) => updateProject(project.id, { pressUrl: e.target.value })}
                                placeholder="https://news.example.com/article/..."
                                className={inputCls}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => setEditingId(null)}
                              className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[13px] text-[#4a6741] tracking-[-0.3px] px-[14px] py-[8px] rounded-[8px] border border-[#4a6741] cursor-pointer bg-white hover:bg-[#f0f5ef] transition-colors"
                            >
                              완료
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── 보기 모드 ── */
                        <div className="flex items-center gap-[10px]">
                          {/* 순서 이동 */}
                          <div className="flex flex-col gap-[2px] shrink-0">
                            <button
                              onClick={() => moveProject(globalIdx, -1)}
                              disabled={globalIdx === 0}
                              className="text-[#bbb] hover:text-[#666] disabled:opacity-30 cursor-pointer disabled:cursor-default bg-transparent border-none p-[2px]"
                            >
                              <ChevronDown size={14} className="rotate-180" />
                            </button>
                            <button
                              onClick={() => moveProject(globalIdx, 1)}
                              disabled={globalIdx === projects.length - 1}
                              className="text-[#bbb] hover:text-[#666] disabled:opacity-30 cursor-pointer disabled:cursor-default bg-transparent border-none p-[2px]"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>

                          {/* 썸네일 */}
                          <div className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-[6px] overflow-hidden bg-[#f5f5f3] shrink-0">
                            {project.image ? (
                              <img src={project.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-[#ccc]">
                                <ImageIcon size={20} />
                              </div>
                            )}
                          </div>

                          {/* 제목 + 메타 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-[8px]">
                              <p
                                className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[14px] text-black tracking-[-0.3px] truncate"
                                style={fv}
                              >
                                {project.title}
                              </p>
                              <span className={`shrink-0 inline-block px-[8px] py-[2px] rounded-full text-[10px] tracking-[-0.2px] ${tagColors[project.tag] || tagColors["기타"]}`}>
                                {project.tag}
                              </span>
                            </div>
                            <p
                              className="font-['Instrument_Sans:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px] mt-[2px]"
                              style={fv}
                            >
                              {project.date}
                            </p>
                          </div>

                          {/* 액션 버튼 */}
                          <div className="flex items-center gap-[6px] shrink-0">
                            <button
                              onClick={() => setEditingId(project.id)}
                              className="p-[7px] rounded-[6px] border border-[#ddd] text-[#999] hover:text-[#4a6741] hover:border-[#4a6741] cursor-pointer transition-all duration-200 bg-white"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => updateProject(project.id, { visible: !project.visible })}
                              className={`p-[7px] rounded-[6px] border cursor-pointer transition-all duration-200 ${
                                project.visible
                                  ? "border-[#4a6741] text-[#4a6741] bg-[#f0f5ef]"
                                  : "border-[#ddd] text-[#ccc] bg-white"
                              }`}
                            >
                              {project.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            {deleteConfirmId === project.id ? (
                              <div className="flex gap-[4px]">
                                <button
                                  onClick={() => removeProject(project.id)}
                                  className="px-[8px] py-[6px] rounded-[6px] border border-red-300 text-red-500 cursor-pointer bg-white hover:bg-red-50 transition-colors text-[11px] font-['Noto_Sans_KR:Regular',sans-serif]"
                                >
                                  삭제
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-[8px] py-[6px] rounded-[6px] border border-[#ddd] text-[#999] cursor-pointer bg-white text-[11px] font-['Noto_Sans_KR:Regular',sans-serif]"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(project.id)}
                                className="p-[7px] rounded-[6px] border border-[#ddd] text-[#ccc] hover:text-red-400 hover:border-red-300 cursor-pointer transition-all duration-200 bg-white"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="bg-white rounded-[12px] border border-[#eee] p-[40px] flex justify-center">
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] text-[#999] tracking-[-0.3px]" style={fv}>
              등록된 활동이 없습니다
            </p>
          </div>
        )}

        {/* 제작자 표시 */}
        <p
          className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[11px] text-[#bbb] tracking-[-0.3px] text-center mt-[20px]"
          style={fv}
        >
          2026년 제주성산교회 고지훈 청년 제작
        </p>
      </div>
    </div>
  );
}