"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Banner from "../../_components/re-usable/banner";
import TournamentsDetails from "./_components/tournaments-details";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="space-y-24">
      <Banner
        bannerURL="/images/landing-page/tournaments-details.jpg"
        title="LIVE TOURNAMENT DRAW"
        desc="See tournament details - Knockout Stage"
        buttonTitle="Join Tournament"
        buttonPath="/tournaments"
      />

      <div className="container mx-auto">
        <TournamentsDetails />
      </div>
    </div>
  );
};

export default Page;
