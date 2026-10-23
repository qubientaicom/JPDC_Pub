import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Trash2 } from 'lucide-react';

interface Props {
  name: string | null;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteAssistantDialog({ name, error, onCancel, onConfirm }: Props) {
  return (
    <AlertDialog.Root open={name !== null} onOpenChange={open => { if (!open) onCancel(); }}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[calc(100vw-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E4E2F0] bg-white p-6 shadow-2xl">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <AlertDialog.Title className="text-[18px] font-bold text-[#1A1826]">비서를 삭제하시겠습니까?</AlertDialog.Title>
          <p className="mt-2 break-words text-sm font-semibold text-[#4F46E5]">{name}</p>
          <AlertDialog.Description className="mt-3 text-sm leading-relaxed text-[#6B6882]">
            이 비서를 삭제하면 다른 사용자는 이 비서와 더 이상 대화할 수 없습니다.
            <br /><br />
            비서 정보는 삭제 상태로 보관되며, 나중에 수정하거나 복제하여 다시 사용할 수 있도록 준비할 수 있습니다.
          </AlertDialog.Description>
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel className="rounded-lg border border-[#E4E2F0] px-5 py-2 text-sm font-semibold text-[#6B6882] hover:bg-[#F4F3FC]">취소</AlertDialog.Cancel>
            <button type="button" onClick={onConfirm} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">삭제</button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
