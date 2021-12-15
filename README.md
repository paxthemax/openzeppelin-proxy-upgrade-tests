# openzeppelin-proxy-upgrade-tests

This repo contains boilerplate code and examples for testing upgradeability of [openzeppelin proxy contracts](https://docs.openzeppelin.com/contracts/4.x/api/proxy).

The purpose of these tests is to verify if the proxy upgrade maintains the integrity of contract storage - in other words if the upgraded contract still has the same values in variable slots.

The testing pattern requires minimal code support and can be used with any contract regardless of storage requirements.

## Dependencies

This test framweork uses [hardhat](https://hardhat.org) with the [hardhat-upgrades](https://docs.openzeppelin.com/upgrades-plugins/1.x/hardhat-upgrades) plugin and mocha tests.

To install dependencies, simply run `yarn`.

## Testing

Run `yarn test` to run the full test suite.

## Writing the upgrade test contract

Let's assume we are working off an existing contract `Foo.sol`:

```
contract Foo {
    uint256 public bar;
    bytes32 public baz;
    string public message;

    function setMessage(string memory _message) public { message = _message; }
}
```

To enable testing, we will need to write `FooV2.sol` (placing it in `contracts\test` or `contracts\mock`) that will inherit from `Foo`:

```
import "...Foo.sol";

contract FooV2 is Foo {
    // This function will check if the upgrade has passed will read out all storage slots
    function checkUpgrade() public view returns (
      string,  // We will use this to check if the upgrade has passed
      uint256,
      bytes32,
      string memory
    ) {
      return (
        "OK",
        bar,
        baz,
        message
      );
    }
}
```

The test framework expects that the test contract name is `<contract_to_test>V2`.

The test framework expects a `checkUpgrade()` public view function that returns:

- A string as the first return value (default "OK")
- All state variables, ideally in order

During the test, the framework will use this check:

- If the function exists on the upgraded contract
- If all state variables are present
- If any state variables have changed values

### Notes on private member access

If you wish to explicitly **private** state of a contract, you will need to create a mock contract as an intermediary, and then test the upgrade against the mock.

## Writing the test itself:

The proxy test framweork it located in `test\proxy\deployment.test.ts`.

To add your test to the framweork, you need to define a proxy test object:

```
const contractProxyTestParams = {
  name: "Foo", // This MUST be the name of the contract (without V2)
  initParams: [ ... ] // (optional) The parameters passed to the contract initializer
  upgradeCheckParams: [ ... ] // (optional) The state values expected after the upgrade
  beforeUpgrade: async (contractInstance: Contract) => { ... } // (optional) Functions to execute before upgrading
}

```

You should add this object to the `contractsToTest` object in the proxy test framework.

You should make sure that the `name` matches the contract name exactly, so that the framework can match it with the upgrade test contract.

Init parameters are values you would normally pass to the contract initializer. If your contract has state variables, you should determine what their values are after the deployment

The `beforeUpgrade` hook is optional. If you need to call functions on the contract, you can call them here.

Upgrade check parameters are sourced from the `checkUpgrade` function. The proxy test framework will check if the state values after the initialization (and the `beforeUpgrade` hook if it is present) are equal to the contract state after the upgrade. You should write the values of each state parameter in order as they apear.

The testing framework should automatically generate a "should be deployable" and "should be upgradeable" tests under the `Proxy upgradeability tests/<ContractName>` mocha tests. If written correctly, passing tests will confirm that the proxy upgrade has been successful.
