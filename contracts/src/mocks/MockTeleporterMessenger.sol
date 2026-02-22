// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ITeleporterMessenger, TeleporterMessageInput} from "../interfaces/ITeleporterMessenger.sol";

contract MockTeleporterMessenger is ITeleporterMessenger {
    uint256 private _nonce;

    struct SentMessage {
        bytes32 destinationBlockchainID;
        address destinationAddress;
        bytes message;
    }

    SentMessage[] public sentMessages;

    event MessageSent(
        bytes32 indexed messageID,
        bytes32 indexed destinationBlockchainID,
        address destinationAddress
    );

    function sendCrossChainMessage(
        TeleporterMessageInput calldata messageInput
    ) external override returns (bytes32 messageID) {
        messageID = keccak256(
            abi.encodePacked(block.timestamp, msg.sender, _nonce++)
        );

        sentMessages.push(
            SentMessage({
                destinationBlockchainID: messageInput.destinationBlockchainID,
                destinationAddress: messageInput.destinationAddress,
                message: messageInput.message
            })
        );

        emit MessageSent(
            messageID,
            messageInput.destinationBlockchainID,
            messageInput.destinationAddress
        );
    }

    function getMessageHash(bytes32) external pure override returns (bytes32) {
        return bytes32(0);
    }

    function getSentMessagesCount() external view returns (uint256) {
        return sentMessages.length;
    }
}
