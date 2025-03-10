import { expect } from "chai";
import { ethers } from "hardhat";

describe("BookPaywallFactory", () => {
  async function deployBookPaywallFactoryFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const BookPaywallFactory = await ethers.getContractFactory(
      "BookPaywallFactory"
    );
    const bookPaywallFactory = await BookPaywallFactory.deploy();

    return { bookPaywallFactory, owner, otherAccount };
  }

  it("Should deploy BookPaywallFactory", async () => {
    const { bookPaywallFactory } = await deployBookPaywallFactoryFixture();

    expect(bookPaywallFactory).to.not.be.undefined;
  });

  it("Should create a new BookPaywall", async () => {
    const { bookPaywallFactory, owner } =
      await deployBookPaywallFactoryFixture();

    const bookNFT = ethers.Wallet.createRandom().address;
    const token = ethers.Wallet.createRandom().address;

    const tx = await bookPaywallFactory.createPaywall(bookNFT, token);
    const receipt = await tx.wait();
    const paywallAddress = receipt?.logs[0]?.address;

    expect(paywallAddress).to.not.equal(ethers.ZeroAddress);
  });

  it("Should store created BookPaywall in userPaywalls", async () => {
    const { bookPaywallFactory, owner } =
      await deployBookPaywallFactoryFixture();

    const bookNFT = ethers.Wallet.createRandom().address;
    const token = ethers.Wallet.createRandom().address;

    await bookPaywallFactory.createPaywall(bookNFT, token);

    const userPaywalls = await bookPaywallFactory.getUserPaywalls(
      owner.address
    );
    expect(userPaywalls.length).to.equal(1);
  });

  it("Should return correct userPaywalls", async () => {
    const { bookPaywallFactory, owner } =
      await deployBookPaywallFactoryFixture();

    const bookNFT = ethers.Wallet.createRandom().address;
    const token = ethers.Wallet.createRandom().address;

    const tx = await bookPaywallFactory.createPaywall(bookNFT, token);
    const receipt = await tx.wait();

    const event = receipt?.logs?.find((log) => {
      try {
        return (
          bookPaywallFactory?.interface?.parseLog(log)?.name ===
          "PaywallCreated"
        );
      } catch (e) {
        return false;
      }
    });

    const paywallAddress = event
      ? bookPaywallFactory?.interface?.parseLog(event)?.args.paywallAddress
      : null;

    expect(paywallAddress).to.not.be.null;

    const userPaywalls = await bookPaywallFactory.getUserPaywalls(
      owner.address
    );

    expect(userPaywalls[0]).to.equal(paywallAddress);
  });
});
