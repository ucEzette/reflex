import { Metadata } from "next";

export const siteConfig = {
    name: "Reflex",
    titleSuffix: " | Parametric Protection Market on Avalanche",
    description: "Reflex is a decentralized protection market built on Avalanche. Instantly insure against flight delays, crop failures, and climate risks with 24/7 oracle monitoring.",
    url: "https://reflex.finance",
    ogImage: "/og-image.png",
    twitterCard: "/twitter-card.png",
    keywords: [
        "Reflex",
        "Protection Market",
        "Parametric Insurance",
        "Avalanche",
        "Blockchain Insurance",
        "Flight Delay Insurance",
        "DeFi",
        "Chainlink Oracles",
    ],
};

export function constructMetadata({
    title = siteConfig.name,
    description = siteConfig.description,
    image = siteConfig.ogImage,
    noIndex = false,
}: {
    title?: string;
    description?: string;
    image?: string;
    noIndex?: boolean;
} = {}): Metadata {
    return {
        title: title.includes(siteConfig.name) ? title : `${title}${siteConfig.titleSuffix}`,
        description,
        keywords: siteConfig.keywords,
        authors: [{ name: "Reflex Protocol Team" }],
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: `${title} Preview`,
                },
            ],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
            creator: "@ReflexProtocol",
        },
        metadataBase: new URL(siteConfig.url),
        ...(noIndex && {
            robots: {
                index: false,
                follow: false,
            },
        }),
    };
}
