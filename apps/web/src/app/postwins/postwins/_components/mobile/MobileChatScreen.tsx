import { MobileChatHeader } from "./MobileChatHeader";
import { MobileComposer } from "../layout/MobileComposer";
import { MobileMessageArea } from "./MobileMessageArea";
import { MessagesSurface } from "../chat/MessagesSurface";

type Props = {
  detailsHref?: string;
};

export function MobileChatScreen({ detailsHref }: Props) {
  return (
    <div className="h-full w-full bg-background flex flex-col">
      <MobileChatHeader detailsHref={detailsHref} />
      {/* messages */}
      <div className="flex-1 overflow-hidden p-[var(--xotic-pad-4)] bg-background">
        <MessagesSurface />
      </div>
      <MobileComposer />
      ModalShell.tsx
    </div>
  );
}
