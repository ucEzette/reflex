import React from 'react';
import { constructMetadata } from "@/lib/metadata";
import { InvestDashboardClient } from "@/components/invest/InvestDashboardClient";

export const metadata = constructMetadata({
    title: "Invest & Underwrite",
    description: "Provide liquidity to parametric risk pools and earn underwriting premiums.",
});

export default function InvestPage() {
    return <InvestDashboardClient />;
}
