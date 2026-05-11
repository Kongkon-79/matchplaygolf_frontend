"use client";
import React, { useState } from "react";
import { Match } from "./draw";
import Image from "next/image";
import PairVsModal from "./pair-vs-modal";
import MomentsModal from "./moments-modal";

const PairCard = ({
  item,
  index,
  getStatusColor,
  onViewVs,
}: {
  item: Match;
  index: number;
  getStatusColor: (value: string) => void;
  onViewVs: (match: Match) => boolean;
}) => {
  const [isPairVsModalOpen, setIsPairVsModalOpen] = useState(false);
  const [matchInfo, setMatchInfo] = useState<Match>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>();

  const pairWinner1 = item?.winner === item?.pair1Id?._id;
  const pairWinner2 = item?.winner === item?.pair2Id?._id;

  const handlePairVsOpen = (match: Match) => {
    const canView = onViewVs(match);
    if (!canView) return;

    setMatchInfo(match);
    setIsPairVsModalOpen(true);
  };

  const handlePairCloseModal = () => {
    setIsPairVsModalOpen(false);
  };


  

  const handleOpenModal = (match: Match) => {
    setIsModalOpen(true);
    setMatchInfo(match);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 space-y-5 sm:space-y-0">
      <div className="font-medium text-gray-500 pt-5 hidden sm:block">
        {index + 1 < 10 ? `0${index + 1}` : index + 1}
      </div>
      <div className="font-medium text-gray-500 pt-5 block sm:hidden text-sm">
        {index + 1 < 10 ? `0${index + 1}` : index + 1}
      </div>

      <div className="flex-1 w-full shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <div className="flex flex-col md:flex-row items-center p-4 md:p-0 border-b border-b-gray-300">
          {/* Pair 1 card */}
          <div
            className={`border-b md:border-b-0 md:border-r border-gray-300 w-full md:w-1/2 p-4 md:p-6 ${
              pairWinner1 ? `bg-[#39674b] text-white` : ""
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                  {item.pair1Id?.player1?.profileImage ? (
                    <Image
                      src={item.pair1Id?.player1?.profileImage}
                      alt={item.pair1Id?.player1?.fullName}
                      width={1000}
                      height={1000}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm md:text-lg font-semibold text-red-800">
                      {item.pair1Id?.player1?.fullName?.charAt(0) || "P1"}
                    </span>
                  )}
                </div>

                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                  {item.pair1Id?.player2?.profileImage ? (
                    <Image
                      src={item.pair1Id?.player2?.profileImage}
                      alt={item.pair1Id?.player2?.fullName}
                      width={1000}
                      height={1000}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm md:text-lg font-semibold text-red-800">
                      {item.pair1Id?.player2?.fullName?.charAt(0) || "P2"}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 sm:mt-0">
                <div>
                  <h1 className="font-semibold text-xs sm:text-sm md:text-base truncate">
                    {item.pair1Id?.player1?.fullName || "Player 1"}
                  </h1>
                </div>

                <div>
                  <h1 className="font-semibold text-xs sm:text-sm md:text-base truncate">
                    {item.pair1Id?.player2?.fullName || "Player 2"}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* VS section */}
          <div
            className={`px-4 md:px-8 py-3 md:py-0 flex items-center gap-2 ${
              pairWinner1 && "flex-row-reverse"
            }`}
          >
            <div
              onClick={() => handlePairVsOpen(item)}
              className="text-sm text-gray-500 cursor-pointer hover:text-primary transition-colors"
            >
              VS
            </div>
            {item.status === "completed" && (
              <div className="text-sm font-medium text-gray-600">
                <span className="text-red-700 font-bold text-lg md:text-xl flex">
                  <span>{item.pair1Score}</span> <span> & </span>{" "}
                  <span> {item.pair2Score}</span>
                </span>
              </div>
            )}
          </div>

          {/* Pair 2 card */}
          <div
            className={`border-t md:border-t-0 md:border-l border-gray-300 w-full md:w-1/2 p-4 md:p-6 ${
              pairWinner2 ? `bg-[#39674b] text-white` : ""
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-end">
              <div className="mt-2 sm:mt-0 sm:text-right">
                <div>
                  <h1 className="font-semibold text-xs sm:text-sm md:text-base truncate">
                    {item.pair2Id?.player1?.fullName || "Player 1"}
                  </h1>
                </div>

                <div>
                  <h1 className="font-semibold text-xs sm:text-sm md:text-base truncate">
                    {item.pair2Id?.player2?.fullName || "Player 2"}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                  {item.pair2Id?.player1?.profileImage ? (
                    <Image
                      src={item.pair2Id?.player1?.profileImage}
                      alt={item.pair2Id?.player1?.fullName}
                      width={1000}
                      height={1000}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm md:text-lg font-semibold text-red-800">
                      {item.pair2Id?.player1?.fullName?.charAt(0) || "P1"}
                    </span>
                  )}
                </div>

                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                  {item.pair2Id?.player2?.profileImage ? (
                    <Image
                      src={item.pair2Id?.player2?.profileImage}
                      alt={item.pair2Id?.player2?.fullName}
                      width={1000}
                      height={1000}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm md:text-lg font-semibold text-red-800">
                      {item.pair2Id?.player2?.fullName?.charAt(0) || "P2"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#eaeaeecb] py-3 px-4">
          <div
            className={`flex flex-col sm:flex-row ${
              item.status === "completed" ? "justify-between" : "justify-center"
            } items-start sm:items-center gap-3`}
          >
            <div className="hidden sm:block"></div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 w-full sm:w-auto">
              <div className="text-right sm:text-left">
                <span className="text-gray-700 text-xs sm:text-sm">
                  {item?.date
                    ? new Date(item?.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Date not set"}
                </span>
                <span className="hidden sm:inline">, </span>
                <span className="block sm:inline text-gray-700 text-xs sm:text-sm">
                  {item?.date
                    ? new Date(item?.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <div className="flex items-center gap-3 justify-end sm:justify-start">
                <div
                  className={`text-xs sm:text-sm font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-full ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status || "upcoming"}
                </div>
              </div>
            </div>

            {item.status === "completed" && (
              <div className="w-full sm:w-auto text-right mt-2 sm:mt-0">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="text-primary font-semibold text-sm hover:underline"
                >
                  Moments
                </button>
              </div>
            )}
          </div>

          {isPairVsModalOpen && matchInfo && (
            <PairVsModal
              handleCloseModal={handlePairCloseModal}
              isModalOpen={isPairVsModalOpen}
              matchInfo={matchInfo}
            />
          )}

          {isModalOpen && (
            <MomentsModal
              isModalOpen={isModalOpen}
              handleCloseModal={handleCloseModal}
              match={matchInfo as Match}
              pairWinner1={pairWinner1}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PairCard;
