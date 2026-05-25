/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { TournamentResponseData } from "./single-tournament-data-type";
import { toast } from "sonner";
import Link from "next/link";

const TournamentDrawPage = (data: { data: TournamentResponseData }) => {
  const tournamentId = (data?.data?.tournament as unknown as { _id: string })
    ?._id;
  const { data: session } = useSession();
  const token = (session?.user as { accessToken: string })?.accessToken;

  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventDrawnLoading, setEventDrawnLoading] = useState(false);

  console.log(data);

  // handle participant invite send email

  const handleSendEmails = async () => {
    if (!tournamentId || !token) return;

    setEmailLoading(true);
    setEmailSuccess(false);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${tournamentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.message || "Something went wrong");
        return;
      }

      setEmailSuccess(true);
      toast.success("Participant invite emails sent successfully!");
    } catch (error) {
      toast.error("Failed to send emails");
    } finally {
      setEmailLoading(false);
    }
  };

  // handle event start

  const handleEventStart = async () => {
    if (!tournamentId || !token) return;

    setEventLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${tournamentId}/event-started`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.message || "Something went wrong");
        return;
      }

      toast.success("Event started successfully!");
    } catch (error) {
      toast.error("Failed to start event");
    } finally {
      setEventLoading(false);
    }
  };

  // handle event drawn
  const handleEventDrawn = async () => {
    if (!tournamentId || !token) return;

    setEventDrawnLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${tournamentId}/tournament-progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.message || "Something went wrong");
        return;
      }

      toast.success("Event Drawn successfully!");
    } catch (error) {
      toast.error("Failed to start event");
    } finally {
      setEventDrawnLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg md:text-xl lg:text-2xl text-[#181818] font-bold leading-[150%]">
        Create Draw
      </h3>
      <ul className="py-4 md:py-5 lg:py-6">
        <li className="text-sm md:text-base leading-[150%] text-[#181818] font-normal">
          You have{" "}
         {data?.data?.tournament?.totalParticipants || 0 } { " "}
           participants added out of{" "}
          {data?.data?.tournament?.format === "Pairs"
            ? data?.data?.tournament?.drawSize * 2
            : data?.data?.tournament?.drawSize}{" "}
          needed.
        </li>
        <li className="text-sm md:text-base leading-[150%] text-[#181818] font-normal py-3">
          You have {data?.data?.tournament?.totalParticipants || 0} participants
          registered.
        </li>
        <li className="text-sm md:text-base leading-[150%] text-[#181818] font-normal">
          You have {data?.data?.tournament?.numberOfSeeds || 0} of participants
          seeded.
        </li>
      </ul>

      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleSendEmails}
          disabled={emailLoading}
          className="w-[250px] h-[49px] bg-[#343A40] hover:bg-black/60 text-[#F8F9FA] hover:text-white border-none rounded-[8px]"
        >
          {emailLoading
            ? "Sending..."
            : emailSuccess
              ? "Emails Sent"
              : "Send Participant Invite Emails"}
        </Button>
      </div>

      {/* Buttons */}
      <div className="flex justify-start items-center gap-4 pt-6 pb-10 md:pb-14 lg:pb-20">
        <Button
          onClick={handleEventDrawn}
          disabled={eventDrawnLoading}
          type="button"
          variant="outline"
          className="h-[49px] bg-[#FEECEE] hover:bg-[#FEECEE] text-[#8E938F] text-base font-medium leading-[150%] border-none rounded-[8px] py-3 px-5 md:px-[63px]"
        >
          Event Drawn
        </Button>
        <Link
          href={`/organizer/tournaments-management/tournament-details/${tournamentId}`}
        >
          <Button
            type="button"
            variant="outline"
            className="h-[49px] bg-[#E6E7E6] hover:bg-gray-300 text-[#343A40] text-base font-medium leading-[150%] border-none rounded-[8px] py-3 px-5 md:px-20"
          >
            Preview
          </Button>
        </Link>
        <Button
          onClick={handleEventStart}
          disabled={eventLoading}
          type="button"
          className="h-[49px] bg-[#E5102E] hover:bg-red-700 transition-all duration-300 text-[#F7F8FA] font-bold rounded-[8px] py-3 px-5 md:px-16"
        >
          {eventLoading ? "Starting..." : "Event Started"}
        </Button>
      </div>

      {/* <div className="flex justify-start items-center gap-6 pt-6">
        <Button
          type="button"
          variant="outline"
          className="h-[49px] text-[#F2415A] text-base font-medium leading-[150%] border-[1px] border-[#F2415A] rounded-[8px] py-3 px-5 md:px-[81px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-[49px] bg-[#FEECEE] text-[#F2415A] text-base font-medium leading-[150%] border-[1px] border-[#F2415A] rounded-[8px] py-3 px-5 md:px-[88px]"
        >
          Reset
        </Button>
        <Button
          type="submit"
          className="h-[49px] bg-gradient-to-b from-[#DF1020] to-[#310000]
            hover:from-[#310000] hover:to-[#DF1020]
            transition-all duration-300 text-[#F7F8FA] font-bold text-base leading-[120%] rounded-[8px] px-5 md:px-6"
        >
          Update Even (Active)
        </Button>
      </div> */}
    </div>
  );
};

export default TournamentDrawPage;
