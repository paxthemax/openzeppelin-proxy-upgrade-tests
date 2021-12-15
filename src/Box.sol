// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Box is Initializable {
    uint256 public foo;
    bytes32 internal bar;
    string public baz;

    /// @dev Here we set the inital state of foo and bar
    function initialize(uint256 _foo, bytes32 _bar) public initializer {
        foo = _foo;
        bar = _bar;
    }

    /// @dev We set baz independently of init
    function setBaz(string memory _baz) public {
        baz = _baz;
    }
}
