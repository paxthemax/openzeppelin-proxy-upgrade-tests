// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "../../Box.sol";

contract BoxV2 is Box {
    /// @dev We use this function to check each state variable after upgrade
    function checkUpgrade()
        public
        view
        returns (
            string memory, // Required for the test
            uint256, // foo
            bytes32, // bar
            string memory // baz
        )
    {
        return (
            "OK", // Should be the same value as in the test framework
            foo,
            bar,
            baz
        );
    }
}
