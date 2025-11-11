import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { HypeChain } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("HypeChain", function () {
  let hypeChain: HypeChain;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, alice, bob] = await ethers.getSigners();

    // Deploy contract
    const HypeChainFactory = await ethers.getContractFactory("HypeChain");
    hypeChain = await HypeChainFactory.deploy();
  });

  describe("Content Creation", function () {
    it("Should create content and emit event", async function () {
      const contentURI = "ipfs://QmTest123";

      await expect(hypeChain.createContent(contentURI))
        .to.emit(hypeChain, "ContentCreated")
        .to.emit(hypeChain, "ShareCreated");

      const content = await hypeChain.getContent(1);
      expect(content.creator).to.equal(owner.address);
      expect(content.contentURI).to.equal(contentURI);
    });

    it("Should create initial share for creator (depth 0)", async function () {
      await hypeChain.createContent("ipfs://test");

      const share = await hypeChain.getShare(1);
      expect(share.sharer).to.equal(owner.address);
      expect(share.depth).to.equal(0);
      expect(share.parentShareId).to.equal(0);
    });
  });

  describe("Viral Share Chain", function () {
    beforeEach(async function () {
      // Owner creates content (contentId=1, shareId=1)
      await hypeChain.createContent("ipfs://viral-meme");
    });

    it("Should create share with parent (Alice shares via creator)", async function () {
      // Alice shares via creator's link (shareId=1)
      await expect(hypeChain.connect(alice).createShare(1, 1))
        .to.emit(hypeChain, "ShareCreated");

      const aliceShare = await hypeChain.getShare(2);
      expect(aliceShare.sharer).to.equal(alice.address);
      expect(aliceShare.parentShareId).to.equal(1); // Creator's share
      expect(aliceShare.depth).to.equal(1); // One level deep
    });

    it("Should track viral chain: Creator → Alice → Bob", async function () {
      // Alice shares via creator (depth 1)
      await hypeChain.connect(alice).createShare(1, 1);

      // Bob shares via Alice (depth 2)
      await hypeChain.connect(bob).createShare(1, 2);

      const bobShare = await hypeChain.getShare(3);
      expect(bobShare.sharer).to.equal(bob.address);
      expect(bobShare.parentShareId).to.equal(2); // Alice's share
      expect(bobShare.depth).to.equal(2); // Two levels deep
    });

    it("Should increment total shares count", async function () {
      // Alice shares
      await hypeChain.connect(alice).createShare(1, 1);
      
      // Bob shares
      await hypeChain.connect(bob).createShare(1, 2);

      const content = await hypeChain.getContent(1);
      expect(content.totalShares).to.equal(2); // Alice + Bob (creator doesn't count as additional)
    });
  });

  describe("Engagements", function () {
    beforeEach(async function () {
      await hypeChain.createContent("ipfs://test");
    });

    it("Should record engagement and emit event", async function () {
      await expect(hypeChain.connect(alice).recordEngagement(1, "click"))
        .to.emit(hypeChain, "EngagementRecorded")
        .withArgs(1, 1, alice.address, "click", await ethers.provider.getBlock('latest').then(b => b!.timestamp + 1));
    });

    it("Should fail for non-existent share", async function () {
      await expect(hypeChain.recordEngagement(999, "view"))
        .to.be.revertedWith("Share does not exist");
    });
  });

  describe("View Functions", function () {
    it("Should return correct counters", async function () {
      await hypeChain.createContent("ipfs://test1");
      await hypeChain.createContent("ipfs://test2");
      await hypeChain.connect(alice).createShare(1, 1);

      const counters = await hypeChain.getCounters();
      expect(counters.totalContents).to.equal(2);
      expect(counters.totalShares).to.equal(3); // 2 creator shares + 1 Alice share
    });

    it("Should fail to get non-existent content", async function () {
      await expect(hypeChain.getContent(999))
        .to.be.revertedWith("Content does not exist");
    });

    it("Should fail to get non-existent share", async function () {
      await expect(hypeChain.getShare(999))
        .to.be.revertedWith("Share does not exist");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle creating share with no parent (direct from creator)", async function () {
      await hypeChain.createContent("ipfs://test");
      
      // Alice creates share with parentShareId=0 (no specific parent)
      await hypeChain.connect(alice).createShare(1, 0);

      const share = await hypeChain.getShare(2);
      expect(share.parentShareId).to.equal(0);
      expect(share.depth).to.equal(0);
    });

    it("Should fail to create share for non-existent content", async function () {
      await expect(hypeChain.createShare(999, 0))
        .to.be.revertedWith("Content does not exist");
    });

    it("Should fail to create share with invalid parent", async function () {
      await hypeChain.createContent("ipfs://test");
      
      await expect(hypeChain.createShare(1, 999))
        .to.be.revertedWith("Parent share does not exist");
    });
  });
});

