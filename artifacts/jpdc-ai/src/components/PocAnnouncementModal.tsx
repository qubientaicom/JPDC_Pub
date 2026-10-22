import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, BarChart2, Store, CalendarDays } from 'lucide-react';

function Example({ children }: { children: string }) {
  return (
    <p className="rounded-lg border border-[#E4E2F0] bg-[#F9F8FF] px-3 py-2 text-[12.5px] leading-relaxed text-[#4B4A63]">
      {children}
    </p>
  );
}

function Step({ n, icon, title, children }: { n: number; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEEEFF] text-[#4F46E5]">{icon}</span>
        <span className="mt-1 w-px flex-1 bg-[#E4E2F0] group-last:hidden" />
      </div>
      <div className="min-w-0 flex-1 pb-5">
        <h3 className="text-[14px] font-bold text-[#1A1826]">
          <span className="mr-1.5 text-[#4F46E5]">{n}.</span>{title}
        </h3>
        <div className="mt-1.5 space-y-2 text-[13px] leading-relaxed text-[#6B6882]">{children}</div>
      </div>
    </li>
  );
}

export default function PocAnnouncementModal() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-[#1A1826]/55 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300" />
        <Dialog.Content
          data-testid="modal-poc-announcement"
          className="fixed left-1/2 top-1/2 z-[101] flex max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#E4E2F0] bg-white shadow-2xl focus:outline-none motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-3 motion-safe:duration-300"
        >
          <div className="relative shrink-0 bg-gradient-to-br from-[#4F46E5] to-[#6D5DF0] px-6 pb-6 pt-7 text-white">
            <Dialog.Close
              data-testid="button-poc-close"
              aria-label="닫기"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold">
              <CalendarDays className="h-3.5 w-3.5" />
              10월 30일까지 · 일주간
            </span>
            <Dialog.Title className="mt-3 pr-8 text-[22px] font-bold leading-snug sm:text-[24px]">
              사용자 사용성 PoC에 참여해 주세요
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-[13.5px] leading-relaxed text-white/85">
              JPDC AI는 현재 개발 중인 AI 플랫폼으로, 사용자 사용성 테스트를 진행하고 있습니다. 평소 업무에서 자주 하시는 질문을 편하게 입력해 보세요.
            </Dialog.Description>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pt-5">
            <ol className="group">
              <Step n={1} icon={<Search className="h-4 w-4" />} title="사내 지침 검색">
                <p>이런 질문을 해 보세요.</p>
                <Example>대외비 문서의 결재 절차와 보관 방법을 알려줘</Example>
                <Example>공공기관 보안 지침에서 외부 반출 금지 자료의 범위는 어디까지인가요?</Example>
              </Step>
              <Step n={2} icon={<BarChart2 className="h-4 w-4" />} title="운영 데이터 조회 (월별생산량, 일지정보)">
                <p>월별생산량과 일지정보를 질문으로 조회해 보세요.</p>
                <Example>3월 생산량 합계 보여줘</Example>
                <Example>생산 일지정보를 알려줘</Example>
                <p className="text-[12px] text-[#6B6882]">현재 화면은 예시 데이터 기반이며, 실제 데이터 연동 범위는 달라질 수 있습니다.</p>
              </Step>
              <Step n={3} icon={<Store className="h-4 w-4" />} title="AI 비서 사용">
                <p>홈 또는 비서마켓에서 비서를 하나 골라 회의록 정리, 글쓰기, 요약 등을 직접 시도해 보세요.</p>
              </Step>
            </ol>
            <p className="mb-5 rounded-lg bg-[#F5F3FF] px-3 py-2.5 text-[12.5px] leading-relaxed text-[#4B4A63]">
              사용 중 헷갈린 단계나 어색한 답변이 있었다면 기억해 두셨다가 알려 주세요.
            </p>
          </div>

          <div className="shrink-0 border-t border-[#E4E2F0] px-6 py-4">
            <Dialog.Close
              data-testid="button-poc-start"
              className="w-full rounded-xl bg-[#4F46E5] py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#4338CA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]"
            >
              테스트 시작하기
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
