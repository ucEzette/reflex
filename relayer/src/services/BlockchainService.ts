import { ethers } from "ethers";
import { PolicyInfo } from "../types";
import { withRetry } from "../utils/retry";

const ESCROW_ABI = [
    "function getUserPolicies(address _user) view returns (bytes32[])",
    "function getPolicy(bytes32 _policyId) view returns (address policyholder, string apiTarget, uint256 premiumPaid, uint256 payoutAmount, uint256 expirationTime, bool isActive, bool isClaimed)",
    "event PolicyPurchased(bytes32 indexed policyId, address indexed policyholder, string apiTarget, uint256 premiumPaid, uint256 payoutAmount, uint256 expirationTime)",
];

const TELEPORTER_ABI = [
    "function sendCrossChainMessage((bytes32 destinationBlockchainID, address destinationAddress, (address feeTokenAddress, uint256 amount) feeInfo, uint256 requiredGasLimit, address[] allowedRelayerAddresses, bytes message) messageInput) returns (bytes32)",
];

export class BlockchainService {
    private readonly provider: ethers.JsonRpcProvider;
    private readonly signer: ethers.Wallet;
    private readonly escrow: ethers.Contract;
    private readonly teleporter: ethers.Contract;

    constructor(
        rpcUrl: string,
        privateKey: string,
        private readonly escrowAddress: string,
        private readonly teleporterAddress: string
    ) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.signer = new ethers.Wallet(privateKey, this.provider);
        this.escrow = new ethers.Contract(escrowAddress, ESCROW_ABI, this.provider);
        this.teleporter = new ethers.Contract(teleporterAddress, TELEPORTER_ABI, this.signer);
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

    async submitClaim(policyId: string, proof: Uint8Array): Promise<string> {
        return withRetry(async () => {
            const payload = ethers.AbiCoder.defaultAbiCoder().encode(
                ["bytes32", "bytes"],
                [policyId, proof]
            );

            const chainIdBytes32 = ethers.zeroPadValue(ethers.toBeHex(43113), 32);
            const messageInput = {
                destinationBlockchainID: chainIdBytes32,
                destinationAddress: this.escrowAddress,
                feeInfo: { feeTokenAddress: ethers.ZeroAddress, amount: 0n },
                requiredGasLimit: 300_000n,
                allowedRelayerAddresses: [],
                message: payload,
            };

            const tx = await this.teleporter.sendCrossChainMessage(messageInput);
            const receipt = await tx.wait();
            return receipt.hash;
        });
    }

    getWalletAddress(): string {
        return this.signer.address;
    }
}
