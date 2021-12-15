import {Contract, ContractFactory} from '@ethersproject/contracts';
import {expect} from 'chai';
import {ethers, upgrades} from 'hardhat';
import {beforeEach, describe, it} from 'mocha';
import {Box} from '../../typechain';

const {deployProxy, upgradeProxy} = upgrades;
const {BigNumber} = ethers;
const {formatBytes32String: toBytes32} = ethers.utils;

const upgradeText = 'OK';

const testCase = {
  foo: BigNumber.from('10101'),
  bar: toBytes32('0xdead'),
  baz: 'Hello!',
};

const contractsToTest = [
  {
    name: 'Box',
    initParams: [testCase.foo, testCase.bar],
    upgradeCheckParams: [testCase.foo, testCase.bar, testCase.baz],
    beforeUpgrade: async (contractInstance: Contract) => {
      const box = contractInstance as Box;
      await box.setBaz(testCase.baz);
    },
  },
];

describe('Proxy upgradeability tests', () => {
  contractsToTest.map((contract) => {
    const {name, initParams, upgradeCheckParams, beforeUpgrade} = contract;
    return describe(name, () => {
      let instance: Contract;
      let factory: ContractFactory;
      let factoryV2: ContractFactory;

      beforeEach(async () => {
        factory = await ethers.getContractFactory(name);
        factoryV2 = await ethers.getContractFactory(`${name}V2`);
      });

      it('should be deployable', async () => {
        instance = await deployProxy(factory, initParams);
      });

      it('should be upgradeable', async () => {
        instance = instance || (await deployProxy(factory, initParams));

        if (beforeUpgrade) {
          await beforeUpgrade(instance);
        }

        const upgradedInstance = await upgradeProxy(instance.address, factoryV2);

        expect(upgradedInstance.address).to.be.eq(instance.address);

        expect(upgradedInstance.checkUpgrade).to.not.eq(undefined);
        const upgradeResult = await upgradedInstance.checkUpgrade();

        if (typeof upgradeResult === 'string') {
          expect(upgradeResult).to.be.eq(upgradeText);
        } else {
          expect(upgradeResult[0]).to.be.eq(upgradeText);

          if (upgradeCheckParams && Array.isArray(upgradeCheckParams)) {
            for (let i = 0; i < upgradeCheckParams.length; i++) {
              const expected = upgradeCheckParams[i];
              const actual = upgradeResult[i + 1];
              expect(expected).to.eq(actual);
            }
          }
        }
      });
    });
  });
});
