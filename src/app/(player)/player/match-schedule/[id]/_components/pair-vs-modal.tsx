import { Dialog, DialogContent } from "@/components/ui/dialog";
import React from "react";
import { Match } from "./draw";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface Props {
  isModalOpen: boolean;
  handleCloseModal: () => void;
  matchInfo: Match;
}

const PlayerCard = ({ fullName, email, profileImage }: { fullName?: string; email?: string; profileImage?: string }) => (
  <div className="flex flex-col items-center text-center">
    <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm md:h-28 md:w-28">
      {profileImage ? (
        <Image
          src={profileImage}
          alt={fullName || "Player"}
          width={160}
          height={160}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-lg font-semibold text-gray-500 md:text-xl">
          {fullName?.split(" ").map((part) => part.charAt(0).toUpperCase()).slice(0, 2).join("") || "NA"}
        </span>
      )}
    </div>

    <h3 className="max-w-[180px] text-lg font-semibold text-gray-900 md:text-xl line-clamp-2">
      {fullName || "N/A"}
    </h3>
    <p className="mt-1 max-w-[180px] break-words text-sm text-gray-500 md:text-base">
      {email || "No email"}
    </p>
  </div>
);

const TeamSection = ({
  title,
  players,
}: {
  title: string;
  players: { fullName?: string; email?: string; profileImage?: string }[];
}) => (
  <div className="w-full rounded-2xl border border-gray-100 bg-gray-50/70 p-5 md:p-6">
    <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 md:text-3xl">
      {title}
    </h2>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {players.map((player, index) => (
        <PlayerCard key={`${title}-${index}`} {...player} />
      ))}
    </div>
  </div>
);

const PairVsModal = ({ isModalOpen, handleCloseModal, matchInfo }: Props) => {
  const { data: session } = useSession();

  // Check if current user is participating in this match
  const isUserParticipating = () => {
    if (!session?.user?.id) return false;

    const team1Players = [matchInfo?.pair1Id?.player1, matchInfo?.pair1Id?.player2].filter(Boolean);
    const team2Players = [matchInfo?.pair2Id?.player1, matchInfo?.pair2Id?.player2].filter(Boolean);

    const allPlayers = [...team1Players, ...team2Players];
    return allPlayers.some(player => player?._id === session.user.id);
  };

  // Get current user's information if they are participating
  const getCurrentUserInfo = () => {
    if (!session?.user?.id) return null;

    const team1Players = [matchInfo?.pair1Id?.player1, matchInfo?.pair1Id?.player2].filter(Boolean);
    const team2Players = [matchInfo?.pair2Id?.player1, matchInfo?.pair2Id?.player2].filter(Boolean);

    const allPlayers = [...team1Players, ...team2Players];
    return allPlayers.find(player => player?._id === session.user.id) || null;
  };

  const userParticipating = isUserParticipating();
  const currentUser = getCurrentUserInfo();

  // If user is not participating, show a message instead of the modal
  if (!userParticipating) {
    return (
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-h-[90vh] max-w-[96vw] overflow-y-auto rounded-2xl border-0 bg-white p-4 shadow-2xl sm:max-w-3xl sm:p-6 lg:max-w-6xl">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-2 text-xl font-bold text-gray-800">Not Participating</h2>
            <p className="text-gray-600">You are not participating in this match.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If user is participating, show their information
  const teamOnePlayers = currentUser ? [currentUser] : [];
  const teamTwoPlayers: { fullName?: string; email?: string; profileImage?: string }[] = []; // Since we're only showing the current user, team 2 will be empty

  return (
    <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-h-[90vh] max-w-[96vw] overflow-y-auto rounded-2xl border-0 bg-white p-4 shadow-2xl sm:max-w-3xl sm:p-6 lg:max-w-6xl">
        <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)]">
          <TeamSection title="Your Team" players={teamOnePlayers} />

          <div className="flex items-center justify-center py-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-bold tracking-wide text-red-600 md:h-20 md:w-20 md:text-3xl">
              VS
            </div>
          </div>

          <TeamSection title="Opponent Team" players={teamTwoPlayers} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PairVsModal;
