import { ethers } from "ethers";
import { PolicyInfo } from "../types";
import { withRetry } from "../utils/retry";

// Legacy Escrow ABI (still used for backward compatibility)
const ESCROW_ABI = [
    "function getUserPolicies(address _user) view returns (bytes32[])",
    "function getPolicy(bytes32 _policyId) view returns (address policyholder, string apiTarget, uint256 premiumPaid, uint256 payoutAmount, uint256 expirationTime, bool isActive, bool isClaimed)",
    "event PolicyPurchased(bytes32 indexed policyId, address indexed policyholder, string apiTarget, uint256 premiumPaid, uint256 payoutAmount, uint256 expirationTime)",
    "function requestFlightStatus(bytes32 _policyId, string[] calldata _args) returns (bytes32)",
    "function submitRelayerConsensus(bytes32 _policyId) external",
    "function authorizedRelayers(address _relayer) view returns (bool)",
    "function addRelayer(address _relayer) external"
];

// Enterprise Product ABIs (Phase 70+)
const ENTERPRISE_PRODUCT_ABI = [
    "function activePolicyIds(uint256 index) view returns (bytes32)",
    "function getActivePolicyCount() view returns (uint256)",
    "function policies(bytes32) view returns (address policyholder, uint256 premium, uint256 maxPayout, uint256 status, uint256 expiresAt, string identifier)",
    "function expirePolicy(bytes32 id) external",
    "function checkUpkeep(bytes) view returns (bool upkeepNeeded, bytes performData)",
    "function performUpkeep(bytes performData) external",
    "function executeClaim(bytes32 id, uint256 actualIndex) external",
    "event PolicyCreated(bytes32 id, address indexed holder, uint256 premium, uint256 maxPayout, uint256 expiresAt)",
    "event PolicyClaimed(bytes32 id, uint256 actualPayout)",
    "event PolicyExpired(bytes32 id)"
];

const TRAVEL_ABI = [
    "function activePolicyIds(uint256 index) view returns (bytes32)",
    "function getActivePolicyCount() view returns (uint256)",
    "function policies(bytes32) view returns (address policyholder, uint256 premium, uint256 payout, uint256 status, uint256 expiresAt, string flightId)",
    "function expirePolicy(bytes32 id) external",
    "function executeClaim(bytes32 id, bool delayedOver2Hours) external",
    "function checkUpkeep(bytes) view returns (bool upkeepNeeded, bytes performData)",
    "function performUpkeep(bytes performData) external",
    "event PolicyCreated(bytes32 id, address indexed holder, uint256 premium, uint256 payout, uint256 expiresAt)",
    "event PolicyClaimed(bytes32 id, uint256 payout)",
    "event PolicyExpired(bytes32 id)"
];

export interface EnterprisePolicy {
    policyId: string;
    contractAddress: string;
    productName: string;
    policyholder: string;
    premium: bigint;
    maxPayout: bigint;
    status: number;
    expiresAt: bigint;
    identifier: string;
}

export class BlockchainService {
    private readonly provider: ethers.JsonRpcProvider;
    private readonly signer: ethers.Wallet;
    private readonly escrow: ethers.Contract;
    private readonly enterpriseContracts: Map<string, ethers.Contract> = new Map();

    constructor(
        rpcUrl: string,
        privateKey: string,
        private readonly escrowAddress: string,
        enterpriseAddresses?: {
            travel: string;
            agri: string;
            energy: string;
            cat: string;
            maritime: string;
        }
    ) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.signer = new ethers.Wallet(privateKey, this.provider);

        if (escrowAddress) {
            this.escrow = new ethers.Contract(escrowAddress, ESCROW_ABI, this.signer);
        } else {
            this.escrow = null as any;
        }

        // Initialize enterprise contracts
        if (enterpriseAddresses) {
            this.enterpriseContracts.set('Travel', new ethers.Contract(enterpriseAddresses.travel, TRAVEL_ABI, this.signer));
            this.enterpriseContracts.set('Agriculture', new ethers.Contract(enterpriseAddresses.agri, ENTERPRISE_PRODUCT_ABI, this.signer));
            this.enterpriseContracts.set('Energy', new ethers.Contract(enterpriseAddresses.energy, ENTERPRISE_PRODUCT_ABI, this.signer));
            this.enterpriseContracts.set('Catastrophe', new ethers.Contract(enterpriseAddresses.cat, ENTERPRISE_PRODUCT_ABI, this.signer));
            this.enterpriseContracts.set('Maritime', new ethers.Contract(enterpriseAddresses.maritime, ENTERPRISE_PRODUCT_ABI, this.signer));
        }
    }

    async ensureAuthorized(): Promise<void> {
        if (!this.escrow) return;
        const address = this.getWalletAddress();
        const isAuthorized = await this.escrow.authorizedRelayers(address);

        if (!isAuthorized) {
            console.log(`[BlockchainService] Relayer ${address} is NOT authorized. Attempting to self-authorize...`);
            try {
                const tx = await this.escrow.addRelayer(address);
                await tx.wait();
                console.log(`[BlockchainService] Relayer ${address} successfully authorized.`);
            } catch (error: unknown) {
                console.error(`[BlockchainService] Failed to authorize relayer.`, error instanceof Error ? error.message : String(error));
            }
        } else {
            console.log(`[BlockchainService] Relayer ${address} is authorized.`);
        }
    }

    // ── Legacy Escrow Methods ──

    async getActivePolicies(lookbackBlocks: number = 2000): Promise<PolicyInfo[]> {
        if (!this.escrow) return [];
        return withRetry(async () => {
            const currentBlock = await this.provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - lookbackBlocks);
            const filter = this.escrow.filters.PolicyPurchased();
            const events = await this.escrow.queryFilter(filter, fromBlock, currentBlock);
            const policies: PolicyInfo[] = [];

            for (const event of events) {
                const log = event as ethers.EventLog;
                const policyId = log.args[0] as string;
                const policyData = await this.escrow.getPolicy(policyId);
                policies.push({
                    policyId,
                    policyholder: policyData[0],
                    apiTarget: policyData[1],
                    premiumPaid: policyData[2],
                    payoutAmount: policyData[3],
                    expirationTime: policyData[4],
                    isActive: policyData[5],
                    isClaimed: policyData[6],
                });
            }
            return policies.filter(p => p.isActive && !p.isClaimed);
        });
    }

    async triggerChainlinkRequest(policyId: string, flightIata: string, flightDate: string): Promise<string> {
        return withRetry(async () => {
            const tx = await this.escrow.requestFlightStatus(policyId, [flightIata, flightDate]);
            const receipt = await tx.wait();
            return receipt.hash;
        });
    }

    async submitRelayerConsensus(policyId: string): Promise<string> {
        return withRetry(async () => {
            const tx = await this.escrow.submitRelayerConsensus(policyId);
            const receipt = await tx.wait();
            return receipt.hash;
        });
    }

    // ── Enterprise Product Methods ──

    async getActiveEnterprisePolicies(): Promise<EnterprisePolicy[]> {
        const allPolicies: EnterprisePolicy[] = [];

        for (const [name, contract] of this.enterpriseContracts.entries()) {
            try {
                const count = await contract.getActivePolicyCount();
                const numPolicies = Number(count);

                for (let i = 0; i < numPolicies; i++) {
                    try {
                        const policyId = await contract.activePolicyIds(i);
                        const data = await contract.policies(policyId);

                        allPolicies.push({
                            policyId,
                            contractAddress: await contract.getAddress(),
                            productName: name,
                            policyholder: data[0],
                            premium: data[1],
                            maxPayout: data[2],
                            status: Number(data[3]),
                            expiresAt: data[4],
                            identifier: data[5] || '',
                        });
                    } catch {
                        // Skip individual policy read errors
                    }
                }
            } catch {
                // Contract may not be deployed yet
            }
        }

        return allPolicies;
    }

    async checkAndPerformUpkeep(productName: string): Promise<boolean> {
        const contract = this.enterpriseContracts.get(productName);
        if (!contract) return false;

        try {
            const [upkeepNeeded, performData] = await contract.checkUpkeep("0x");
            if (upkeepNeeded) {
                console.log(`[Keeper] ${productName}: Upkeep needed, performing...`);
                const tx = await contract.performUpkeep(performData);
                await tx.wait();
                console.log(`[Keeper] ${productName}: Upkeep complete.`);
                return true;
            }
        } catch (error: unknown) {
            console.error(`[Keeper] ${productName}: Error`, error instanceof Error ? error.message : String(error));
        }
        return false;
    }

    async executeEnterpriseClaim(productName: string, policyId: string, actualIndex: number): Promise<string> {
        const contract = this.enterpriseContracts.get(productName);
        if (!contract) throw new Error(`Unknown product: ${productName}`);

        return withRetry(async () => {
            const tx = await contract.executeClaim(policyId, actualIndex);
            const receipt = await tx.wait();
            return receipt.hash;
        });
    }

    async expirePolicy(productName: string, policyId: string): Promise<string> {
        const contract = this.enterpriseContracts.get(productName);
        if (!contract) throw new Error(`Unknown product: ${productName}`);

        return withRetry(async () => {
            const tx = await contract.expirePolicy(policyId);
            const receipt = await tx.wait();
            return receipt.hash;
        });
    }

    async submitExternalConsensus(productName: string, policyId: string, payout: string): Promise<string> {
        const contract = this.enterpriseContracts.get(productName);
        if (!contract) throw new Error(`Unknown product: ${productName}`);
        if (!this.escrow) throw new Error("Escrow contract not initialized for consensus");

        return withRetry(async () => {
            const contractAddress = await contract.getAddress();
            const tx = await this.escrow.submitExternalConsensus(contractAddress, policyId, payout);
            const receipt = await tx.wait();
            return receipt.hash;
        });
    }

    getWalletAddress(): string {
        return this.signer.address;
    }
}
