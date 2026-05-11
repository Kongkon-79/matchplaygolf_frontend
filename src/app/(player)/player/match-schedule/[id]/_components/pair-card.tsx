'use client'
import React, { useState } from 'react'
import { Match } from './draw'
import Image from 'next/image'
import PairVsModal from './pair-vs-modal'
import MomentsModal from './moments-modal'

const PairCard = ({
  item,
  index,
  getStatusColor,
}: {
  item: Match
  index: number
  getStatusColor: (value: string) => void
}) => {
  const [isPairVsModalOpen, setIsPairVsModalOpen] = useState(false)
  const [matchInfo, setMatchInfo] = useState<Match>()
  const [isModalOpen, setIsModalOpen] = useState<boolean>()

  const pairWinner1 = item?.winner === item?.pair1Id?._id
  const pairWinner2 = item?.winner === item?.pair2Id?._id

  const handlePairVsOpen = (match: Match) => {
    setIsPairVsModalOpen(true)
    setMatchInfo(match)
  }

  const handlePairCloseModal = () => {
    setIsPairVsModalOpen(false)
  }

  const handleOpenModal = (match: Match) => {
    setIsModalOpen(true)
    setMatchInfo(match)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="flex items-center gap-5 space-y-5">
      <div className="font-medium text-gray-500 pt-5">
        {index + 1 < 10 ? `0${index + 1}` : index + 1}
      </div>

      <div className="flex-1 shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <div className="border-b border-b-gray-300 flex items-center">
          {/* winner 1 card */}
          <div
            className={`border-r border-gray-300 lg:w-1/2 p-6 flex items-center gap-5 ${
              pairWinner1 ? `bg-[#39674b] text-white` : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                {item.pair1Id?.player1?.profileImage ? (
                  <Image
                    src={item.pair1Id?.player1?.profileImage}
                    alt={item.pair1Id?.player1?.fullName}
                    width={1000}
                    height={1000}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-red-800">
                    {item.pair1Id?.player1?.fullName?.charAt(0) || 'P1'}
                  </span>
                )}
              </div>

              <div className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                {item.pair1Id?.player2?.profileImage ? (
                  <Image
                    src={item.pair1Id?.player2?.profileImage}
                    alt={item.pair1Id?.player2?.fullName}
                    width={1000}
                    height={1000}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-red-800">
                    {item.pair1Id?.player2?.fullName?.charAt(0) || 'P2'}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div>
                <h1 className="font-semibold">
                  {item.pair1Id?.player1?.fullName || 'Player 1'}
                </h1>
              </div>

              <div>
                <h1 className="font-semibold">
                  {item.pair1Id?.player2?.fullName || 'Player 2'}
                </h1>
              </div>
            </div>
          </div>

          {/* vs button */}
          <div
            className={`px-8 flex items-center gap-2 ${
              pairWinner1 && 'flex-row-reverse'
            }`}
          >
            <div
              onClick={() => handlePairVsOpen(item)}
              className="text-sm text-gray-500 cursor-pointer"
            >
              VS
            </div>
            {item.status === 'completed' && (
              <div className="text-sm font-medium text-gray-600">
                <span className="text-red-700 font-bold text-xl flex">
                  <span>{item.pair1Score}</span> <span> & </span>{' '}
                  <span> {item.pair2Score}</span>
                </span>
              </div>
            )}
          </div>

          {/* winner 2 card */}
          <div
            className={`border-l border-gray-300 lg:w-1/2 p-6 flex items-center gap-5 ${
              pairWinner2 ? `bg-[#39674b] text-white` : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                {item.pair2Id?.player1?.profileImage ? (
                  <Image
                    src={item.pair2Id?.player1?.profileImage}
                    alt={item.pair2Id?.player1?.fullName}
                    width={1000}
                    height={1000}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-red-800">
                    {item.pair2Id?.player1?.fullName?.charAt(0) || 'P1'}
                  </span>
                )}
              </div>

              <div className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                {item.pair2Id?.player2?.profileImage ? (
                  <Image
                    src={item.pair2Id?.player2?.profileImage}
                    alt={item.pair2Id?.player2?.fullName}
                    width={1000}
                    height={1000}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-red-800">
                    {item.pair2Id?.player2?.fullName?.charAt(0) || 'P2'}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div>
                <h1 className="font-semibold">
                  {item.pair2Id?.player1?.fullName || 'Player 1'}
                </h1>
              </div>

              <div>
                <h1 className="font-semibold">
                  {item.pair2Id?.player2?.fullName || 'Player 2'}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#eaeaeecb] py-2 px-4">
          <div
            className={`flex flex-col sm:flex-row ${
              item.status === 'completed' ? 'justify-between' : 'justify-center'
            } items-start sm:items-center gap-4`}
          >
            <div></div>
            <div className="flex items-center gap-5">
              <div className="text-right">
                <span className="text-gray-700 text-sm">
                  {item?.date
                    ? new Date(item?.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Date not set'}
                </span>
                <span>, </span>
                <span className="text-gray-700 text-sm">
                  {item?.date
                    ? new Date(item?.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <div
                  className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(
                    item.status,
                  )}`}
                >
                  {item.status || 'upcoming'}
                </div>
              </div>
            </div>

            {item.status === 'completed' && (
              <div>
                <button
                  onClick={() => handleOpenModal(item)}
                  className="text-primary font-semibold text-sm"
                >
                  Moments
                </button>
              </div>
            )}
          </div>

          {isPairVsModalOpen && (
            <PairVsModal
              handleCloseModal={handlePairCloseModal}
              isModalOpen={isPairVsModalOpen}
              matchInfo={matchInfo as Match}
            />
          )}

          {isModalOpen && (
            <MomentsModal
              isModalOpen={isModalOpen}
              handleCloseModal={handleCloseModal}
              match={matchInfo as Match}
              pairWinner1={pairWinner1}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default PairCard
