import { ethers } from "ethers";
import { PolicyInfo } from "../types";
import { withRetry } from "../utils/retry";

const ESCROW_ABI = [
    "function getUserPolicies(address _user) view returns (bytes32[])",
    "function getPolicy(bytes32 _policyId) view returns (address policyholder, string apiTarget, uint256 premiumPaid, uint256 payoutAmount, uint256 expirationTime, bool isActive, bool isClaimed)",
    "event PolicyPurchased(bytes32 indexed policyId, address indexed policyholder, string apiTarget, uint256 premiumPaid, uint256 payoutAmount, uint256 expirationTime)",
    "function requestFlightStatus(bytes32 _policyId, string[] calldata _args) returns (bytes32)",
    "function authorizedRelayers(address _relayer) view returns (bool)",
    "function addRelayer(address _relayer) external"
];

export class BlockchainService {
    private readonly provider: ethers.JsonRpcProvider;
    private readonly signer: ethers.Wallet;
    private readonly escrow: ethers.Contract;

    constructor(
        rpcUrl: string,
        privateKey: string,
        private readonly escrowAddress: string
    ) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.signer = new ethers.Wallet(privateKey, this.provider);
        this.escrow = new ethers.Contract(escrowAddress, ESCROW_ABI, this.signer);
    }

    async ensureAuthorized(): Promise<void> {
        const address = this.getWalletAddress();
        const isAuthorized = await this.escrow.authorizedRelayers(address);

        if (!isAuthorized) {
            console.log(`[BlockchainService] Relayer ${address} is NOT authorized. Attempting to self-authorize...`);
            try {
                const tx = await this.escrow.addRelayer(address);
                await tx.wait();
                console.log(`[BlockchainService] Relayer ${address} successfully authorized.`);
            } catch (error: unknown) {
                console.error(`[BlockchainService] Failed to authorize relayer. Ensure this wallet is the contract owner or has been added manually. Error:`, error instanceof Error ? error.message : String(error));
            }
        } else {
            console.log(`[BlockchainService] Relayer ${address} is authorized.`);
        }
    }

    async getActivePolicies(lookbackBlocks: number = 2000): Promise<PolicyInfo[]> {
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

    getWalletAddress(): string {
        return this.signer.address;
    }
}
