// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";

contract EscrowScript is Script {
    Escrow public escrow;
    address arbiter = address(2);
    address payable beneficiary = payable(address(4));

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        escrow = new Escrow{ value: 1 ether }(arbiter, beneficiary);
        vm.stopBroadcast();
    }
}
