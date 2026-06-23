// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Voting
 * @notice Простая система децентрализованного голосования.
 *         Любой может создать предложение. Каждый адрес голосует
 *         за конкретное предложение только один раз.
 */
contract Voting {
    struct Proposal {
        string description; // текст предложения
        uint256 voteCount;  // количество голосов
        address creator;    // кто создал предложение
    }

    // Владелец контракта (тот, кто его задеплоил)
    address public owner;

    // Список всех предложений
    Proposal[] public proposals;

    // proposalId => (адрес => голосовал ли уже)
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // События для фронтенда (Scaffold-ETH умеет их слушать)
    event ProposalCreated(uint256 indexed proposalId, string description, address indexed creator);
    event Voted(uint256 indexed proposalId, address indexed voter, uint256 newVoteCount);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Создать новое предложение для голосования.
     * @param _description Текст предложения.
     * @return proposalId Идентификатор созданного предложения.
     */
    function createProposal(string memory _description) public returns (uint256) {
        require(bytes(_description).length > 0, "Description cannot be empty");

        proposals.push(Proposal({description: _description, voteCount: 0, creator: msg.sender}));

        uint256 proposalId = proposals.length - 1;
        emit ProposalCreated(proposalId, _description, msg.sender);
        return proposalId;
    }

    /**
     * @notice Проголосовать за предложение по его id.
     * @param _proposalId Идентификатор предложения.
     */
    function vote(uint256 _proposalId) public {
        require(_proposalId < proposals.length, "Proposal does not exist");
        require(!hasVoted[_proposalId][msg.sender], "Already voted for this proposal");

        hasVoted[_proposalId][msg.sender] = true;
        proposals[_proposalId].voteCount += 1;

        emit Voted(_proposalId, msg.sender, proposals[_proposalId].voteCount);
    }

    /**
     * @notice Сколько всего предложений создано.
     */
    function getProposalsCount() public view returns (uint256) {
        return proposals.length;
    }

    /**
     * @notice Получить данные одного предложения.
     */
    function getProposal(uint256 _proposalId)
        public
        view
        returns (string memory description, uint256 voteCount, address creator)
    {
        require(_proposalId < proposals.length, "Proposal does not exist");
        Proposal storage p = proposals[_proposalId];
        return (p.description, p.voteCount, p.creator);
    }
}
