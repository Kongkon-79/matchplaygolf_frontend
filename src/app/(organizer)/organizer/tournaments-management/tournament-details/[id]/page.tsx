import React from 'react'
import TournamentsDetails from './_components/tournaments-details'
// import TournamentViewHeader from "./_components/tournament-view-header";

const page = () => {
  return (
    <div className="">
      {/* <TournamentViewHeader/> */}

      <div className="pb-20">
        <TournamentsDetails />
      </div>
    </div>
  )
}

export default page
