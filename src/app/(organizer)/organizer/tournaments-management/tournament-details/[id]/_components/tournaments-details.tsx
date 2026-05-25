"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import Rules from "./rules";
import Details from "./details";
import Draw from "./draw";
import { TournamentApiResponse } from "../../../[id]/_components/single-tournament-data-type";
import { useSession } from "next-auth/react";
import TournamentsHeader from "../../../[id]/_components/tournament-header";

const TournamentsDetails = () => {
  const session = useSession();
  const token = (session?.data?.user as { accessToken: string })?.accessToken;
  const params = useParams();
  const id = params?.id;

  const [isActive, setIsActive] = useState("draw");
  const [roundNumber, setRoundNumber] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tournaments", roundNumber],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/getAllMatches/${id}?roundNumber=${roundNumber}`,
      );
      const data = await res.json();
      return data?.data;
    },
  });

  // get api call
  const { data: tournamentData } = useQuery<TournamentApiResponse>({
    queryKey: ["single-tournament", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return res.json();
    },
    enabled: !!token,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tournamentName =
    (tournamentData &&
      tournamentData?.data &&
      tournamentData?.data?.tournament?.tournamentName) ||
    "N/A";

  console.log("tournament name", tournamentName);

  return (
    <div>
      <TournamentsHeader
        tournamentName={tournamentName}
        description="View your tournament"
      />
      <div className="p-6">
        {/* sub-pages */}
        <div>
          <div className="flex items-center gap-8 border-b-[1px] border-gray-300">
            <button
              className={`text-gray-500 py-2 px-4 rounded-t-lg ${
                isActive === "draw" &&
                "text-primary font-bold bg-primary/15 border-b-2 border-primary"
              }`}
              onClick={() => setIsActive("draw")}
            >
              Draw
            </button>
            <button
              className={`text-gray-500 py-2 px-4 rounded-t-lg ${
                isActive === "rules" &&
                "text-primary font-bold bg-primary/15 border-b-2 border-primary"
              }`}
              onClick={() => setIsActive("rules")}
            >
              Rules
            </button>
            <button
              className={`text-gray-500 py-2 px-4 rounded-t-lg ${
                isActive === "details" &&
                "text-primary font-bold bg-primary/15 border-b-2 border-primary"
              }`}
              onClick={() => setIsActive("details")}
            >
              Details
            </button>
          </div>

          <div className="mt-8">
            {isActive === "draw" && (
              <div>
                <Draw
                  matches={data?.matches}
                  isLoading={isLoading}
                  rounds={data?.rounds}
                  roundNumber={roundNumber}
                  setRoundNumber={setRoundNumber}
                  refetchMatches={refetch}
                />
              </div>
            )}

            {isActive === "rules" && (
              <div>
                <Rules rules={data?.tournament?.rules} isLoading={isLoading} />
              </div>
            )}
            {isActive === "details" && (
              <div>
                <Details tournament={data?.tournament} isLoading={isLoading} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentsDetails;
