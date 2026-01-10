"use client";

import React from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import StudentSubscription from "@/pages/student/subscription";

export default function DashboardStudentSubscription() {
  return (
    <DashboardNavbar>
      <div className="bg-gray-900 text-white rounded-lg p-4">
        <StudentSubscription embedded />
      </div>
    </DashboardNavbar>
  );
}

