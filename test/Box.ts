import {expect} from './utils/chai-setup';
import {deployments, ethers, getUnnamedAccounts} from 'hardhat';
import {Box} from '../typechain';
import {setupUsers} from './utils';

const {BigNumber} = ethers;
const {AddressZero} = ethers.constants;
const {formatBytes32String: toBytes32} = ethers.utils;

const testCase = {
  foo: BigNumber.from('10101'),
  bar: toBytes32('0xdead'),
  baz: 'hello!',
};

const setup = deployments.createFixture(async ({deployments, ethers, upgrades}) => {
  await deployments.fixture();
  const boxFactory = await ethers.getContractFactory('Box');
  const contracts = {
    Box: (await upgrades.deployProxy(boxFactory, [testCase.foo, testCase.bar])) as Box,
  };
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
  };
});

describe('Box', async function () {
  it('should be deployed', async function () {
    const {Box} = await setup();
    expect(Box.address).to.not.eq(AddressZero);
  });
  it('should set the message', async function () {
    const {users, Box} = await setup();

    await users[0].Box.setBaz('foobar');
    expect(await Box.baz()).to.be.eq('foobar');
  });
});
