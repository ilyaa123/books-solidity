import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ERC165", () => {
  const deployERC165Fixture = async () => {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ERC165 = await hre.ethers.getContractFactory("ERC165");

    const erc165 = await ERC165.deploy();

    return { erc165, owner, otherAccount };
  };

  it("Should support the ERC165 interface", async () => {
    const { erc165 } = await loadFixture(deployERC165Fixture);

    const interfaceId = "0x01ffc9a7";

    expect(await erc165.supportsInterface(interfaceId)).to.be.true;
  });

  it("Should not support invalid interface", async () => {
    const { erc165 } = await loadFixture(deployERC165Fixture);

    const interfaceId = "0xffffffff";

    expect(await erc165.supportsInterface(interfaceId)).to.be.false;
  });

  it("Should not support random interface", async () => {
    const { erc165 } = await loadFixture(deployERC165Fixture);

    const interfaceId = "0x12345678";

    expect(await erc165.supportsInterface(interfaceId)).to.be.false;
  });
});
