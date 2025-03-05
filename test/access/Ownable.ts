import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Ownable", () => {
  const deployOwnableFixture = async () => {
    const [owner, otherAccount, newOwner] = await hre.ethers.getSigners();
    const Ownable = await hre.ethers.getContractFactory("Ownable");

    const ownable = await Ownable.deploy(owner);

    return { ownable, owner, otherAccount, newOwner };
  };

  it("Should set the owner upon deployment", async () => {
    const { ownable, owner } = await loadFixture(deployOwnableFixture);
    expect(await ownable.owner()).to.equal(owner);
  });

  it("Should allow the owner to transfer ownership", async () => {
    const { ownable, owner, newOwner } = await loadFixture(
      deployOwnableFixture
    );

    await expect(ownable.connect(owner).transferOwnership(newOwner))
      .to.emit(ownable, "OwnershipTransferred")
      .withArgs(owner, newOwner);

    expect(await ownable.owner()).to.equal(newOwner);
  });

  it("Should prevent non-owner from transferring ownership", async () => {
    const { ownable, otherAccount, newOwner } = await loadFixture(
      deployOwnableFixture
    );

    await expect(ownable.connect(otherAccount).transferOwnership(newOwner))
      .to.be.revertedWithCustomError(ownable, "OwnableUnauthorizedAccount")
      .withArgs(otherAccount);
  });

  it("Should allow the owner to renounce ownership", async () => {
    const { ownable, owner } = await loadFixture(deployOwnableFixture);

    await expect(ownable.connect(owner).renounceOwnership())
      .to.emit(ownable, "OwnershipTransferred")
      .withArgs(owner, hre.ethers.ZeroAddress);

    expect(await ownable.owner()).to.equal(hre.ethers.ZeroAddress);
  });

  it("Should prevent non-owner from renouncing ownership", async () => {
    const { ownable, otherAccount } = await loadFixture(deployOwnableFixture);

    await expect(ownable.connect(otherAccount).renounceOwnership())
      .to.be.revertedWithCustomError(ownable, "OwnableUnauthorizedAccount")
      .withArgs(otherAccount);
  });

  it("Should prevent transferring ownership to address(0)", async () => {
    const { ownable, owner } = await loadFixture(deployOwnableFixture);

    await expect(
      ownable.connect(owner).transferOwnership(hre.ethers.ZeroAddress)
    )
      .to.be.revertedWithCustomError(ownable, "OwnableInvalidOwner")
      .withArgs(hre.ethers.ZeroAddress);
  });
});
