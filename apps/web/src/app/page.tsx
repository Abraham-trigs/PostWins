// app/page.tsx (Updated with state management for mobile view switching)
"use client"; // This is required for using useState and other client hooks

import React, { useState } from "react";
// import ChatListPanel from "./xotic/components/ChatListPanel";
// import ChatDetailPanel from "./xotic/components/ChatDetailPanel";
// import SharedFilesPanel from "./xotic/components/SharedFilesPanel";

export default function HomePage() {
  // State to manage which panel is active on mobile screens
  const [activePanel, setActivePanel] = useState<"list" | "detail">("list");

  return (
    <div className="app-container p-4">
      {/* <div className="flex w-full max-w-7xl mx-auto shadow-2xl rounded-xl overflow-hidden bg-white">
        {/* Panel 1: Chat List */}
      {/* We hide this panel on mobile if the detail view is active, but show it on desktop (md+) */}
      <div
        className={`w-full md:w-80 ${
          activePanel === "detail" ? "hidden md:block" : ""
        }`}
      >
        {/* We need to pass a prop to the ChatListPanel so it can notify parent of a click */}
        <ChatListPanel onChatSelect={() => setActivePanel("detail")} />
      </div>
      {/* Panel 2: Main Chat Detail */}
      {/* We show this panel on mobile if it is active, and always show it on desktop (md+) */}
      <div
        className={`flex-1 bg-white border-l border-gray-200 ${
          activePanel === "list" ? "hidden md:block" : ""
        }`}
      >
        {/* We need to pass a prop to handle going back to the list view on mobile */}
        <ChatDetailPanel onBack={() => setActivePanel("list")} />
      </div>
      {/* Panel 3: Shared Files/Details (Always hidden on mobile, visible on large desktop view) */}
      <div className="hidden lg:block w-72 bg-white border-l border-gray-200">
        <SharedFilesPanel />
      </div>
      {/* </div> */} */
    </div>
  );
}
