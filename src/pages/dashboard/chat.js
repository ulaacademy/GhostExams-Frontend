"use client";

import DashboardNavbar from "@/components/DashboardNavbar";
import SmartChatBox from "@/components/SmartChatBox";

export default function DashboardChatPage() {
  return (
    <DashboardNavbar>
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <h1 className="text-xl font-bold mb-4">💬 الشات الذكي</h1>
        <SmartChatBox />
      </div>
    </DashboardNavbar>
  );
}