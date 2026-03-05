import React from 'react';
import { constructMetadata } from "@/lib/metadata";
import { CommandCenterClient } from "@/components/dashboard/CommandCenterClient";

export const metadata = constructMetadata({
    title: "Command Center",
    description: "Monitor and manage your active parametric insurance policies and portfolio health.",
});

export default function DashboardPage() {
    return <CommandCenterClient />;
}
