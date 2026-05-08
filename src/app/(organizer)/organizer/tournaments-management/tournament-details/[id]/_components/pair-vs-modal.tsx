import { Dialog, DialogContent } from "@/components/ui/dialog";
import React from "react";
import { Match } from "./draw";
import Image from "next/image";

interface Props {
  isModalOpen: boolean;
  handleCloseModal: () => void;
  matchInfo: Match;
}

const PairVsModal = ({ isModalOpen, handleCloseModal, matchInfo }: Props) => {
  return (
    <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="bg-white lg:max-w-4xl max-w-[95vw] sm:max-w-lg md:max-w-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 p-4 md:p-6">
          {/* Player 1 */}
          <div className="flex flex-col items-center text-center w-full md:w-1/3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              Team 1
            </h1>

            <div className="flex items-center gap-5">
              <div>
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full mb-4 overflow-hidden border-2 border-gray-200">
                  <Image
                    src={
                      matchInfo?.pair1Id?.player1?.profileImage ||
                      "/images/common/user_placeholder.png"
                    }
                    alt="Player 1"
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>

                <h1 className="text-lg md:text-xl font-semibold text-gray-800 mt-2 line-clamp-2">
                  {matchInfo?.pair1Id?.player1?.fullName || "N/A"}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 break-words max-w-full">
                  {matchInfo?.pair1Id?.player1?.email || "No email"}
                </p>
              </div>

              <div>
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full mb-4 overflow-hidden border-2 border-gray-200">
                  <Image
                    src={
                      matchInfo?.pair1Id?.player2?.profileImage ||
                      "/images/common/user_placeholder.png"
                    }
                    alt="Player 1"
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>

                <h1 className="text-lg md:text-xl font-semibold text-gray-800 mt-2 line-clamp-2">
                  {matchInfo?.pair1Id?.player2?.fullName || "N/A"}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 break-words max-w-full">
                  {matchInfo?.pair1Id?.player2?.email || "No email"}
                </p>
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="hidden md:flex flex-col items-center justify-center px-4">
            <div className="text-3xl md:text-4xl font-bold text-red-500">
              VS
            </div>
          </div>

          {/* Mobile VS */}
          <div className="md:hidden my-4">
            <div className="text-2xl font-bold text-red-500">VS</div>
          </div>

          {/* Player 2 */}
          <div className="flex flex-col items-center text-center w-full md:w-1/3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              Team 2
            </h1>

            <div className="flex items-center gap-5">
              <div>
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full mb-4 overflow-hidden border-2 border-gray-200">
                  <Image
                    src={
                      matchInfo?.pair2Id?.player1?.profileImage ||
                      "/images/common/user_placeholder.png"
                    }
                    alt="Player 1"
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>

                <h1 className="text-lg md:text-xl font-semibold text-gray-800 mt-2 line-clamp-2">
                  {matchInfo?.pair2Id?.player1?.fullName || "N/A"}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 break-words max-w-full">
                  {matchInfo?.pair2Id?.player1?.email || "No email"}
                </p>
              </div>

              <div>
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full mb-4 overflow-hidden border-2 border-gray-200">
                  <Image
                    src={
                      matchInfo?.pair2Id?.player2?.profileImage ||
                      "/images/common/user_placeholder.png"
                    }
                    alt="Player 1"
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>

                <h1 className="text-lg md:text-xl font-semibold text-gray-800 mt-2 line-clamp-2">
                  {matchInfo?.pair2Id?.player2?.fullName || "N/A"}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 break-words max-w-full">
                  {matchInfo?.pair2Id?.player2?.email || "No email"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PairVsModal;
