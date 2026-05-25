'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import moment from 'moment'
import { CalendarDays, CircleDot, Trophy, Users } from 'lucide-react'
import TableSkeleton from '@/app/(organizer)/_components/player-paricipation-loading'
import ErrorContainer from '@/components/shared/ErrorContainer/ErrorContainer'
import NotFound from '@/components/shared/NotFound/NotFound'



type MatchParticipant = {
  _id: string
  fullName?: string
  email?: string
  teamName?: string
}

type MatchDetailsResponse = {
  success: boolean
  data: {
    _id: string
    tournamentId: {
      _id: string
      tournamentName: string
      sportName: string
      format: string
    }
    matchNumber: number
    round: number
    matchType: 'Pairs' | 'Single' | 'Team' | string
    player1Id: MatchParticipant | null
    player2Id: MatchParticipant | null
    pair1Id: MatchParticipant | null
    pair2Id: MatchParticipant | null
    player1Score: number
    player2Score: number
    pair1Score: number
    pair2Score: number
    date: string | null
    status: string
    winner: string | null
    createdAt: string
    updatedAt: string
    matchPhoto: string[]
  }
}

const getStatusStyle = (status?: string) => {
  const normalizedStatus = status?.trim().toLowerCase()

  if (normalizedStatus === 'in progress' || normalizedStatus === 'ongoing') {
    return 'bg-[#E6FAEE] text-[#27BE69]'
  }
  if (normalizedStatus === 'scheduled' || normalizedStatus === 'upcoming') {
    return 'bg-[#EFF6FF] text-[#2563EB]'
  }
  if (normalizedStatus === 'completed') {
    return 'bg-[#FEFCE8] text-[#CA8A04]'
  }
  return 'bg-[#E8E8E8] text-[#6C757D]'
}

const ViewMatchPage = () => {
  const params = useParams()
  const matchId = params?.id as string

  const { data, isLoading, isError, error } = useQuery<MatchDetailsResponse>({
    queryKey: ['single-match', matchId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/match/${matchId}`,
      )
      return res.json()
    },
    enabled: !!matchId,
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <TableSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <ErrorContainer message={error?.message || 'Something went wrong'} />
      </div>
    )
  }

  if (!data?.success || !data?.data) {
    return (
      <div className="p-6">
        <NotFound message="Match details not found." />
      </div>
    )
  }

  const match = data.data
  const isPairsMatch = match.matchType?.toLowerCase() === 'pairs'

  const participantOne = isPairsMatch ? match.pair1Id : match.player1Id
  const participantTwo = isPairsMatch ? match.pair2Id : match.player2Id

  const scoreOne = isPairsMatch ? match.pair1Score : match.player1Score
  const scoreTwo = isPairsMatch ? match.pair2Score : match.player2Score

  const participantOneName =
    participantOne?.teamName || participantOne?.fullName || 'TBD'
  const participantTwoName =
    participantTwo?.teamName || participantTwo?.fullName || 'TBD'

  const participantOneSubText = isPairsMatch
    ? 'Pair 1'
    : participantOne?.email || 'Player 1'
  const participantTwoSubText = isPairsMatch
    ? 'Pair 2'
    : participantTwo?.email || 'Player 2'

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-[12px] border border-[#E6E7E6] bg-white p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-[#343A40] font-hexco">
          Match Details
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="rounded-[10px] border border-[#E6E7E6] p-4 bg-[#F8F9FA]">
            <p className="text-sm text-[#68706A]">Match ID</p>
            <p className="text-base font-medium text-[#343A40] mt-1 break-all">
              {match._id || 'N/A'}
            </p>
          </div>
          <div className="rounded-[10px] border border-[#E6E7E6] p-4 bg-[#F8F9FA]">
            <p className="text-sm text-[#68706A]">Tournament</p>
            <p className="text-base font-medium text-[#343A40] mt-1">
              {match.tournamentId?.tournamentName || 'N/A'}
            </p>
          </div>
          <div className="rounded-[10px] border border-[#E6E7E6] p-4 bg-[#F8F9FA]">
            <p className="text-sm text-[#68706A]">Format</p>
            <p className="text-base font-medium text-[#343A40] mt-1">
              {match.matchType}
            </p>
          </div>
          <div className="rounded-[10px] border border-[#E6E7E6] p-4 bg-[#F8F9FA]">
            <p className="text-sm text-[#68706A]">Round / Match No.</p>
            <p className="text-base font-medium text-[#343A40] mt-1">
              Round {match.round} / Match {match.matchNumber}
            </p>
          </div>
          <div className="rounded-[10px] border border-[#E6E7E6] p-4 bg-[#F8F9FA]">
            <p className="text-sm text-[#68706A]">Status</p>
            <span
              className={`inline-block mt-2 px-4 py-1.5 rounded-[8px] text-sm font-medium ${getStatusStyle(match.status)}`}
            >
              {match.status || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[12px] border border-[#E6E7E6] bg-white p-6">
        <h3 className="text-xl font-semibold text-[#343A40] mb-5 font-hexco">
          Participants & Score
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch gap-4">
          <div className="rounded-[10px] border border-[#E6E7E6] p-5 bg-[#FCFCFD]">
            <div className="flex items-center gap-2 text-[#68706A] text-sm">
              <Users className="w-4 h-4" />
              <span>{participantOneSubText}</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-[#343A40]">
              {participantOneName}
            </p>
            <p className="mt-4 text-sm text-[#68706A]">Score</p>
            <p className="text-3xl font-bold text-[#DF1020]">{scoreOne}</p>
          </div>

          <div className="rounded-[10px] border border-[#E6E7E6] p-5 bg-[#FFF5F5] flex flex-col items-center justify-center">
            <CircleDot className="w-5 h-5 text-[#DF1020]" />
            <p className="text-xl font-bold text-[#DF1020] mt-2">
              {scoreOne} : {scoreTwo}
            </p>
            <p className="text-sm text-[#68706A] mt-1">Current Scoreline</p>
          </div>

          <div className="rounded-[10px] border border-[#E6E7E6] p-5 bg-[#FCFCFD]">
            <div className="flex items-center gap-2 text-[#68706A] text-sm">
              <Users className="w-4 h-4" />
              <span>{participantTwoSubText}</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-[#343A40]">
              {participantTwoName}
            </p>
            <p className="mt-4 text-sm text-[#68706A]">Score</p>
            <p className="text-3xl font-bold text-[#DF1020]">{scoreTwo}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[12px] border border-[#E6E7E6] bg-white p-6">
        <h3 className="text-xl font-semibold text-[#343A40] mb-5 font-hexco">
          Match Info
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-[10px] border border-[#E6E7E6] p-4">
            <p className="text-sm text-[#68706A] flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Match Date
            </p>
            <p className="text-base font-medium text-[#343A40] mt-2">
              {match.date ? moment(match.date).format('MMM DD, YYYY') : 'N/A'}
            </p>
          </div>
          <div className="rounded-[10px] border border-[#E6E7E6] p-4">
            <p className="text-sm text-[#68706A]">Sport</p>
            <p className="text-base font-medium text-[#343A40] mt-2">
              {match.tournamentId?.sportName || 'N/A'}
            </p>
          </div>
          <div className="rounded-[10px] border border-[#E6E7E6] p-4">
            <p className="text-sm text-[#68706A] flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Winner
            </p>
            <p className="text-base font-medium text-[#343A40] mt-2">
              {match.winner || 'Not decided yet'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewMatchPage
