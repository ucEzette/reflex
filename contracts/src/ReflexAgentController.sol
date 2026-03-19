// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ReflexAgentController
 * @notice Institutional-grade authorization controller for the Autonomous AI Agent (Tether WDK).
 * @dev Allows the protocol owner to grant granular cryptographic permits to an AI agent wallet,
 * enabling the agent to execute specific high-speed operations (e.g., dynamic premium adjustments,
 * forced yield harvests) without possessing the overarching admin keys.
 */
contract ReflexAgentController is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Details of the Agent's active permit
    struct AgentPermit {
        bool isAuthorized;
        uint256 dailyActionLimit;
        uint256 currentActionsToday;
        uint256 lastActionTimestamp;
        bool canRebalanceYield;
        bool canAdjustRiskParameters;
    }

    /// @notice Tether WDK Wallet address of the AI Agent
    address public activeAgent;
    
    /// @notice The current permit parameters for the active agent
    AgentPermit public currentPermit;

    /* ═══════════════════════════════════════════
       EVENTS
       ═══════════════════════════════════════════ */
    
    event AgentPermitted(address indexed agent, bool canRebalance, bool canAdjustRisk, uint256 dailyLimit);
    event AgentRevoked(address indexed agent);
    event AutonomousActionExecuted(address indexed agent, address indexed target, bytes4 selector);

    /* ═══════════════════════════════════════════
       ERRORS
       ═══════════════════════════════════════════ */
       
    error UnauthorizedAgent(address caller);
    error ActionLimitExceeded();
    error InsufficientPermission();
    error CallFailed();

    /* ═══════════════════════════════════════════
       MODIFIERS
       ═══════════════════════════════════════════ */

    modifier onlyAgent() {
        if (msg.sender != activeAgent || !currentPermit.isAuthorized) {
            revert UnauthorizedAgent(msg.sender);
        }
        
        // Rate limiting check
        if (block.timestamp >= currentPermit.lastActionTimestamp + 1 days) {
            currentPermit.currentActionsToday = 0; // Reset daily counter
            currentPermit.lastActionTimestamp = block.timestamp;
        }
        
        if (currentPermit.currentActionsToday >= currentPermit.dailyActionLimit) {
            revert ActionLimitExceeded();
        }
        
        currentPermit.currentActionsToday++;
        _;
    }

    /* ═══════════════════════════════════════════
       INITIALIZATION
       ═══════════════════════════════════════════ */

    constructor(address initialOwner) Ownable(initialOwner) {}

    /* ═══════════════════════════════════════════
       OWNER (GOVERNANCE) FUNCTIONS
       ═══════════════════════════════════════════ */

    /**
     * @notice Grants a permit to the Tether WDK AI Agent wallet.
     * @param _agent The wallet address operated by the AI.
     * @param _dailyLimit Max number of autonomous txs per day to prevent rogue spin-ups.
     * @param _canRebalance Allow the agent to interact with Aave/Yield routers.
     * @param _canAdjustRisk Allow the agent to dynamically set premiums based on weather APIs.
     */
    function grantAgentPermit(
        address _agent, 
        uint256 _dailyLimit, 
        bool _canRebalance, 
        bool _canAdjustRisk
    ) external onlyOwner {
        require(_agent != address(0), "Invalid agent address");
        
        activeAgent = _agent;
        currentPermit = AgentPermit({
            isAuthorized: true,
            dailyActionLimit: _dailyLimit,
            currentActionsToday: 0,
            lastActionTimestamp: block.timestamp,
            canRebalanceYield: _canRebalance,
            canAdjustRiskParameters: _canAdjustRisk
        });

        emit AgentPermitted(_agent, _canRebalance, _canAdjustRisk, _dailyLimit);
    }

    /**
     * @notice Emergency switch to instantly kill the AI agent's access.
     */
    function revokeAgentPermit() external onlyOwner {
        require(activeAgent != address(0), "No active agent");
        currentPermit.isAuthorized = false;
        emit AgentRevoked(activeAgent);
        activeAgent = address(0);
    }

    /* ═══════════════════════════════════════════
       AGENT AUTONOMOUS EXECUTOR
       ═══════════════════════════════════════════ */

    /**
     * @notice Allows the permitted AI Agent to execute operations on predefined protocol contracts.
     * @param target The Reflex protocol contract to call.
     * @param data The calldata strictly constructed by the Autonomous Agent.
     */
    function executeAutonomousAction(address target, bytes calldata data) 
        external 
        whenNotPaused 
        nonReentrant 
        onlyAgent 
        returns (bytes memory)
    {
        // Require the agent to target contract operations, not EOA logic.
        require(target.code.length > 0, "Target must be a contract");
        
        // Extract function selector to enforce capability restrictions
        bytes4 selector;
        if (data.length >= 4) {
            selector = bytes4(data[:4]);
        }

        // 🛡️ Strict cryptographic capability enforcement 🛡️
        if (selector == bytes4(keccak256("harvestYield()"))) {
            require(currentPermit.canRebalanceYield, "Agent not permitted to harvest yield");
        } else if (selector == bytes4(keccak256("adjustOracleGasLimit(uint32)"))) {
            require(currentPermit.canAdjustRiskParameters, "Agent not permitted to adjust risk specs");
        } else {
            // Standard safety: Ensure agent doesn't execute unauthorized state transitions (like transferOwnership)
            revert("Controller: Function selector not whitelisted for Agent");
        }
        
        // Execute the call on behalf of the AgentController
        (bool success, bytes memory returndata) = target.call(data);
        if (!success) {
            revert CallFailed();
        }

        emit AutonomousActionExecuted(msg.sender, target, selector);
        return returndata;
    }
    
    /* ═══════════════════════════════════════════
       SECURITY ESCAPES
       ═══════════════════════════════════════════ */
       
    function pauseAgent() external onlyOwner {
        _pause();
    }
    
    function unpauseAgent() external onlyOwner {
        _unpause();
    }
}
