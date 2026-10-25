import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, CalendarDays } from 'lucide-react';

function Example({ children }: { children: string }) {
  return (
    <p className="rounded-lg border border-[#E4E2F0] bg-[#F9F8FF] px-3 py-2 text-[12.5px] leading-relaxed text-[#4B4A63]">
      {children}
    </p>
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
          className="fixed left-1/2 top-1/2 z-[101] flex max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-[1040px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#E4E2F0] bg-white shadow-2xl focus:outline-none motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-3 motion-safe:duration-300"
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
              <span className="block">JPDC AI는 현재 개발 중인 AI 플랫폼으로, 사용자 사용성 테스트를 진행하고 있습니다.</span>
              <span className="mt-3 block">평소 업무에서 자주 하시는 질문을 편하게 입력해 보세요.</span>
            </Dialog.Description>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <section aria-labelledby="poc-schedule-title">
              <h3 id="poc-schedule-title" className="mb-3 flex items-center gap-2 text-[14px] font-bold text-[#1A1826]">
                <CalendarDays className="h-4 w-4 text-[#4F46E5]" />
                요일별 일정 및 테스트 질의 예시
              </h3>
              <p className="mb-2 text-[12px] text-[#6B6882] sm:hidden">요일별 일정을 좌우로 넘겨 확인하세요.</p>
              <div tabIndex={0} role="region" aria-label="요일별 일정과 테스트 질의 예시 표, 좌우 스크롤 가능"
                className="overflow-x-auto rounded-xl border border-[#E4E2F0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4F46E5]">
                <table className="w-full min-w-[900px] table-fixed text-left text-[12px] leading-relaxed">
                  <caption className="sr-only">월요일, 화요일과 수요일, 목요일, 금요일의 일정 및 해당 테스트 질의 예시</caption>
                  <colgroup>
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '34%' }} />
                    <col style={{ width: '36%' }} />
                    <col style={{ width: '18%' }} />
                  </colgroup>
                  <thead className="bg-[#EEEEFF] text-[#4F46E5]">
                    <tr className="divide-x divide-[#E4E2F0]">
                      {[
                        '(10/26 월요일)',
                        '(10/27 ~ 10/28 화/수요일)',
                        '(10/29 목요일)',
                        '(10/30 금요일)',
                      ].map(day => (
                        <th key={day} scope="col" className="px-2 py-2.5 text-center text-[12px] font-bold">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-[#4B4A63]">
                    <tr className="divide-x divide-[#E4E2F0]">
                      <td className="bg-[#FFFBEB] px-3 py-3 align-top">
                        <p className="font-bold text-[#8A5B00]">PoC 준비</p>
                        <span className="mt-2 inline-block rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[11px] font-bold text-amber-800">참여 불가</span>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <p className="mb-2 font-semibold text-[#1A1826]">첨부파일 기반 질의 · RAG 사규</p>
                        <div className="space-y-2">
                          <Example>도외 출장 일비랑 식비는 얼마야?</Example>
                          <Example>직무관련자한테 받을 수 있는 선물 한도는?</Example>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <span className="mb-2 inline-flex rounded-full bg-[#EEEEFF] px-2 py-1 text-[10.5px] font-bold text-[#4F46E5]">화/수 내용도 테스트 가능</span>
                        <p className="mb-1 font-semibold text-[#1A1826]">MCP 비서 예시</p>
                        <div className="mb-2">
                          <Example>나의 남은 휴가 며칠이야?</Example>
                        </div>
                        <p className="mb-1 font-semibold text-[#1A1826]">ERP 비서 예시</p>
                        <div className="space-y-2">
                          <Example>3월 생산량 합계 보여줘</Example>
                          <Example>생산 일지정보를 알려줘</Example>
                        </div>
                        <p className="mt-2 text-[11px] text-[#6B6882]">MCP 비서와 추가 제공 비서에도 원하는 업무를 요청해 보세요.</p>
                      </td>
                      <td className="bg-[#F9F8FF] px-3 py-3 align-top">
                        <span className="mb-2 inline-flex rounded-full bg-[#EEEEFF] px-2 py-1 text-[10.5px] font-bold text-[#4F46E5]">화/수·목 내용 테스트 가능</span>
                        <p className="mb-2 font-semibold text-[#1A1826]">나만의 비서 만들기</p>
                        <Example>회의록을 요약하고 결정사항과 할 일을 정리하는 비서를 만들어줘</Example>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 rounded-lg bg-[#F5F3FF] px-3 py-2.5 text-[11.5px] leading-relaxed text-[#4B4A63]">
                <span className="block">아직 개발이 완료되지 않아 대화 중 일부 오류가 발생할 수 있습니다.</span>
                <span className="mt-1 block">사용 중 헷갈린 점이나 어색한 답변이 있다면 알려 주세요.</span>
              </p>
            </section>
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
