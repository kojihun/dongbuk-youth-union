import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getContacts, deleteContact, updateContact, type Submission } from "./contactStore";

const fv = { fontVariationSettings: "'wdth' 100" };

export default function ContactAdminPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Submission[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadContacts() {
      const data = await getContacts();
      setContacts(data);
    }

    loadContacts();
  }, []);

  const handleReplyChange = (id: string, text: string) => {
    setReplyInputs((prev) => ({ ...prev, [id]: text }));
  };

  const handleSaveReply = async (id: string) => {
    const text = replyInputs[id];
    if (text !== undefined) {
      const ok = await updateContact(id, { admin_reply: text });

      if (ok) {
        const refreshed = await getContacts();
        setContacts(refreshed);
        alert("답변이 저장되었습니다.");
      } else {
        alert("답변 저장 실패");
      }
    }
  };

  const removeContact = async (id: string) => {
    const ok = await deleteContact(id);

    if (ok) {
      const refreshed = await getContacts();
      setContacts(refreshed);
      setDeleteConfirmId(null);
    } else {
      alert("삭제 실패");
    }
  };

  return (
    <div className="bg-[#f8f8f6] min-h-screen pb-[60px]">
      {/* Header */}
      <div className="bg-white border-b border-[#eee] sticky top-0 z-10">
        <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[14px] md:py-[16px] flex items-center gap-[12px]">
          <button
            onClick={() => navigate("/contact")}
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
            의견 관리
          </p>
          <div className="flex-1" />
        </div>
      </div>

      <div className="max-w-[1035px] mx-auto px-[15px] md:px-[24px] py-[24px] md:py-[36px] flex flex-col gap-[16px] md:gap-[20px]">

        <div className="bg-white rounded-[12px] border border-[#eee] overflow-hidden">
          <div className="px-[16px] md:px-[24px] py-[12px] md:py-[14px] border-b border-[#f0f0f0] flex items-center gap-[10px]">
            <p
              className="font-['Noto_Sans_KR:Medium',sans-serif] font-medium text-[16px] md:text-[18px] text-black tracking-[-0.8px]"
              style={fv}
            >
              제출된 의견
            </p>
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#999] tracking-[-0.3px]" style={fv}>
              {contacts.length}개
            </p>
          </div>
          <div className="flex flex-col divide-y divide-[#f5f5f3]">
            {contacts.map((contact) => (
              <div key={contact.id} className="px-[16px] md:px-[24px] py-[16px] md:py-[20px] flex flex-col md:flex-row gap-[16px] justify-between">
                <div className="flex-1 flex flex-col gap-[8px]">
                  <div className="flex flex-wrap items-center gap-[8px] md:gap-[12px]">
                    <span
                      className="font-['Noto_Sans_KR:Medium',sans-serif] text-[15px] text-black tracking-[-0.3px]"
                      style={fv}
                    >
                      {contact.nickname || "익명"}
                    </span>
                    <span
                      className="font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#767676] tracking-[-0.3px]"
                      style={fv}
                    >
                      {contact.church || "소속교회 미상"}
                    </span>
                    <span className="px-[10px] py-[3px] rounded-full bg-[#f0f0f0] text-[11px] text-[#767676] font-['Noto_Sans_KR:Regular',sans-serif] tracking-[-0.3px]">
                      {contact.category}
                    </span>
                    <span
                      className="font-['Instrument_Sans:Regular',sans-serif] text-[12px] text-[#bbb] tracking-[-0.3px]"
                      style={fv}
                    >
                      {new Date(contact.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    className="font-['Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#333] tracking-[-0.3px] leading-[1.6] whitespace-pre-wrap bg-[#f9f9f9] p-[12px] rounded-[8px]"
                    style={fv}
                  >
                    {contact.content}
                  </p>

                  <div className="mt-[8px] flex flex-col gap-[6px]">
                    <textarea
                      value={replyInputs[contact.id] ?? contact.admin_reply ?? ""}
                      onChange={(e) => handleReplyChange(contact.id, e.target.value)}
                      placeholder="운영진 답변을 작성해주세요..."
                      className="border border-[#ddd] rounded-[6px] p-[10px] font-['Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#4a6741] transition-colors focus:border-[#4a6741] outline-none min-h-[60px] resize-none bg-white"
                      style={fv}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSaveReply(contact.id)}
                        className="font-['Noto_Sans_KR:Medium',sans-serif] text-[12px] text-white tracking-[-0.3px] px-[14px] py-[8px] rounded-[6px] bg-[#4a6741] hover:bg-[#3d5636] transition-colors cursor-pointer border-none"
                        style={fv}
                      >
                        답변 저장
                      </button>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-start gap-[6px]">
                  {deleteConfirmId === contact.id ? (
                    <div className="flex gap-[4px]">
                      <button
                        onClick={() => removeContact(contact.id)}
                        className="px-[10px] py-[6px] rounded-[6px] border border-red-300 text-red-500 cursor-pointer bg-white hover:bg-red-50 transition-colors text-[11px] font-['Noto_Sans_KR:Regular',sans-serif]"
                      >
                        정말 삭제?
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-[10px] py-[6px] rounded-[6px] border border-[#ddd] text-[#999] cursor-pointer bg-white text-[11px] font-['Noto_Sans_KR:Regular',sans-serif]"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(contact.id)}
                      className="p-[8px] rounded-[6px] border border-[#ddd] text-[#ccc] hover:text-red-400 hover:border-red-300 cursor-pointer transition-all duration-200 bg-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {contacts.length === 0 && (
          <div className="bg-white rounded-[12px] border border-[#eee] p-[40px] flex justify-center mt-[20px]">
            <p className="font-['Noto_Sans_KR:Regular',sans-serif] font-normal text-[14px] text-[#999] tracking-[-0.3px]" style={fv}>
              제출된 의견이 없습니다
            </p>
          </div>
        )}

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
