"use client";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import TournamentDetailsPage from "./tournament-details";
import TournamentRulesPage from "./tournament-rules";
import TournamentParticipantsPage from "./tournament-participants";
import TournamentRounds from "./tournament-rounds";
import TournamentDrawPage from "./tournament-draw";
import { useSession } from "next-auth/react";
import { TournamentApiResponse, TournamentResponseData} from "./single-tournament-data-type";
import TournamentsHeader from "./tournament-header";

const TournamentsDetails = ({id}:{id:string}) => {
  const session = useSession();
  const token = (session?.data?.user as { accessToken: string })?.accessToken;

  const [isActive, setIsActive] = useState("details");


  // get api call 
  const { data } = useQuery<TournamentApiResponse>({
    queryKey: ["single-tournament", id],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${id}`,{
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      return res.json();
    },
    enabled: !!token
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tournamentName = data && data?.data && data?.data?.tournament?.tournamentName || "N/A"



  console.log("tournament name", data)

  return (

    <div>
      <TournamentsHeader tournamentName={tournamentName} description="Manage and edit your tournament"/>
      <div className="p-6">

      {/* sub-pages */}
      <div>
        <div className="flex items-center gap-8 border-b-[1px] border-gray-300">
          <button
            className={`text-gray-500 py-2 px-4 rounded-t-lg ${
              isActive === "details" &&
              "text-primary font-bold bg-primary/15 border-b-2 border-primary"
            }`}
            onClick={() => setIsActive("details")}
          >
            Details
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
              isActive === "participants" &&
              "text-primary font-bold bg-primary/15 border-b-2 border-primary"
            }`}
            onClick={() => setIsActive("participants")}
          >
            Participants
          </button>
           <button
            className={`text-gray-500 py-2 px-4 rounded-t-lg ${
              isActive === "rounds" &&
              "text-primary font-bold bg-primary/15 border-b-2 border-primary"
            }`}
            onClick={() => setIsActive("rounds")}
          >
            Rounds
          </button>
           <button
            className={`text-gray-500 py-2 px-4 rounded-t-lg ${
              isActive === "draw" &&
              "text-primary font-bold bg-primary/15 border-b-2 border-primary"
            }`}
            onClick={() => setIsActive("draw")}
          >
            Draw
          </button>
        </div>

        <div className="mt-8">
          {isActive === "details" && (

              <div>
              <TournamentDetailsPage  data={data?.data as unknown as TournamentResponseData}/>
            </div>
          )}

          {isActive === "rules" && (
            <div>
              <TournamentRulesPage  data={data?.data || {} as TournamentResponseData} />
            </div>
          )}
          {isActive === "participants" && (
            <div>
              <TournamentParticipantsPage  data={data?.data as unknown as TournamentResponseData}  />
            </div>
          )}
            {isActive === "rounds" && (
            <div>
              <TournamentRounds  data={data?.data || {} as TournamentResponseData} />
            </div>
          )}
          {isActive === "draw" && (
            <div>
              <TournamentDrawPage  data={data?.data || {} as TournamentResponseData} />
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
    
  );
};

export default TournamentsDetails;
