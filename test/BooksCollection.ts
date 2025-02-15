import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("BooksCollection", () => {
  const deployBooksCollectionFixture = async () => {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const BooksCollection = await hre.ethers.getContractFactory(
      "BooksCollection"
    );

    const booksCollection = await BooksCollection.deploy();

    return { booksCollection, owner, otherAccount };
  };

  it("Should support ERC721, ERC721Metadata, and ERC721Enumerable interfaces", async () => {
    const { booksCollection } = await loadFixture(deployBooksCollectionFixture);

    expect(await booksCollection.supportsInterface("0x80ac58cd")).to.be.true;
    expect(await booksCollection.supportsInterface("0x5b5e139f")).to.be.true;
    expect(await booksCollection.supportsInterface("0x780e9d63")).to.to.be.true;
  });

  describe("Minting and Retrieving Books", () => {
    it("Should successfully mint a book and store its metadata", async () => {
      const { booksCollection, owner } = await loadFixture(
        deployBooksCollectionFixture
      );

      const tokenId = 1;
      const book = {
        publicationYear: 2024,
        title: "Hardhat Guide",
        description: "A guide to Hardhat and Solidity.",
        author: "John Doe",
        isbn: "123-456-789",
        genres: ["Programming", "Blockchain"],
      };

      await booksCollection.mintBook(owner.address, tokenId, book, "0x");

      const storedBook = await booksCollection.getBook(tokenId);

      expect(storedBook.title).to.equal(book.title);
      expect(storedBook.author).to.equal(book.author);
      expect(storedBook.isbn).to.equal(book.isbn);
      expect(storedBook.publicationYear).to.equal(book.publicationYear);
      expect(storedBook.genres.length).to.equal(book.genres.length);
    });

    it("Should revert when trying to get a non-existent book", async () => {
      const { booksCollection } = await loadFixture(
        deployBooksCollectionFixture
      );

      await expect(booksCollection.getBook(999)).to.be.revertedWith(
        "Token does not exist!"
      );
    });
  });

  describe("Burning Books", () => {
    it("Should successfully burn a book and remove metadata", async () => {
      const { booksCollection, owner } = await loadFixture(
        deployBooksCollectionFixture
      );

      const tokenId = 2;
      const book = {
        publicationYear: 2025,
        title: "Solidity Advanced",
        description: "Deep dive into Solidity.",
        author: "Jane Doe",
        isbn: "987-654-321",
        genres: ["Smart Contracts", "Ethereum"],
      };

      await booksCollection.mintBook(owner.address, tokenId, book, "0x");
      await booksCollection.burnBook(tokenId);

      await expect(booksCollection.ownerOf(tokenId)).to.be.revertedWith(
        "Token does not exist!"
      );

      await expect(booksCollection.getBook(tokenId)).to.be.revertedWith(
        "Token does not exist!"
      );
    });

    it("Should revert when trying to burn a non-existent book", async () => {
      const { booksCollection } = await loadFixture(
        deployBooksCollectionFixture
      );

      await expect(booksCollection.burnBook(999)).to.be.revertedWith(
        "Token does not exist!"
      );
    });
  });
});
