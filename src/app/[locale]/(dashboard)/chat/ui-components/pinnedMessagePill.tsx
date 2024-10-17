import Image from 'next/image';

import { roboto } from '../fonts';

export default function PinnedMessagePill({}) {
  return (
    <div
      className={`${roboto.className} border-navy50 ml-4 flex flex-row items-center justify-between gap-0.5 rounded border bg-sky-50 px-2`}
    >
      <div className="text-xs font-normal text-sky-900">Pinned message</div>
      <Image src="/icons/pin.svg" alt="Remove" className="ml-1" width={12} height={12} priority />
    </div>
  );
}
