import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ERC721Enumerable Token Contract", () => {
  const loadERC721EnumerableFixture = async () => {
    const [owner, otherAccount, otherAccount2] = await hre.ethers.getSigners();

    const ERC721Enumerable = await hre.ethers.getContractFactory(
      "MockERC721Enumerable"
    );

    const erc721Enum = await ERC721Enumerable.deploy();

    const mint = async (params: { to: string; tokenIds: number[] }) => {
      await Promise.all(
        params.tokenIds.map((tokenId) => erc721Enum.mint(params.to, tokenId))
      );
    };

    const safeMint = async (params: {
      to: string;
      tokenIds: number[];
      data: string;
    }) => {
      await Promise.all(
        params.tokenIds.map((tokenId) =>
          erc721Enum.safeMint(params.to, tokenId, params.data)
        )
      );
    };

    return { erc721Enum, owner, otherAccount, otherAccount2, mint, safeMint };
  };

  it("Should return the total supply of tokens", async () => {
    const { otherAccount, otherAccount2, erc721Enum, mint } = await loadFixture(
      loadERC721EnumerableFixture
    );

    const tokens1 = [1, 2, 3],
      tokens2 = [4, 5, 6];

    await mint({
      to: otherAccount.address,
      tokenIds: tokens1,
    });

    await mint({
      to: otherAccount2.address,
      tokenIds: tokens2,
    });

    expect(await erc721Enum.totalSupply()).to.equal(
      [...tokens1, ...tokens2].length
    );
  });

  it("Should revert if token index is out of bounds", async () => {
    const { owner, erc721Enum, mint } = await loadFixture(
      loadERC721EnumerableFixture
    );

    const tokens = [1, 2, 3];

    await mint({
      to: owner.address,
      tokenIds: tokens,
    });

    await expect(erc721Enum.tokenByIndex(4)).to.be.revertedWith(
      "Index out of bounds"
    );
  });

  it("Should return token by index", async () => {
    const { otherAccount, otherAccount2, erc721Enum, mint } = await loadFixture(
      loadERC721EnumerableFixture
    );

    const index = 3;

    const tokens1 = [1, 2, 3];

    const tokens2 = [4, 5, 6];

    await mint({
      to: otherAccount.address,
      tokenIds: tokens1,
    });

    await mint({
      to: otherAccount2.address,
      tokenIds: tokens2,
    });

    expect(await erc721Enum.tokenByIndex(index)).to.equal(
      [...tokens1, ...tokens2][index]
    );
  });

  it("Should return token of owner by index", async () => {
    const { otherAccount, otherAccount2, erc721Enum, mint } = await loadFixture(
      loadERC721EnumerableFixture
    );

    const tokens1 = [1, 2, 3],
      index1 = 2;

    const tokens2 = [4, 5, 6],
      index2 = 1;

    await mint({
      to: otherAccount.address,
      tokenIds: tokens1,
    });

    expect(
      await erc721Enum.tokenOfOwnerByIndex(otherAccount, index1)
    ).to.be.equal(tokens1[index1]);

    await mint({
      to: otherAccount2.address,
      tokenIds: tokens2,
    });

    expect(
      await erc721Enum.tokenOfOwnerByIndex(otherAccount2, index2)
    ).to.be.equal(tokens2[index2]);
  });

  it("Should revert when token index of owner is out of bounds", async () => {
    const { otherAccount, erc721Enum, mint } = await loadFixture(
      loadERC721EnumerableFixture
    );

    const tokens = [1, 2];

    await mint({
      to: otherAccount.address,
      tokenIds: tokens,
    });

    await expect(
      erc721Enum.tokenOfOwnerByIndex(otherAccount.address, 2)
    ).to.be.revertedWith("Index out of bounds");
  });

  it("Should burn a token and update supply", async () => {
    const { otherAccount, erc721Enum, mint } = await loadFixture(
      loadERC721EnumerableFixture
    );

    const tokens = [1, 2, 3];

    await mint({
      to: otherAccount.address,
      tokenIds: tokens,
    });

    expect(await erc721Enum.totalSupply()).to.equal(tokens.length);

    await erc721Enum.connect(otherAccount).burn(tokens[tokens.length - 1]);

    expect(await erc721Enum.totalSupply()).to.equal(tokens.length - 1);

    expect(await erc721Enum.tokenByIndex(tokens.length - 2)).to.equal(
      tokens[tokens.length - 2]
    );

    expect(
      await erc721Enum.tokenOfOwnerByIndex(otherAccount, tokens.length - 2)
    ).to.equal(tokens[tokens.length - 2]);
  });

  it("Should correctly remove a token from the middle of the array in total supply", async () => {
    const { otherAccount, erc721Enum, mint } = await loadFixture(
      loadERC721EnumerableFixture
    );

    const tokens = [1, 2, 3, 4];

    await mint({
      to: otherAccount.address,
      tokenIds: tokens,
    });

    expect(await erc721Enum.totalSupply()).to.equal(tokens.length);

    await erc721Enum.connect(otherAccount).burn(tokens[1]);

    expect(await erc721Enum.totalSupply()).to.equal(tokens.length - 1);

    const lastToken = tokens[tokens.length - 1]; // Это токен 4
    expect(await erc721Enum.tokenByIndex(1)).to.equal(lastToken);
  });

  it("Should allow safe mint without contract owner", async () => {
    const { otherAccount, erc721Enum, safeMint } = await loadFixture(
      loadERC721EnumerableFixture
    );

    const tokens = [1, 2, 3];

    await safeMint({
      to: otherAccount.address,
      tokenIds: tokens,
      data: "0x",
    });

    expect(await erc721Enum.totalSupply()).to.equal(tokens.length);
  });

  it("Should revert if safe mint is done to a non-ERC721 receiver", async () => {
    const { safeMint } = await loadFixture(loadERC721EnumerableFixture);

    const MockNonERC721Receiver = await hre.ethers.getContractFactory(
      "MockNonERC721Receiver"
    );

    const nonERC721Receiver = await MockNonERC721Receiver.deploy();

    await expect(
      safeMint({
        to: await nonERC721Receiver.getAddress(),
        tokenIds: [1],
        data: "0x",
      })
    ).to.be.revertedWith("Non erc721 receiver!");
  });

  it("Should allow safe mint to a valid ERC721 receiver", async () => {
    const { erc721Enum, safeMint } = await loadFixture(
      loadERC721EnumerableFixture
    );

    const MockERC721Receiver = await hre.ethers.getContractFactory(
      "MockERC721Receiver"
    );

    const ERC721Receiver = await MockERC721Receiver.deploy();

    const tokens = [1, 2, 3];

    await safeMint({
      to: await ERC721Receiver.getAddress(),
      tokenIds: tokens,
      data: "0x",
    });

    expect(await erc721Enum.totalSupply()).to.equal(tokens.length);
  });
});
