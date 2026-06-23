"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [newProposal, setNewProposal] = useState("");

  // Сколько всего предложений
  const { data: proposalsCount } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getProposalsCount",
  });

  // Хуки записи: создать предложение и проголосовать
  const { writeContractAsync: createProposal, isMining: isCreating } = useScaffoldWriteContract({
    contractName: "Voting",
  });
  const { writeContractAsync: vote } = useScaffoldWriteContract({ contractName: "Voting" });

  const count = proposalsCount ? Number(proposalsCount) : 0;

  const handleCreate = async () => {
    if (!newProposal.trim()) return;
    try {
      await createProposal({
        functionName: "createProposal",
        args: [newProposal],
      });
      setNewProposal("");
    } catch (e) {
      console.error("Error creating proposal:", e);
    }
  };

  return (
    <div className="flex flex-col items-center grow pt-10 px-4">
      <h1 className="text-3xl font-bold mb-2">🗳️ Децентрализованное голосование</h1>
      <div className="flex items-center gap-2 mb-6">
        <span>Подключён:</span>
        <Address address={connectedAddress} />
      </div>

      {/* Создание предложения */}
      <div className="card bg-base-100 shadow-md p-6 w-full max-w-xl mb-6">
        <h2 className="text-xl font-semibold mb-3">Создать предложение</h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered grow"
            placeholder="Например: Построить парк"
            value={newProposal}
            onChange={e => setNewProposal(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "..." : "Создать"}
          </button>
        </div>
      </div>

      {/* Список предложений */}
      <div className="w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-3">
          Предложения <span className="text-base-content/60">({count})</span>
        </h2>
        {count === 0 && <p className="text-base-content/60">Пока нет ни одного предложения.</p>}
        <div className="flex flex-col gap-3">
          {Array.from({ length: count }).map((_, i) => (
            <ProposalCard key={i} proposalId={i} onVote={vote} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Карточка одного предложения
const ProposalCard = ({
  proposalId,
  onVote,
}: {
  proposalId: number;
  onVote: (args: { functionName: string; args: readonly [bigint] }) => Promise<unknown>;
}) => {
  const { data: proposal } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getProposal",
    args: [BigInt(proposalId)],
  });

  if (!proposal) return null;
  const [description, voteCount, creator] = proposal as readonly [string, bigint, string];

  const handleVote = async () => {
    try {
      await onVote({ functionName: "vote", args: [BigInt(proposalId)] });
    } catch (e) {
      console.error("Error voting:", e);
    }
  };

  return (
    <div className="card bg-base-100 shadow-md p-4 flex flex-row items-center justify-between">
      <div>
        <p className="font-medium">{description}</p>
        <p className="text-sm text-base-content/60">Голосов: {Number(voteCount)}</p>
        <div className="text-xs text-base-content/50 flex items-center gap-1">
          автор: <Address address={creator} size="xs" />
        </div>
      </div>
      <button className="btn btn-secondary btn-sm" onClick={handleVote}>
        Голосовать
      </button>
    </div>
  );
};

export default Home;
