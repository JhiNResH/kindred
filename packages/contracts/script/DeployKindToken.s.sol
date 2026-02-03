// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

interface IMintClubBond {
    struct TokenParams {
        string name;
        string symbol;
    }
    
    struct BondParams {
        uint16 mintRoyalty;
        uint16 burnRoyalty;
        address reserveToken;
        uint128 maxSupply;
        uint128[] stepRanges;
        uint128[] stepPrices;
    }
    
    function createToken(
        TokenParams calldata tp,
        BondParams calldata bp
    ) external payable returns (address token);
    
    function creationFee() external view returns (uint256);
}

/**
 * @title DeployKindToken
 * @notice Deploy KIND token on Base using Mint Club V2
 * @dev Run: forge script script/DeployKindToken.s.sol --rpc-url base --broadcast
 */
contract DeployKindToken is Script {
    // Mint Club V2 on Base
    address constant MCV2_BOND = 0xc5a076cad94176c2996B32d8466Be1cE757FAa27;
    address constant OPENWORK = 0x299c30DD5974BF4D5bFE42C340Ca40462816AB07;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        IMintClubBond bond = IMintClubBond(MCV2_BOND);
        
        // Token params
        IMintClubBond.TokenParams memory tp = IMintClubBond.TokenParams({
            name: "Kindred Token",
            symbol: "KIND"
        });
        
        // Bond params (from spec)
        uint128[] memory stepRanges = new uint128[](3);
        stepRanges[0] = 100_000 ether;   // 0-100k
        stepRanges[1] = 500_000 ether;   // 100k-500k  
        stepRanges[2] = 1_000_000 ether; // 500k-1M
        
        uint128[] memory stepPrices = new uint128[](3);
        stepPrices[0] = 0.001 ether;  // 0.001 OPENWORK
        stepPrices[1] = 0.005 ether;  // 0.005 OPENWORK
        stepPrices[2] = 0.01 ether;   // 0.01 OPENWORK
        
        IMintClubBond.BondParams memory bp = IMintClubBond.BondParams({
            mintRoyalty: 100,      // 1%
            burnRoyalty: 100,      // 1%
            reserveToken: OPENWORK,
            maxSupply: 1_000_000 ether,
            stepRanges: stepRanges,
            stepPrices: stepPrices
        });
        
        // Get creation fee
        uint256 fee = bond.creationFee();
        console.log("Creation fee:", fee);
        
        // Create token
        address token = bond.createToken{value: fee}(tp, bp);
        
        console.log("KIND Token deployed at:", token);
        console.log("Mint Club URL: https://mint.club/token/base/KIND");
        
        vm.stopBroadcast();
    }
}
