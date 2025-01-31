import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ERC721Metadata Token Contract", () => {
  const loadERC721MetadataFixture = async () => {
    const load = async (name: string, symbol: string, tokenURI: string) => {
      const ERC721Metadata = await hre.ethers.getContractFactory(
        "MockERC721Metadata"
      );

      const erc721Meta = await ERC721Metadata.deploy(name, symbol, tokenURI);

      return { erc721Meta };
    };
    const [owner] = await hre.ethers.getSigners();

    return { owner, load };
  };

  it("Should correctly set metadata for the ERC721 token", async () => {
    const name = "name";
    const symbol = "symbol";
    const url = "https://test.com/";

    const tokenId = 2;

    const { owner, load } = await loadFixture(loadERC721MetadataFixture);

    const { erc721Meta } = await load(name, symbol, url);

    await erc721Meta.mint(owner, tokenId);

    expect(await erc721Meta.name()).to.equal(name);
    expect(await erc721Meta.symbol()).to.equal(symbol);
    expect(await erc721Meta.tokenURI(tokenId)).to.equal(url + `${tokenId}`);
  });

  it("Should revert when token URI is requested for a non-minted token", async () => {
    const name = "name";
    const symbol = "symbol";
    const url = "https://test.com/";

    const { load } = await loadFixture(loadERC721MetadataFixture);

    const { erc721Meta } = await load(name, symbol, url);

    await expect(erc721Meta.tokenURI(2)).to.be.revertedWith(
      "Token does not exist!"
    );
  });

  it("Should return empty URL when token URI is not set", async () => {
    const name = "name";
    const symbol = "symbol";
    const url = "";

    const tokenId = 2;

    const { owner, load } = await loadFixture(loadERC721MetadataFixture);

    const { erc721Meta } = await load(name, symbol, url);

    await erc721Meta.mint(owner, tokenId);

    expect(await erc721Meta.tokenURI(tokenId)).to.equal(url);
  });
});
