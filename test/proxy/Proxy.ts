import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Proxy", () => {
  async function deployProxyFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MockImplementationV1 = await hre.ethers.getContractFactory(
      "MockImplementationV1"
    );
    const implementationV1 = await MockImplementationV1.deploy();

    const MockMyProxy = await hre.ethers.getContractFactory("MockMyProxy");
    const proxy = await MockMyProxy.deploy(await implementationV1.getAddress());

    const proxiedImplementation = await hre.ethers.getContractAt(
      "MockImplementationV1",
      proxy
    );

    return {
      proxy,
      proxiedImplementation,
      implementationV1,
      owner,
      otherAccount,
    };
  }

  it("Should delegate calls to the implementation", async () => {
    const { proxiedImplementation } = await loadFixture(deployProxyFixture);

    await proxiedImplementation.setValue(100);
    expect(await proxiedImplementation.value()).to.equal(100);
  });

  it("Should upgrade the implementation and keep state", async () => {
    const { proxy, proxiedImplementation, owner } = await loadFixture(
      deployProxyFixture
    );

    await proxiedImplementation.setValue(150);
    expect(await proxiedImplementation.value()).to.equal(150);

    const MockImplementationV2 = await hre.ethers.getContractFactory(
      "MockImplementationV2"
    );
    const implementationV2 = await MockImplementationV2.deploy();

    await proxy.upgrade(await implementationV2.getAddress());

    const proxiedImplementationV2 = await hre.ethers.getContractAt(
      "MockImplementationV2",
      proxy
    );

    expect(await proxiedImplementationV2.value()).to.equal(150);

    await proxiedImplementationV2.setValue(200);
    expect(await proxiedImplementationV2.value()).to.equal(200);
  });

  it("Should support new functionality after upgrade", async () => {
    const { proxy, proxiedImplementation } = await loadFixture(
      deployProxyFixture
    );

    const MockImplementationV2 = await hre.ethers.getContractFactory(
      "MockImplementationV2"
    );
    const implementationV2 = await MockImplementationV2.deploy();

    await proxy.upgrade(implementationV2);

    const proxiedImplementationV2 = await hre.ethers.getContractAt(
      "MockImplementationV2",
      proxy
    );

    await proxiedImplementationV2.setValue(5);
    expect(await proxiedImplementationV2.value()).to.equal(5);

    await proxiedImplementationV2.increment();
    expect(await proxiedImplementationV2.value()).to.equal(6);
  });

  it("Should accept ETH", async () => {
    const { proxy, owner } = await loadFixture(deployProxyFixture);

    await owner.sendTransaction({
      to: proxy,
      value: hre.ethers.parseEther("1"),
    });

    const balance = await hre.ethers.provider.getBalance(proxy);
    expect(balance).to.equal(hre.ethers.parseEther("1"));
  });

  it("Should allow withdrawal of ETH", async () => {
    const { proxy, owner } = await loadFixture(deployProxyFixture);

    await owner.sendTransaction({
      to: proxy,
      value: hre.ethers.parseEther("1"),
    });

    const balanceBefore = await hre.ethers.provider.getBalance(owner.address);

    await proxy.withdrawETH(owner.address);

    const balanceAfter = await hre.ethers.provider.getBalance(owner.address);
    expect(balanceAfter).to.be.greaterThan(balanceBefore);
  });
});
