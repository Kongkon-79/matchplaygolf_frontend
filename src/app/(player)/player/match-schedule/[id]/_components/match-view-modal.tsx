// match-view-modal.tsx
"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Calendar, MapPin, Trophy, Users, Clock, Info } from "lucide-react";

interface MatchViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
}

interface MatchDetailsResponse {
  success: boolean;
  data: {
    _id: string;
    matchType: string;
    player1Id: {
      _id: string;
      fullName: string;
      profileImage: string;
      email: string;
      handicap?: string;
      clubName?: string;
    };
    player2Id: {
      _id: string;
      fullName: string;
      profileImage: string;
      email: string;
      handicap?: string;
      clubName?: string;
    };
    pair1Id?: {
      _id?: string;
      player1: {
        _id: string;
        fullName: string;
        profileImage: string;
        clubName?: string;
        handicap?: string;
      };
      player2: {
        _id: string;
        fullName: string;
        profileImage: string;
        clubName?: string;
        handicap?: string;
      };
    };
    pair2Id?: {
      _id?: string;
      player1: {
        _id: string;
        fullName: string;
        profileImage: string;
        clubName?: string;
        handicap?: string;
      };
      player2: {
        _id: string;
        fullName: string;
        profileImage: string;
        clubName?: string;
        handicap?: string;
      };
    };
    player1Score: number;
    player2Score: number;
    pair1Score: number;
    pair2Score: number;
    date: string;
    status: string;
    venue?: string;
    winner: string;
    comments?: string;
    matchPhoto: string[];
    tournamentId: {
      tournamentName: string;
      sportName?: string;
      location?: string;
    };
    round: number;
    matchNumber?: number;
  };
}

const MatchViewModal: React.FC<MatchViewModalProps> = ({
  isOpen,
  onClose,
  matchId,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/match/${matchId}`,
      );
      const result = await res.json();
      return result as MatchDetailsResponse;
    },
    enabled: isOpen && !!matchId,
  });

  const match = data?.data;

  const getStatusBadgeColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <Trophy className="w-4 h-4" />;
      case "in progress":
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : match ? (
          <>
            {/* Header with Tournament Info */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Match Details
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <h3 className="text-xl font-semibold">
                  {match.tournamentId?.tournamentName || "Tournament"}
                </h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  {match.tournamentId?.sportName && (
                    <span className="flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      {match.tournamentId.sportName}
                    </span>
                  )}
                  {match.tournamentId?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {match.tournamentId.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Round {match.round}
                    {match.matchNumber && ` • Match ${match.matchNumber}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Match Status & Venue */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusBadgeColor(
                      match.status,
                    )}`}
                  >
                    {getStatusIcon(match.status)}
                    {match.status || "upcoming"}
                  </span>
                </div>
                {match.venue && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{match.venue}</span>
                  </div>
                )}
              </div>

              {/* Date & Time */}
              {match.date && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                  <div className="flex items-center justify-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Match Date & Time</p>
                      <p className="font-semibold text-lg">
                        {new Date(match.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-gray-600">
                        {new Date(match.date).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Match Card */}
              {match.matchType === "Single" || match.matchType === "Team" ? (
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <div className="flex flex-col md:flex-row items-stretch">
                    {/* Player 1 */}
                    <div
                      className={`flex-1 p-6 text-center transition-all ${
                        match.winner === match.player1Id?._id
                          ? "bg-gradient-to-b from-green-50 to-green-100/50 border-b-4 border-green-500"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-lg">
                            {match.player1Id?.profileImage ? (
                              <Image
                                src={match.player1Id.profileImage}
                                alt={match.player1Id.fullName}
                                width={96}
                                height={96}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-red-800 bg-gradient-to-br from-red-50 to-red-100">
                                {match.player1Id?.fullName?.charAt(0) || "P1"}
                              </div>
                            )}
                          </div>
                          {match.winner === match.player1Id?._id && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full p-1 shadow-lg">
                              <Trophy className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {match.player1Id?.fullName || "Player 1"}
                          </h3>
                          {match.player1Id?.clubName && (
                            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {match.player1Id.clubName}
                            </p>
                          )}
                          {match.player1Id?.handicap && (
                            <p className="text-xs text-gray-400 mt-1">
                              Handicap: {match.player1Id.handicap}
                            </p>
                          )}
                        </div>
                        {match.status === "completed" && (
                          <div className="text-3xl font-bold text-green-600">
                            {match.player1Score}
                          </div>
                        )}
                        {match.winner === match.player1Id?._id && (
                          <div className="mt-2 px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-full font-semibold shadow-md">
                            Winner
                          </div>
                        )}
                      </div>
                    </div>

                    {/* VS Divider */}
                    <div className="relative flex items-center justify-center px-4 bg-gray-50 min-w-[80px]">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                      <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-full px-4 py-2 shadow-inner">
                        <span className="text-lg font-black text-gray-600">
                          VS
                        </span>
                      </div>
                    </div>

                    {/* Player 2 */}
                    <div
                      className={`flex-1 p-6 text-center transition-all ${
                        match.winner === match.player2Id?._id
                          ? "bg-gradient-to-b from-green-50 to-green-100/50 border-b-4 border-green-500"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-lg">
                            {match.player2Id?.profileImage ? (
                              <Image
                                src={match.player2Id.profileImage}
                                alt={match.player2Id.fullName}
                                width={96}
                                height={96}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-red-800 bg-gradient-to-br from-red-50 to-red-100">
                                {match.player2Id?.fullName?.charAt(0) || "P2"}
                              </div>
                            )}
                          </div>
                          {match.winner === match.player2Id?._id && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full p-1 shadow-lg">
                              <Trophy className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {match.player2Id?.fullName || "Player 2"}
                          </h3>
                          {match.player2Id?.clubName && (
                            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {match.player2Id.clubName}
                            </p>
                          )}
                          {match.player2Id?.handicap && (
                            <p className="text-xs text-gray-400 mt-1">
                              Handicap: {match.player2Id.handicap}
                            </p>
                          )}
                        </div>
                        {match.status === "completed" && (
                          <div className="text-3xl font-bold text-green-600">
                            {match.player2Score}
                          </div>
                        )}
                        {match.winner === match.player2Id?._id && (
                          <div className="mt-2 px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-full font-semibold shadow-md">
                            Winner
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Pair Match View
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <div className="flex flex-col md:flex-row items-stretch">
                    {/* Pair 1 */}
                    <div
                      className={`flex-1 p-6 text-center transition-all ${
                        match.winner === match.pair1Id?._id
                          ? "bg-gradient-to-b from-green-50 to-green-100/50 border-b-4 border-green-500"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-lg">
                              {match.pair1Id?.player1?.profileImage ? (
                                <Image
                                  src={match.pair1Id.player1.profileImage}
                                  alt={match.pair1Id.player1.fullName}
                                  width={64}
                                  height={64}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xl font-bold text-red-800">
                                  {match.pair1Id?.player1?.fullName?.charAt(
                                    0,
                                  ) || "P1"}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="relative">
                            <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-lg">
                              {match.pair1Id?.player2?.profileImage ? (
                                <Image
                                  src={match.pair1Id.player2.profileImage}
                                  alt={match.pair1Id.player2.fullName}
                                  width={64}
                                  height={64}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xl font-bold text-red-800">
                                  {match.pair1Id?.player2?.fullName?.charAt(
                                    0,
                                  ) || "P2"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {match.pair1Id?.player1?.fullName}
                          </p>
                          {match.pair1Id?.player1?.clubName && (
                            <p className="text-xs text-gray-500">
                              {match.pair1Id.player1.clubName}
                            </p>
                          )}
                          {match.pair1Id?.player1?.handicap && (
                            <p className="text-xs text-gray-400">
                              H: {match.pair1Id.player1.handicap}
                            </p>
                          )}
                          <p className="font-semibold mt-2">
                            {match.pair1Id?.player2?.fullName}
                          </p>
                          {match.pair1Id?.player2?.clubName && (
                            <p className="text-xs text-gray-500">
                              {match.pair1Id.player2.clubName}
                            </p>
                          )}
                          {match.pair1Id?.player2?.handicap && (
                            <p className="text-xs text-gray-400">
                              H: {match.pair1Id.player2.handicap}
                            </p>
                          )}
                        </div>
                        {match.status === "completed" && (
                          <div className="text-2xl font-bold text-green-600">
                            {match.pair1Score}
                          </div>
                        )}
                        {match.winner === match.pair1Id?._id && (
                          <div className="mt-2 px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-full font-semibold shadow-md">
                            Winning Pair
                          </div>
                        )}
                      </div>
                    </div>

                    {/* VS Divider */}
                    <div className="relative flex items-center justify-center px-4 bg-gray-50 min-w-[80px]">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                      <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-full px-4 py-2 shadow-inner">
                        <span className="text-lg font-black text-gray-600">
                          VS
                        </span>
                      </div>
                    </div>

                    {/* Pair 2 */}
                    <div
                      className={`flex-1 p-6 text-center transition-all ${
                        match.winner === match.pair2Id?._id
                          ? "bg-gradient-to-b from-green-50 to-green-100/50 border-b-4 border-green-500"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-lg">
                              {match.pair2Id?.player1?.profileImage ? (
                                <Image
                                  src={match.pair2Id.player1.profileImage}
                                  alt={match.pair2Id.player1.fullName}
                                  width={64}
                                  height={64}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xl font-bold text-red-800">
                                  {match.pair2Id?.player1?.fullName?.charAt(
                                    0,
                                  ) || "P1"}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="relative">
                            <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-lg">
                              {match.pair2Id?.player2?.profileImage ? (
                                <Image
                                  src={match.pair2Id.player2.profileImage}
                                  alt={match.pair2Id.player2.fullName}
                                  width={64}
                                  height={64}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xl font-bold text-red-800">
                                  {match.pair2Id?.player2?.fullName?.charAt(
                                    0,
                                  ) || "P2"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {match.pair2Id?.player1?.fullName}
                          </p>
                          {match.pair2Id?.player1?.clubName && (
                            <p className="text-xs text-gray-500">
                              {match.pair2Id.player1.clubName}
                            </p>
                          )}
                          {match.pair2Id?.player1?.handicap && (
                            <p className="text-xs text-gray-400">
                              H: {match.pair2Id.player1.handicap}
                            </p>
                          )}
                          <p className="font-semibold mt-2">
                            {match.pair2Id?.player2?.fullName}
                          </p>
                          {match.pair2Id?.player2?.clubName && (
                            <p className="text-xs text-gray-500">
                              {match.pair2Id.player2.clubName}
                            </p>
                          )}
                          {match.pair2Id?.player2?.handicap && (
                            <p className="text-xs text-gray-400">
                              H: {match.pair2Id.player2.handicap}
                            </p>
                          )}
                        </div>
                        {match.status === "completed" && (
                          <div className="text-2xl font-bold text-green-600">
                            {match.pair2Score}
                          </div>
                        )}
                        {match.winner === match.pair2Id?._id && (
                          <div className="mt-2 px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-full font-semibold shadow-md">
                            Winning Pair
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {match.comments && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Match Comments
                  </p>
                  <p className="text-gray-600">{match.comments}</p>
                </div>
              )}

              {/* Match Photos */}
              {match.matchPhoto && match.matchPhoto.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Match Photos
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {match.matchPhoto.map((photo, idx) => (
                      <div
                        key={idx}
                        className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md"
                      >
                        <Image
                          src={photo}
                          alt={`Match moment ${idx + 1}`}
                          className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-2">
              <Info className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">Failed to load match details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MatchViewModal;
