import { MobileTopBar } from "./MobileTopBar";
import { MobileSearch } from "./MobileSearch";
import { MobileTabs } from "./MobileTabs";
import { MobileChatRow } from "./MobileChatRow";

const DEMO_CHAT_HREF = "/xotic/chat/1";

export function MobileChatsScreen() {
  return (
    <div className="h-full w-full bg-background flex flex-col">
      <MobileTopBar />
      <MobileSearch />
      <MobileTabs />

      {/* list */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full">
          <div className="py-1">
            {/* Archived row (box only) */}
            <div className="px-[var(--xotic-pad-4)] py-[var(--xotic-pad-3)]">
              <div
                className="h-12 w-full rounded-[var(--xotic-radius-sm)] bg-surface border border-border"
                aria-label="Archived"
              />
            </div>

            {/* chat rows (clickable placeholder) */}
            <MobileChatRow href={DEMO_CHAT_HREF} />
            <MobileChatRow href={DEMO_CHAT_HREF} />
            <MobileChatRow href={DEMO_CHAT_HREF} />
            <MobileChatRow href={DEMO_CHAT_HREF} />
            <MobileChatRow href={DEMO_CHAT_HREF} />
            <MobileChatRow href={DEMO_CHAT_HREF} />
          </div>
        </div>
      </div>

      {/* bottom nav */}
      <nav
        aria-label="Mobile bottom navigation"
        className="h-16 flex-shrink-0 border-t border-border bg-surface"
      />
    </div>
  );
}
