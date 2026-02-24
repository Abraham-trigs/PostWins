// src/app/xotic/page.tsx
import { MobileChatsScreen } from "./postwins/_components/mobile/MobileChatsScreen";
import { TabletSplit } from "./postwins/_components/layout/TabletSplit";
import { DesktopShell } from "./postwins/_components/layout/DesktopShell";

export default function XoticPage() {
  return (
    <div className="h-full w-full">
      {/* MOBILE: (<md) single-screen chats list */}
      <div className="h-full w-full md:hidden">
        <MobileChatsScreen />
      </div>

      {/* TABLET: (md to <lg) 2-pane split */}
      <div className="hidden md:block lg:hidden h-full w-full">
        <TabletSplit />
      </div>

      {/* DESKTOP: (lg+) stateful shell with selection + empty states */}
      <div className="hidden lg:block h-full w-full">
        <DesktopShell />
      </div>
    </div>
  );
}
