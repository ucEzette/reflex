import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const secretKey = process.env.THIRDWEB_SECRET;

// During build time on Vercel, these env vars might be missing.
// We provide a dummy clientId to prevent createThirdwebClient from throwing,
// which allows the static generation to complete.
// Runtime will still require actual keys to be configured in Vercel.
export const client = createThirdwebClient(
    secretKey
        ? { secretKey }
        : { clientId: clientId || "build-time-dummy-id" }
);
