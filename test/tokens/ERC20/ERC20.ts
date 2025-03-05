import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ERC20", () => {
  const deployERC20Fixture = async () => {
    const [owner, otherAccount, spender] = await hre.ethers.getSigners();
    const ERC20 = await hre.ethers.getContractFactory("MockERC20");
    const erc20 = await ERC20.deploy("TestToken", "TTK");

    return { erc20, owner, otherAccount, spender };
  };

  it("Should deploy with correct name, symbol, and decimals", async () => {
    const { erc20 } = await loadFixture(deployERC20Fixture);

    expect(await erc20.name()).to.equal("TestToken");
    expect(await erc20.symbol()).to.equal("TTK");
    expect(await erc20.decimals()).to.equal(8);
  });

  it("Should mint tokens correctly", async () => {
    const { erc20, otherAccount } = await loadFixture(deployERC20Fixture);
    const mintAmount = hre.ethers.parseUnits("100", 18);

    await erc20.mint(otherAccount.address, mintAmount);

    expect(await erc20.balanceOf(otherAccount.address)).to.equal(mintAmount);
    expect(await erc20.totalSupply()).to.equal(mintAmount);
  });

  it("Should burn tokens correctly", async () => {
    const { erc20, owner } = await loadFixture(deployERC20Fixture);
    const mintAmount = hre.ethers.parseUnits("100", 18);
    await erc20.mint(owner.address, mintAmount);

    await erc20.burn(mintAmount / 2n);

    expect(await erc20.balanceOf(owner.address)).to.equal(mintAmount / 2n);
    expect(await erc20.totalSupply()).to.equal(mintAmount / 2n);
  });

  it("Should transfer tokens successfully", async () => {
    const { erc20, owner, otherAccount } = await loadFixture(
      deployERC20Fixture
    );
    const mintAmount = hre.ethers.parseUnits("100", 18);
    await erc20.mint(owner.address, mintAmount);

    await erc20.transfer(otherAccount.address, mintAmount / 2n);

    expect(await erc20.balanceOf(owner.address)).to.equal(mintAmount / 2n);
    expect(await erc20.balanceOf(otherAccount.address)).to.equal(
      mintAmount / 2n
    );
  });

  it("Should fail transfer if sender has insufficient balance", async () => {
    const { erc20, otherAccount } = await loadFixture(deployERC20Fixture);

    await expect(
      erc20.transfer(otherAccount.address, hre.ethers.parseUnits("50", 18))
    ).to.be.revertedWithCustomError(erc20, "ERC20InsufficientBalance");
  });

  it("Should approve tokens correctly", async () => {
    const { erc20, owner, spender } = await loadFixture(deployERC20Fixture);
    const approveAmount = hre.ethers.parseUnits("30", 18);

    await erc20.approve(spender.address, approveAmount);
    expect(await erc20.allowance(owner.address, spender.address)).to.equal(
      approveAmount
    );
  });

  it("Should transferFrom successfully", async () => {
    const { erc20, owner, otherAccount, spender } = await loadFixture(
      deployERC20Fixture
    );
    const mintAmount = hre.ethers.parseUnits("100", 18);
    await erc20.mint(owner.address, mintAmount);
    await erc20.approve(spender.address, mintAmount / 2n);

    await erc20
      .connect(spender)
      .transferFrom(owner.address, otherAccount.address, mintAmount / 2n);

    expect(await erc20.balanceOf(otherAccount.address)).to.equal(
      mintAmount / 2n
    );
    expect(await erc20.allowance(owner.address, spender.address)).to.equal(0);
  });

  it("Should fail transferFrom if allowance is insufficient", async () => {
    const { erc20, owner, otherAccount, spender } = await loadFixture(
      deployERC20Fixture
    );
    const mintAmount = hre.ethers.parseUnits("50", 18);
    await erc20.mint(owner.address, mintAmount);

    await expect(
      erc20
        .connect(spender)
        .transferFrom(owner.address, otherAccount.address, mintAmount)
    ).to.be.revertedWithCustomError(erc20, "ERC20InsufficientAllowance");
  });

  it("Should allow infinite approval (type(uint256).max)", async () => {
    const { erc20, owner, spender } = await loadFixture(deployERC20Fixture);
    await erc20.approve(spender.address, hre.ethers.MaxUint256);
    expect(await erc20.allowance(owner.address, spender.address)).to.equal(
      hre.ethers.MaxUint256
    );

    await erc20.mint(owner.address, hre.ethers.parseUnits("100", 18));
    await erc20
      .connect(spender)
      .transferFrom(
        owner.address,
        spender.address,
        hre.ethers.parseUnits("10", 18)
      );
    expect(await erc20.allowance(owner.address, spender.address)).to.equal(
      hre.ethers.MaxUint256
    );
  });
});
