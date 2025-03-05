import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";

describe("ERC20Permit", () => {
  const deployERC20PermitFixture = async () => {
    const [owner, otherAccount, spender] = await hre.ethers.getSigners();
    const ERC20Permit = await hre.ethers.getContractFactory("MockERC20Permit");
    const erc20Permit = await ERC20Permit.deploy("TestToken", "TTK");

    return { erc20Permit, owner, otherAccount, spender };
  };

  it("should correctly return DOMAIN_SEPARATOR", async () => {
    const { erc20Permit } = await loadFixture(deployERC20PermitFixture);
    expect(await erc20Permit.DOMAIN_SEPARATOR()).to.be.a("string");
  });

  it("should correctly return nonces", async () => {
    const { erc20Permit, owner } = await loadFixture(deployERC20PermitFixture);
    expect(await erc20Permit.nonces(owner.address)).to.equal(0);
  });

  it("should correctly execute permit", async () => {
    const { erc20Permit, owner, spender } = await loadFixture(
      deployERC20PermitFixture
    );
    const value = ethers.parseUnits("10", 18);
    const deadline = Math.floor(Date.now() / 1000) + 3600;

    const { chainId } = await hre.ethers.provider.getNetwork();
    const domain = {
      name: "TestToken",
      version: "1",
      chainId,
      verifyingContract: (await erc20Permit.getAddress()) as string,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const nonce = await erc20Permit.nonces(owner.address);
    const message = {
      owner: owner.address,
      spender: spender.address,
      value,
      nonce,
      deadline,
    };

    const signature = await owner.signTypedData(domain, types, message);
    const { v, r, s } = ethers.Signature.from(signature);

    await expect(
      erc20Permit.permit(
        owner.address,
        spender.address,
        value,
        deadline,
        v,
        r,
        s
      )
    )
      .to.emit(erc20Permit, "Approval")
      .withArgs(owner.address, spender.address, value);
  });

  it("should increase nonce after permit execution", async () => {
    const { erc20Permit, owner, spender } = await loadFixture(
      deployERC20PermitFixture
    );
    const value = ethers.parseUnits("10", 18);
    const deadline = Math.floor(Date.now() / 1000) + 3600;

    const { chainId } = await hre.ethers.provider.getNetwork();
    const domain = {
      name: "TestToken",
      version: "1",
      chainId,
      verifyingContract: (await erc20Permit.getAddress()) as string,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const nonce = await erc20Permit.nonces(owner.address);
    const message = {
      owner: owner.address,
      spender: spender.address,
      value,
      nonce,
      deadline,
    };

    const signature = await owner.signTypedData(domain, types, message);
    const { v, r, s } = ethers.Signature.from(signature);

    await erc20Permit.permit(
      owner.address,
      spender.address,
      value,
      deadline,
      v,
      r,
      s
    );

    expect(await erc20Permit.nonces(owner.address)).to.equal(Number(nonce) + 1);
  });

  it("should reject expired permit", async () => {
    const { erc20Permit, owner, spender } = await loadFixture(
      deployERC20PermitFixture
    );
    const value = ethers.parseUnits("10", 18);
    const expiredDeadline = Math.floor(Date.now() / 1000) - 10;

    const { chainId } = await hre.ethers.provider.getNetwork();
    const domain = {
      name: "TestToken",
      version: "1",
      chainId,
      verifyingContract: (await erc20Permit.getAddress()) as string,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const nonce = await erc20Permit.nonces(owner.address);
    const message = {
      owner: owner.address,
      spender: spender.address,
      value,
      nonce,
      deadline: expiredDeadline,
    };

    const signature = await owner.signTypedData(domain, types, message);
    const { v, r, s } = ethers.Signature.from(signature);

    await expect(
      erc20Permit.permit(
        owner.address,
        spender.address,
        value,
        expiredDeadline,
        v,
        r,
        s
      )
    ).to.be.revertedWith("Expired deadline");
  });
});
