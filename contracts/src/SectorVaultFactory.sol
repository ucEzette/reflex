// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SectorVault.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title SectorVaultFactory
 * @notice Factory for deploying and managing SectorVault instances.
 */
contract SectorVaultFactory {
    address public implementation;
    address public owner;
    
    address[] public allVaults;
    mapping(string => address) public sectorToVault;

    event VaultDeployed(string sector, address vault);

    constructor(address _implementation) {
        implementation = _implementation;
        owner = msg.sender;
    }

    /**
     * @notice Deploys a new SectorVault via UUPS proxy.
     */
    function deployVault(
        string memory _sectorName,
        address _usdc,
        address _protocolTreasury,
        address _aavePool,
        address _aUsdc,
        address _quoter
    ) external returns (address) {
        require(msg.sender == owner, "Only owner");
        require(sectorToVault[_sectorName] == address(0), "Sector already exists");

        // Deploy Proxy
        ERC1967Proxy proxy = new ERC1967Proxy(
            implementation,
            abi.encodeWithSelector(
                SectorVault.initialize.selector,
                _sectorName,
                _usdc,
                _protocolTreasury,
                _aavePool,
                _aUsdc,
                _quoter
            )
        );

        address vaultProxy = address(proxy);
        allVaults.push(vaultProxy);
        sectorToVault[_sectorName] = vaultProxy;

        emit VaultDeployed(_sectorName, vaultProxy);
        return vaultProxy;
    }

    function getVaultCount() external view returns (uint256) {
        return allVaults.length;
    }
}
