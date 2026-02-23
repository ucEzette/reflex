import { ethers } from "ethers";
import { FlightData } from "../types";

export class ProofService {
    constructor(
        private readonly appId: string,
        private readonly appSecret: string
    ) { }

    async generateZkProof(apiTarget: string, flightData: FlightData): Promise<Uint8Array> {
        // Mocking zkTLS proof generation for testnet
        // In production, this would use @reclaimprotocol/zk-fetch

        const encoder = new TextEncoder();
        const providerData = encoder.encode(
            JSON.stringify({
                provider: "aviationstack-api",
                endpoint: apiTarget,
                delay: flightData.delaySeconds,
                timestamp: Math.floor(Date.now() / 1000),
                appId: this.appId,
            })
        );

        const claimData = encoder.encode(`${apiTarget}:${flightData.delaySeconds}:${Date.now()}`);
        const claimHashArray = new Uint8Array(await crypto.subtle.digest("SHA-256", claimData));

        const signingKey = new ethers.SigningKey(ethers.keccak256(encoder.encode(this.appSecret)));
        const signature = signingKey.sign(ethers.hexlify(claimHashArray));
        const sigBytes = ethers.getBytes(ethers.concat([signature.r, signature.s, ethers.toBeHex(signature.v, 1)]));

        const proof = new Uint8Array(32 + 65 + providerData.length);
        proof.set(claimHashArray, 0);
        proof.set(sigBytes, 32);
        proof.set(providerData, 97);

        return proof;
    }
}
