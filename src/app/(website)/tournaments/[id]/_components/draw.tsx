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
import { canViewVsMatch, getVsAccessDeniedMessage } from "@/lib/vs-access";

interface PairId {
  _id: string;
  tournamentId: string;
  teamName: string;
  player1: {
    _id: string;
    fullName: string;
    email: string;
    profileImage: string;
    handicap: string;
    clubName: string;
  };
  player2: {
    _id: string;
    fullName: string;
    email: string;
    profileImage: string;
    handicap: string;
    clubName: string;
  };
}

export interface Match {
  _id: string;
  createdBy?: string;
  winnerColor: string;
  winner: string;
  matchType: "Single" | "Pair" | "Team";
  player1Id: {
    _id: string;
    fullName: string;
    profileImage: string;
    email: string;
    handicap: string;
    clubName: string;
  };
  player2Id: {
    _id: string;
    fullName: string;
    profileImage: string;
    email: string;
    handicap: string;
    clubName: string;
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
  data: {
    tournament?: {
      createdBy?: string;
    };
    matches: Match[];
    rounds: Round[];
  };
  roundNumber: number;
  setRoundNumber: (value: number) => void;
}

const Draw = ({
  matches,
  isLoading,
  data,
  roundNumber,
  setRoundNumber,
}: Props) => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVsModalOpen, setIsVsModalOpen] = useState(false);
  const [matchInfo, setMatchInfo] = useState<Match>();
  const [winner1, setWinner1] = useState<boolean>();

  const handleOpenModal = (match: Match, winner1: boolean) => {
    setIsModalOpen(true);
    setMatchInfo(match);
    setWinner1(winner1);
  };

  const checkVsAccess = (match: Match) => {
    const canView = canViewVsMatch({
      role: session?.user?.role,
      userId: session?.user?.id,
      tournamentCreatedBy: data?.tournament?.createdBy,
      match,
    });

    if (!canView) {
      toast.error(
        getVsAccessDeniedMessage({
          role: session?.user?.role,
        }),
      );
      return false;
    }

    return true;
  };

  const handleVsOpen = (match: Match) => {
    const canView = checkVsAccess(match);
    if (!canView) return;

    setIsVsModalOpen(true);
    setMatchInfo(match);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleVsCloseModal = () => {
    setIsVsModalOpen(false);
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
          <div
            key={item}
            className="flex flex-col sm:flex-row items-start gap-5 space-y-8"
          >
            <Skeleton className="h-6 w-8 rounded-md hidden sm:block" />
            <div className="flex-1 shadow-lg rounded-lg overflow-hidden w-full">
              <div className="flex flex-col md:flex-row items-center p-4 md:p-0 border-b border-b-gray-300">
                <div className="border-b md:border-b-0 md:border-r border-gray-300 w-full md:w-1/2 p-4 md:p-5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>

                <div className="p-4 md:px-8">
                  <Skeleton className="h-6 w-8" />
                </div>

                <div className="border-t md:border-t-0 md:border-l border-gray-300 w-full md:w-1/2 p-4 md:p-5">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="space-y-2 text-right">
                      <Skeleton className="h-4 w-32 ml-auto" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="bg-[#f9fafb] p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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

  return (
    <div className="w-full">
      {/* Round buttons - always visible */}
      <div className="mt-8 mb-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3 sm:gap-5">
        {data?.rounds?.map((item) => {
          return (
            <Button
              key={item?._id}
              onClick={() => setRoundNumber(item?.roundNumber)}
              className={`h-[40px] sm:h-[45px] w-full min-w-[80px] sm:w-[130px] rounded-3xl hover:text-white transition-all duration-200 ${
                roundNumber === item?.roundNumber
                  ? "bg-primary text-white"
                  : "bg-inherit border border-primary text-primary"
              }`}
            >
              <span className="text-xs sm:text-sm truncate">
                {item?.roundName}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Matches section - conditional rendering */}
      {!matches || matches.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-500 text-lg">No matches found</div>
          <p className="text-gray-400 mt-2">Create a match to get started</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {matches.map((item, index) => {
            const winner1 = item?.winner === item?.player1Id?._id;
            const winner2 = item?.winner === item?.player2Id?._id;

            return (
              <div key={item._id}>
                {item?.matchType === "Single" || item?.matchType === "Team" ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 space-y-5 sm:space-y-0">
                    <div className="font-medium text-gray-500 pt-5 hidden sm:block">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </div>
                    <div className="font-medium text-gray-500 pt-5 block sm:hidden text-sm">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </div>

                    <div className="flex-1 w-full shadow-lg rounded-lg overflow-hidden border border-gray-200">
                      <div className="flex flex-col md:flex-row items-center p-4 md:p-0 border-b border-b-gray-300">
                        {/* Player 1 card */}
                        <div
                          className={`border-b md:border-b-0 md:border-r border-gray-300 w-full md:w-1/2 p-4 md:p-6 ${
                            winner1 ? `bg-[#39674b] text-white` : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                              {item.player1Id?.profileImage ? (
                                <Image
                                  src={item.player1Id.profileImage}
                                  alt={item.player1Id.fullName}
                                  width={1000}
                                  height={1000}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-base md:text-lg font-semibold text-red-800">
                                  {item.player1Id?.fullName?.charAt(0) || "P1"}
                                </span>
                              )}
                            </div>
                            <div>
                              <h1 className="font-semibold text-sm md:text-base truncate">
                                {item.player1Id?.fullName || "Player 1"}
                              </h1>
                            </div>
                          </div>
                        </div>

                        {/* VS section */}
                        <div
                          className={`px-4 md:px-8 py-3 md:py-0 flex items-center gap-2 ${
                            winner1 && "flex-row-reverse"
                          }`}
                        >
                          <div
                            onClick={() => handleVsOpen(item)}
                            className="text-sm text-gray-500 cursor-pointer hover:text-primary transition-colors"
                          >
                            VS
                          </div>
                          {item.status === "completed" && (
                            <div className="text-sm font-medium text-gray-600">
                              <span className="text-red-700 font-bold text-lg md:text-xl flex">
                                <span>{item.player1Score}</span>{" "}
                                <span> & </span>{" "}
                                <span> {item.player2Score}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Player 2 card */}
                        <div
                          className={`border-t md:border-t-0 md:border-l border-gray-300 w-full md:w-1/2 p-4 md:p-6 ${
                            winner2 && `bg-[#39674b] text-white`
                          }`}
                        >
                          <div className="flex items-center gap-3 justify-end">
                            <div className="text-right">
                              <h1 className="font-semibold text-sm md:text-base truncate">
                                {item.player2Id?.fullName || "Player 2"}
                              </h1>
                            </div>
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                              {item.player2Id?.profileImage ? (
                                <Image
                                  src={item.player2Id.profileImage}
                                  alt={item.player2Id.fullName}
                                  width={1000}
                                  height={1000}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-base md:text-lg font-semibold text-red-800">
                                  {item.player2Id?.fullName?.charAt(0) || "P2"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#eaeaeecb] py-3 px-4">
                        <div
                          className={`flex flex-col sm:flex-row ${
                            item.status === "completed"
                              ? "justify-between"
                              : "justify-center"
                          } items-start sm:items-center gap-3`}
                        >
                          <div>
                            <p className="truncate text-sm">
                              {item.player1Id.clubName || "No club assigned"}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 w-full sm:w-auto">
                            <div className="text-right sm:text-left">
                              <span className="text-gray-700 text-xs sm:text-sm">
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
                              <span className="hidden sm:inline">, </span>
                              <span className="block sm:inline text-gray-700 text-xs sm:text-sm">
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
                            <div className="flex items-center gap-3 justify-end sm:justify-start">
                              <div
                                className={`text-xs sm:text-sm font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-full ${getStatusColor(
                                  item.status,
                                )}`}
                              >
                                {item.status || "upcoming"}
                              </div>
                            </div>

                            {item.status === "completed" && (
                              <div className="w-full sm:w-auto text-right mt-2 sm:mt-0">
                                <button
                                  onClick={() => handleOpenModal(item, winner1)}
                                  className="text-xs sm:text-sm font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-red-100 text-red-500"
                                >
                                  Moments
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-sm truncate">
                                {item.player2Id.clubName || "No club assigned"}
                              </p>
                            </div>
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
                    onViewVs={checkVsAccess}
                  />
                )}
              </div>
            );
          })}

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
      )}
    </div>
  );
};

// Helper function for status styling
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "upcoming":
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
