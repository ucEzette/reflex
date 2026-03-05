import React from 'react';
import { constructMetadata } from "@/lib/metadata";
import { MarketplaceClient } from "@/components/market/MarketplaceClient";

export const metadata = constructMetadata({
    title: "Marketplace",
    description: "Discover and activate parametric protection protocols for travel, agriculture, energy, and more.",
});

export default function MarketPage() {
    return <MarketplaceClient />;
}
