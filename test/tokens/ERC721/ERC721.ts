import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ERC721 Token Contract", () => {
  const loadERC721Fixture = async () => {
    const [owner, otherAccount, otherAccount2] = await hre.ethers.getSigners();

    const ERC721 = await hre.ethers.getContractFactory("MockERC721");

    const erc721 = await ERC721.deploy();

    const mint = (to: string, tokenId: number) => {
      return erc721.mint(to, tokenId);
    };

    const safeMint = (to: string, tokenId: number, data: string) => {
      return erc721.safeMint(to, tokenId, data);
    };

    return { erc721, owner, otherAccount, otherAccount2, mint, safeMint };
  };

  describe("Minting and Burning Tokens", () => {
    it("Should successfully mint a new token and verify ownership", async () => {
      const { erc721, owner, mint } = await loadFixture(loadERC721Fixture);

      const tokenId = 2;

      await mint(owner.address, tokenId);

      expect(await erc721.ownerOf(tokenId)).to.equal(owner.address);

      expect(await erc721.balanceOf(owner)).to.equal(1);

      await expect(mint(owner.address, tokenId)).to.be.revertedWith(
        "Token already minted"
      );
    });

    it("Should safely mint a token and verify ownership", async () => {
      const { erc721, owner, safeMint } = await loadFixture(loadERC721Fixture);

      const tokenId = 2;

      await safeMint(owner.address, tokenId, "0x");

      expect(await erc721.ownerOf(tokenId)).to.equal(owner.address);

      expect(await erc721.balanceOf(owner)).to.equal(1);

      await expect(safeMint(owner.address, tokenId, "0x")).to.be.revertedWith(
        "Token already minted"
      );
    });

    it("Should prevent minting a token to the zero address", async () => {
      const { mint } = await loadFixture(loadERC721Fixture);

      const tokenId = 2;

      await expect(mint(hre.ethers.ZeroAddress, tokenId)).to.be.revertedWith(
        "Mint to the zero address"
      );
    });

    it("Should prevent safe minting a token to the zero address", async () => {
      const { safeMint } = await loadFixture(loadERC721Fixture);

      const tokenId = 2;

      await expect(
        safeMint(hre.ethers.ZeroAddress, tokenId, "0x")
      ).to.be.revertedWith("Mint to the zero address");
    });

    it("Without receiver", async () => {
      const { safeMint } = await loadFixture(loadERC721Fixture);

      const MockNonERC721Receiver = await hre.ethers.getContractFactory(
        "MockNonERC721Receiver"
      );

      const mockNonERC721Receiver = await MockNonERC721Receiver.deploy();

      const tokenId = 2;

      await expect(
        safeMint(await mockNonERC721Receiver.getAddress(), tokenId, "0x")
      ).to.revertedWith("Non erc721 receiver!");
    });

    it("With receiver", async () => {
      const { erc721, safeMint } = await loadFixture(loadERC721Fixture);

      const MockERC721Receiver = await hre.ethers.getContractFactory(
        "MockERC721Receiver"
      );

      const mockERC721Receiver = await MockERC721Receiver.deploy();

      const mockERC721ReceiverAddress = await mockERC721Receiver.getAddress();

      const tokenId = 2;

      await expect(safeMint(mockERC721ReceiverAddress, tokenId, "0x"))
        .to.emit(erc721, "Transfer")
        .withArgs(hre.ethers.ZeroAddress, mockERC721ReceiverAddress, tokenId);

      expect(await erc721.ownerOf(tokenId)).to.equal(mockERC721ReceiverAddress);
      expect(await erc721.balanceOf(mockERC721ReceiverAddress)).to.equal(1);
    });

    it("Should burn reverted with not owner", async () => {
      const { erc721, owner, otherAccount, mint } = await loadFixture(
        loadERC721Fixture
      );

      const tokenId = 2;

      await mint(owner.address, tokenId);

      await expect(
        erc721.connect(otherAccount).burn(tokenId)
      ).to.be.revertedWith("Not an owner or approved!");
    });

    it("Should success burned", async () => {
      const { erc721, owner, mint } = await loadFixture(loadERC721Fixture);

      const tokenId = 2;

      await mint(owner.address, tokenId);

      await erc721.connect(owner).burn(tokenId);

      await expect(erc721.ownerOf(tokenId)).to.be.revertedWith(
        "Token does not exist!"
      );

      expect(await erc721.balanceOf(owner)).to.be.equal(0);
    });
  });

  describe("Transfers", () => {
    it("Should revert when transferring a non-existent token", async () => {
      const { erc721, otherAccount, otherAccount2 } = await loadFixture(
        loadERC721Fixture
      );

      const tokenId = 2;

      await expect(
        erc721.transferFrom(otherAccount, otherAccount2, tokenId)
      ).to.be.revertedWith("Token does not exist!");
    });

    it("Should revert when transfer is attempted by a non-owner", async () => {
      const { erc721, mint, otherAccount, otherAccount2 } = await loadFixture(
        loadERC721Fixture
      );

      const tokenId = 2;

      await mint(otherAccount.address, tokenId);

      await expect(
        erc721.transferFrom(otherAccount, otherAccount2, tokenId)
      ).to.be.revertedWith("Not an owner or approved!");
    });

    it("Should allow a valid owner to transfer a token successfully", async () => {
      const { erc721, mint, otherAccount, otherAccount2 } = await loadFixture(
        loadERC721Fixture
      );

      const tokenId = 2;

      await mint(otherAccount.address, tokenId);

      await erc721
        .connect(otherAccount)
        .transferFrom(otherAccount, otherAccount2, tokenId);

      expect(await erc721.ownerOf(tokenId)).to.equal(otherAccount2);
      expect(await erc721.balanceOf(otherAccount2)).to.equal(1);
    });
  });

  describe("Safe Transfers", () => {
    it("Should revert when attempting to safely transfer a non-existent token", async () => {
      const { erc721, otherAccount, otherAccount2 } = await loadFixture(
        loadERC721Fixture
      );

      const tokenId = 2;

      await expect(
        erc721["safeTransferFrom(address,address,uint256,bytes)"](
          otherAccount,
          otherAccount2,
          tokenId,
          "0x"
        )
      ).to.be.revertedWith("Token does not exist!");
    });

    it("Should revert when a non-owner attempt a safe transfer", async () => {
      const { erc721, mint, otherAccount, otherAccount2 } = await loadFixture(
        loadERC721Fixture
      );

      const tokenId = 2;

      await mint(otherAccount.address, tokenId);

      await expect(
        erc721["safeTransferFrom(address,address,uint256,bytes)"](
          otherAccount,
          otherAccount2,
          tokenId,
          "0x"
        )
      ).to.be.revertedWith("Not an owner or approved!");
    });

    it("Should allow a valid owner to transfer a token successfully", async () => {
      const { erc721, mint, otherAccount, otherAccount2 } = await loadFixture(
        loadERC721Fixture
      );

      const tokenId = 2;

      await mint(otherAccount.address, tokenId);

      await erc721
        .connect(otherAccount)
        ["safeTransferFrom(address,address,uint256,bytes)"](
          otherAccount,
          otherAccount2,
          tokenId,
          "0x"
        );

      expect(await erc721.ownerOf(tokenId)).to.equal(otherAccount2);
      expect(await erc721.balanceOf(otherAccount2)).to.equal(1);
    });

    it("Should revert safeTransferFrom when recipient contract does not implement ERC721Receiver", async () => {
      const { erc721, otherAccount, mint } = await loadFixture(
        loadERC721Fixture
      );

      const MockNonERC721Receiver = await hre.ethers.getContractFactory(
        "MockNonERC721Receiver"
      );

      const mockNonERC721Receiver = await MockNonERC721Receiver.deploy();

      const tokenId = 2;

      await mint(otherAccount.address, tokenId);

      await expect(
        erc721
          .connect(otherAccount)
          ["safeTransferFrom(address,address,uint256,bytes)"](
            otherAccount,
            await mockNonERC721Receiver.getAddress(),
            tokenId,
            "0x"
          )
      ).to.be.revertedWith("Non erc721 receiver!");
    });

    it("Should successfully transfer token to a contract implementing ERC721Receiver", async () => {
      const { erc721, otherAccount, mint } = await loadFixture(
        loadERC721Fixture
      );

      const MockERC721Receiver = await hre.ethers.getContractFactory(
        "MockERC721Receiver"
      );

      const mockERC721Receiver = await MockERC721Receiver.deploy();

      const mockERC721ReceiverAddres = await mockERC721Receiver.getAddress();

      const tokenId = 2;

      await mint(otherAccount.address, tokenId);

      await expect(
        erc721
          .connect(otherAccount)
          ["safeTransferFrom(address,address,uint256,bytes)"](
            otherAccount,
            mockERC721ReceiverAddres,
            tokenId,
            "0x"
          )
      )
        .to.emit(erc721, "Transfer")
        .withArgs(otherAccount, mockERC721ReceiverAddres, tokenId);

      expect(await erc721.ownerOf(tokenId)).to.equal(mockERC721ReceiverAddres);
      expect(await erc721.balanceOf(mockERC721ReceiverAddres)).to.equal(1);
    });
  });

  describe("Token Approval Functionality", () => {
    it("Should prevent approving a non-existent token", async () => {
      const { erc721, otherAccount } = await loadFixture(loadERC721Fixture);

      const tokenId = 2;

      await expect(erc721.approve(otherAccount, tokenId)).to.be.revertedWith(
        "Token does not exist!"
      );
    });

    it("Should prevent approving the owner themselves", async () => {
      const { erc721, owner, mint } = await loadFixture(loadERC721Fixture);

      const tokenId = 2;
      await mint(owner.address, tokenId);

      await expect(
        erc721.connect(owner).approve(owner.address, tokenId)
      ).to.be.revertedWith("Cannot approve to self");
    });

    it("Should allow the owner to approve another account", async () => {
      const { erc721, owner, otherAccount, mint } = await loadFixture(
        loadERC721Fixture
      );

      const tokenId = 2;
      await mint(owner.address, tokenId);

      await erc721.connect(owner).approve(otherAccount, tokenId);

      expect(await erc721.getApproved(tokenId)).to.equal(otherAccount);
    });

    it("Should allow the owner to approve another account and burning", async () => {
      const { erc721, owner, otherAccount, mint } = await loadFixture(
        loadERC721Fixture
      );

      const tokenId = 2;
      await mint(owner.address, tokenId);

      await erc721.connect(owner).approve(otherAccount, tokenId);

      await erc721.connect(otherAccount).burn(tokenId);

      await expect(erc721.ownerOf(tokenId)).to.be.revertedWith(
        "Token does not exist!"
      );

      await expect(erc721.getApproved(tokenId)).to.be.revertedWith(
        "Token does not exist!"
      );

      expect(await erc721.balanceOf(owner)).to.be.equal(0);
    });

    describe("Approved transfers", () => {
      it("Should revert if an approved address tries to transfer a token they do not own", async () => {
        const { erc721, owner, otherAccount, otherAccount2, mint } =
          await loadFixture(loadERC721Fixture);

        const tokenId = 2;
        await mint(owner.address, tokenId);

        await erc721.connect(owner).approve(otherAccount, tokenId);

        await expect(
          erc721
            .connect(otherAccount)
            .transferFrom(otherAccount, otherAccount2, tokenId)
        ).to.be.revertedWith("Not an owner!");
      });

      it("Should revert if a transfer is attempted to the zero address", async () => {
        const { erc721, owner, otherAccount, mint } = await loadFixture(
          loadERC721Fixture
        );

        const tokenId = 2;
        await mint(owner.address, tokenId);

        await erc721.connect(owner).approve(otherAccount, tokenId);

        await expect(
          erc721
            .connect(otherAccount)
            .transferFrom(owner, hre.ethers.ZeroAddress, tokenId)
        ).to.be.revertedWith("To cannot be zero address!");
      });

      it("Should revert if a transfer is attempted to the same address as the sender", async () => {
        const { erc721, owner, otherAccount, otherAccount2, mint } =
          await loadFixture(loadERC721Fixture);

        const tokenId = 2;
        await mint(owner.address, tokenId);

        await erc721.connect(owner).approve(otherAccount, tokenId);

        await expect(
          erc721.connect(otherAccount).transferFrom(owner, owner, tokenId)
        ).to.be.revertedWith("Transfer to the same address!");
      });

      it("Should allow an approved address to transfer a token to another address", async () => {
        const { erc721, owner, otherAccount, otherAccount2, mint } =
          await loadFixture(loadERC721Fixture);

        const tokenId = 2;
        await mint(owner.address, tokenId);

        await erc721.connect(owner).approve(otherAccount, tokenId);

        await erc721
          .connect(otherAccount)
          .transferFrom(owner, otherAccount2, tokenId);

        expect(await erc721.ownerOf(tokenId)).to.be.equal(otherAccount2);
        expect(await erc721.balanceOf(otherAccount2)).to.be.equal(1);
      });
    });
  });

  describe("Token Approval For All Functionality", () => {
    it("Should prevent approving oneself as an operator", async () => {
      const { erc721, otherAccount } = await loadFixture(loadERC721Fixture);

      await expect(
        erc721.connect(otherAccount).setApprovalForAll(otherAccount, true)
      ).to.be.revertedWith("You cannot approve yourself!");
    });

    it("Should allow setting and revoking approval for an operator", async () => {
      const { erc721, owner, otherAccount } = await loadFixture(
        loadERC721Fixture
      );

      await erc721.connect(owner).setApprovalForAll(otherAccount, true);
      expect(await erc721.isApprovedForAll(owner, otherAccount)).to.be.true;

      await erc721.connect(owner).setApprovalForAll(otherAccount, false);
      expect(await erc721.isApprovedForAll(owner, otherAccount)).to.be.false;
    });

    it("Should approving an approved for all operator ", async () => {
      const { erc721, owner, otherAccount, otherAccount2 } = await loadFixture(
        loadERC721Fixture
      );

      const tokenId = 2;

      await erc721.mint(owner, tokenId);

      await erc721.connect(owner).setApprovalForAll(otherAccount, true);

      await erc721.connect(otherAccount).approve(otherAccount2, tokenId);

      expect(await erc721.getApproved(tokenId)).to.be.equal(otherAccount2);
    });

    it("Should prevent approving oneself as an operator and burning", async () => {
      const { erc721, owner, otherAccount, mint } = await loadFixture(
        loadERC721Fixture
      );

      const tokenId = 2;
      await mint(owner.address, tokenId);

      await erc721.connect(owner).setApprovalForAll(otherAccount, true);

      await erc721.connect(otherAccount).burn(tokenId);

      await expect(erc721.ownerOf(tokenId)).to.be.revertedWith(
        "Token does not exist!"
      );
      expect(await erc721.balanceOf(owner)).to.be.equal(0);
    });

    describe("Approved All transfers", () => {
      it("Should allow an approved all address to transfer a token to another address", async () => {
        const { erc721, owner, otherAccount, otherAccount2, mint } =
          await loadFixture(loadERC721Fixture);

        const tokenId = 2;
        await mint(owner.address, tokenId);

        await erc721.connect(owner).setApprovalForAll(otherAccount, true);

        await erc721
          .connect(otherAccount)
          .transferFrom(owner, otherAccount2, tokenId);

        expect(await erc721.ownerOf(tokenId)).to.be.equal(otherAccount2);
        expect(await erc721.balanceOf(otherAccount2)).to.be.equal(1);
      });
    });
  });
});
