"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import Draw from "./draw";

const TournamentsDetails = () => {
  const params = useParams();
  const id = params?.id;

  const [roundNumber, setRoundNumber] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tournaments", id, roundNumber],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/getAllMatches/${id}?roundNumber=${roundNumber}`,
      );

      const data = await res.json();

      return data?.data;
    },
  });

  return (
    <div>
      <div>
        <h3 className="text-xl font-medium">
          {data?.tournament?.tournamentName}
        </h3>
        <p className="text-gray-500 mt-2">
          Matches to be played by{" "}
          {new Date(data?.tournament?.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          -{" "}
          {new Date(data?.tournament?.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

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
    </div>
  );
};

export default TournamentsDetails;
