import { expect } from "chai";
import { ethers } from "hardhat";
import { Voting } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Voting", function () {
  let voting: Voting;
  let owner: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    const votingFactory = await ethers.getContractFactory("Voting");
    voting = (await votingFactory.deploy()) as Voting;
    await voting.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the deployer as owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should start with zero proposals", async function () {
      expect(await voting.getProposalsCount()).to.equal(0);
    });
  });

  describe("Creating proposals", function () {
    it("Should create a proposal and increase the count", async function () {
      await voting.createProposal("Build a park");
      expect(await voting.getProposalsCount()).to.equal(1);

      const [description, voteCount, creator] = await voting.getProposal(0);
      expect(description).to.equal("Build a park");
      expect(voteCount).to.equal(0);
      expect(creator).to.equal(owner.address);
    });

    it("Should emit ProposalCreated event", async function () {
      await expect(voting.createProposal("Plant trees"))
        .to.emit(voting, "ProposalCreated")
        .withArgs(0, "Plant trees", owner.address);
    });

    it("Should revert on empty description", async function () {
      await expect(voting.createProposal("")).to.be.revertedWith("Description cannot be empty");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await voting.createProposal("Build a park");
    });

    it("Should increase vote count when voting", async function () {
      await voting.connect(voter1).vote(0);
      const [, voteCount] = await voting.getProposal(0);
      expect(voteCount).to.equal(1);
    });

    it("Should mark the address as having voted", async function () {
      await voting.connect(voter1).vote(0);
      expect(await voting.hasVoted(0, voter1.address)).to.equal(true);
    });

    it("Should emit Voted event", async function () {
      await expect(voting.connect(voter1).vote(0))
        .to.emit(voting, "Voted")
        .withArgs(0, voter1.address, 1);
    });

    it("Should not allow voting twice", async function () {
      await voting.connect(voter1).vote(0);
      await expect(voting.connect(voter1).vote(0)).to.be.revertedWith("Already voted for this proposal");
    });

    it("Should allow different accounts to vote", async function () {
      await voting.connect(voter1).vote(0);
      await voting.connect(voter2).vote(0);
      const [, voteCount] = await voting.getProposal(0);
      expect(voteCount).to.equal(2);
    });

    it("Should revert when voting for non-existent proposal", async function () {
      await expect(voting.connect(voter1).vote(99)).to.be.revertedWith("Proposal does not exist");
    });
  });
});
