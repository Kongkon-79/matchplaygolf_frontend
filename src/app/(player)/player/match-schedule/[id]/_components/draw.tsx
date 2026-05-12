"use client";
import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import MomentsModal from "./moments-modal";
import VsModal from "./vs-modal";
import PairCard from "./pair-card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface PairId {
  _id: string;
  tournamentId: string;
  teamName: string;
  player1: {
    _id: string;
    fullName: string;
    email: string;
    profileImage: string;
    clubName?: string;
  };
  player2: {
    _id: string;
    fullName: string;
    email: string;
    profileImage: string;
    clubName?: string;
  };
}

export interface Match {
  _id: string;
  winnerColor: string;
  winner: string;
  matchType: "Single" | "Pair" | "Team";
  round?: number;
  player1Id: {
    _id: string;
    fullName: string;
    profileImage: string;
    email: string;
    clubName?: string;
  };
  player2Id: {
    _id: string;
    fullName: string;
    profileImage: string;
    email: string;
    clubName?: string;
  };
  player1Score: string;
  player2Score: string;
  pair1Score: string;
  pair2Score: string;
  date: string;
  status: string;
  pair1Id: PairId;
  pair2Id: PairId;
  comments: string;
  matchPhoto: string[];
}

interface Round {
  _id: string;
  roundNumber: number;
  roundName: string;
}

interface Props {
  matches: Match[];
  isLoading: boolean;
  rounds?: Round[];
  roundNumber?: number;
  setRoundNumber?: (value: number) => void;
}

const Draw = ({
  matches,
  isLoading,
  rounds = [],
  roundNumber = 1,
  setRoundNumber,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVsModalOpen, setIsVsModalOpen] = useState(false);
  const [matchInfo, setMatchInfo] = useState<Match>();
  const [winner1, setWinner1] = useState<boolean>();
  const { data: session } = useSession();

  // Filter matches by selected round
  const filteredMatches =
    matches?.filter((match) => match.round === roundNumber) || [];

  const handleOpenModal = (match: Match, winner1: boolean) => {
    setIsModalOpen(true);
    setMatchInfo(match);
    setWinner1(winner1);
  };

  const handleVsOpen = (match: Match) => {
    setIsVsModalOpen(true);
    setMatchInfo(match);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleVsCloseModal = () => {
    setIsVsModalOpen(false);
  };

  const handleNotParticipant = () => {
    toast.error("You are not a participant of this match. Access denied.");
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Round buttons skeleton */}
        <div className="mt-8 mb-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3 sm:gap-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton
              key={item}
              className="h-[40px] sm:h-[45px] w-full min-w-[80px] sm:w-[130px] rounded-3xl"
            />
          ))}
        </div>

        {/* Matches skeleton */}
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-start gap-5 space-y-8">
            <Skeleton className="h-6 w-8 rounded-md" />
            <div className="flex-1 shadow-lg rounded-lg overflow-hidden ">
              <div className="pl-4 pr-4 border-b border-b-gray-300 flex items-center">
                <div className="border-r border-gray-300 lg:w-1/2 p-5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>

                <div className="px-8">
                  <Skeleton className="h-6 w-8" />
                </div>

                <div className="border-l border-gray-300 lg:w-1/2 flex justify-end p-5">
                  <div className="flex items-center gap-2">
                    <div className="space-y-2 text-right">
                      <Skeleton className="h-4 w-32 ml-auto" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="bg-[#f9fafb] p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-20 ml-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show round buttons if rounds exist
  const showRoundButtons = rounds && rounds.length > 0;

  return (
    <div className="space-y-6">
      {/* Round buttons */}
      {showRoundButtons && (
        <div className="mt-8 mb-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3 sm:gap-5">
          {rounds.map((round) => (
            <Button
              key={round._id}
              onClick={() =>
                setRoundNumber && setRoundNumber(round.roundNumber)
              }
              className={`h-[40px] sm:h-[45px] w-full min-w-[80px] sm:w-[130px] rounded-3xl hover:text-white transition-all duration-200 ${
                roundNumber === round.roundNumber
                  ? "bg-primary text-white"
                  : "bg-inherit border border-primary text-primary"
              }`}
            >
              <span className="text-xs sm:text-sm truncate">
                {round.roundName}
              </span>
            </Button>
          ))}
        </div>
      )}

      {/* No matches message for selected round */}
      {!filteredMatches || filteredMatches.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-500 text-lg">No matches found</div>
          <p className="text-gray-400 mt-2">
            {showRoundButtons
              ? `No matches scheduled for ${rounds.find((r) => r.roundNumber === roundNumber)?.roundName || `Round ${roundNumber}`}`
              : "Create a match to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMatches.map((item, index) => {
            const winner1Flag = item?.winner === item?.player1Id?._id;
            const winner2Flag = item?.winner === item?.player2Id?._id;
            const isParticipant =
              session?.user?.id &&
              (session.user.id === item.player1Id?._id ||
                session.user.id === item.player2Id?._id ||
                (item.matchType === "Pair" &&
                  (session.user.id === item.pair1Id?.player1?._id ||
                    session.user.id === item.pair1Id?.player2?._id ||
                    session.user.id === item.pair2Id?.player1?._id ||
                    session.user.id === item.pair2Id?.player2?._id)));

            return (
              <div key={item._id}>
                {item?.matchType === "Single" || item?.matchType === "Team" ? (
                  <div className="flex items-center gap-5 space-y-5">
                    <div className="font-medium text-gray-500 pt-5">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </div>

                    <div className="flex-1 shadow-lg rounded-lg overflow-hidden border border-gray-200">
                      <div className="border-b border-b-gray-300 flex items-center">
                        {/* winner 1 card */}
                        <div
                          className={`border-r border-gray-300 lg:w-1/2 p-6 ${
                            winner1Flag ? `bg-[#39674b] text-white` : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                              {item.player1Id?.profileImage ? (
                                <Image
                                  src={item.player1Id.profileImage}
                                  alt={item.player1Id.fullName}
                                  width={1000}
                                  height={1000}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-semibold text-red-800">
                                  {item.player1Id?.fullName?.charAt(0) || "P1"}
                                </span>
                              )}
                            </div>
                            <div>
                              <h1 className="font-semibold">
                                {item.player1Id?.fullName || "Player 1"}
                              </h1>
                            </div>
                          </div>
                        </div>

                        {/* vs button */}
                        {isParticipant ? (
                          <div
                            className={`px-8 flex items-center gap-2 ${
                              winner1Flag && "flex-row-reverse"
                            }`}
                          >
                            <div
                              onClick={() => handleVsOpen(item)}
                              className="text-base font-medium text-gray-500 cursor-pointer px-4 py-1 w-20 text-center"
                            >
                              VS
                            </div>
                            {item.status === "completed" && (
                              <div className="text-sm font-medium text-gray-600">
                                <span className="text-red-700 font-bold text-xl flex">
                                  <span>{item.player1Score}</span>{" "}
                                  <span> & </span>{" "}
                                  <span>{item.player2Score}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            onClick={handleNotParticipant}
                            className="text-base font-medium text-gray-500 cursor-pointer px-4 py-1 w-20 text-center"
                          >
                            VS
                          </div>
                        )}

                        {/* winner 2 card */}
                        <div
                          className={`border-l border-gray-300 lg:w-1/2 flex justify-end p-6 ${
                            winner2Flag && `bg-[#39674b] text-white`
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <h1 className="font-semibold">
                                {item.player2Id?.fullName || "Player 2"}
                              </h1>
                            </div>
                            <div className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                              {item.player2Id?.profileImage ? (
                                <Image
                                  src={item.player2Id.profileImage}
                                  alt={item.player2Id.fullName}
                                  width={1000}
                                  height={1000}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-semibold text-red-800">
                                  {item.player2Id?.fullName?.charAt(0) || "P2"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#eaeaeecb] py-2 px-4">
                        <div
                          className={`flex flex-col sm:flex-row ${
                            item.status === "completed"
                              ? "justify-between"
                              : "justify-center"
                          } items-start sm:items-center gap-4`}
                        >
                          {/* Left side - Player 1 Club */}
                          <div>
                            <p className="truncate text-sm">
                              {item.player1Id?.clubName || "No club assigned"}
                            </p>
                          </div>

                          {/* Center - Date, Status, Moments */}
                          <div className="flex items-center gap-5">
                            <div className="text-right">
                              <span className="text-gray-700 text-sm">
                                {item?.date
                                  ? new Date(item?.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )
                                  : "Date not set"}
                              </span>
                              <span>, </span>
                              <span className="text-gray-700 text-sm">
                                {item?.date
                                  ? new Date(item?.date).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 justify-end">
                              <div
                                className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(
                                  item.status,
                                )}`}
                              >
                                {item.status || "upcoming"}
                              </div>
                            </div>
                          </div>

                          {/* Right side - Player 2 Club & Moments Button */}
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-sm truncate">
                                {item.player2Id?.clubName || "No club assigned"}
                              </p>
                            </div>
                            {item.status === "completed" && (
                              <button
                                onClick={() =>
                                  handleOpenModal(item, winner1Flag)
                                }
                                className="text-primary font-semibold text-sm"
                              >
                                Moments
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // pair card
                  <PairCard
                    item={item as Match}
                    getStatusColor={getStatusColor}
                    index={index}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <MomentsModal
          isModalOpen={isModalOpen}
          handleCloseModal={handleCloseModal}
          match={matchInfo as Match}
          winner1={winner1 as boolean}
        />
      )}

      {isVsModalOpen && (
        <VsModal
          isModalOpen={isVsModalOpen}
          handleCloseModal={handleVsCloseModal}
          matchInfo={matchInfo as Match}
        />
      )}
    </div>
  );
};

// Helper function for status styling
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "upcoming":
    case "scheduled":
      return "bg-blue-100 text-blue-800";
    case "in progress":
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default Draw;
