"use client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import TournamentSkeleton from "./tournament-skeleton";
import Link from "next/link";

interface Tournament {
  _id: string;
  tournamentName: string;
  status: string;
  startDate: string;
  endDate: string;
  format?: string;
  drawSize?: number;
  totalRounds?: number;
  location?: string;
  drawFormat?: string;
  sportName?: string;
  price?: string;
  paymentStatus?: string;
  totalParticipants?: number;
  numberOfSeeds?: number;
}

interface ApiResponseData {
  tournaments: Tournament[];
  pagination: {
    page: number | null;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: ApiResponseData;
  message: string;
}

const CurrentTournaments = () => {
  const session = useSession();
  const token = session?.data?.user?.accessToken;
  const status = session?.status;
  const pathName = usePathname();
  const [filter, setFilter] = useState("scheduled");

  const { data, isLoading, isFetching } = useQuery<ApiResponseData>({
    queryKey: ["tournaments", filter],
    queryFn: async () => {
      const res = await fetch(
        // `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-dashboard/user-tournaments?status=${filter}`,
         `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-dashboard/user-tournaments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: ApiResponse = await res.json();
      return data.data;
    },
    enabled: !!token,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (status === "loading" || isLoading || isFetching) {
    return (
      <div className="space-y-8">
        {pathName === "/player/match-schedule" && (
          <div className="p-3 rounded-md shadow-[0px_4px_6px_0px_#0000001A] bg-white flex items-center gap-4">
            <Button
              onClick={() => setFilter("scheduled")}
              variant={filter === "scheduled" ? "default" : "outline"}
              className={`w-full h-[50px] ${
                filter === "scheduled"
                  ? "text-white"
                  : "border border-primary text-primary"
              }`}
            >
              Scheduled
            </Button>

            <Button
              onClick={() => setFilter("completed")}
              variant={filter === "completed" ? "default" : "outline"}
              className={`w-full h-[50px] ${
                filter === "completed"
                  ? "text-white"
                  : "border border-primary text-primary"
              }`}
            >
              Completed
            </Button>
          </div>
        )}
        <TournamentSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {pathName === "/player/match-schedule" && (
        <div className="p-3 rounded-md shadow-[0px_4px_6px_0px_#0000001A] bg-white flex items-center gap-4">
          <Button
            onClick={() => setFilter("scheduled")}
            variant={filter === "scheduled" ? "default" : "outline"}
            className={`w-full h-[50px] ${
              filter === "scheduled"
                ? "text-white"
                : "border border-primary text-primary"
            }`}
          >
            Scheduled
          </Button>

          <Button
            onClick={() => setFilter("completed")}
            variant={filter === "completed" ? "default" : "outline"}
            className={`w-full h-[50px] ${
              filter === "completed"
                ? "text-white"
                : "border border-primary text-primary"
            }`}
          >
            Completed
          </Button>
        </div>
      )}

      <div className="bg-white p-5 rounded-lg shadow-[0px_4px_6px_0px_#0000001A]">
        {!data || !data?.tournaments || data?.tournaments?.length === 0 ? (
          <div>
            {pathName === "/player" && (
              <div className="flex items-center gap-2 mb-6">
                <Image
                  src={"/images/dashboard/player/trophy.png"}
                  alt="trophy"
                  width={1000}
                  height={1000}
                  className="h-5 w-5"
                />
                <h1 className="font-bold text-xl">Current Tournaments</h1>
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                  0
                </span>
              </div>
            )}
            <p className="mt-4 text-gray-500">
              {filter === "scheduled"
                ? "No scheduled tournaments found."
                : "No completed tournaments found."}
            </p>
          </div>
        ) : (
          <>
            {pathName === "/player" && (
              <div className="flex items-center gap-2 mb-6">
                <Image
                  src={"/images/dashboard/player/trophy.png"}
                  alt="trophy"
                  width={1000}
                  height={1000}
                  className="h-5 w-5"
                />
                <h1 className="font-bold text-xl">Current Tournaments</h1>
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {data?.tournaments?.length}
                </span>
              </div>
            )}

            <div className="space-y-6">
              {data?.tournaments?.map((tournament) => (
                <div
                  key={tournament?._id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {tournament?.tournamentName}
                      </h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tournament?.status === "upcoming"
                              ? "bg-blue-100 text-blue-800"
                              : tournament?.status === "in progress"
                              ? "bg-orange-100 text-orange-800"
                              : tournament?.status === "scheduled"
                              ? "bg-gray-100 text-gray-800"
                              : tournament?.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {tournament?.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {tournament?.startDate &&
                            formatDate(tournament?.startDate)}{" "}
                          -{" "}
                          {tournament?.endDate &&
                            formatDate(tournament?.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Format</p>
                      <p className="font-medium">
                        {tournament?.format || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Draw Size</p>
                      <p className="font-medium">
                        {tournament?.drawSize || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Total Rounds</p>
                      <p className="font-medium">
                        {tournament?.totalRounds || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium capitalize">
                        {tournament?.location || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Link href={`/player/match-schedule/${tournament?._id}`}>
                      {" "}
                      <button className="underline text-sm">
                        View Tournaments
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CurrentTournaments;
