'use client'

import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SwapPlayerContainerProps = {
  onSuccess?: () => void
  onCancel?: () => void
}

const slotOptions = [
  { key: 'player1', label: 'Player1', apiValue: 'player1Id' },
  { key: 'player2', label: 'Player2', apiValue: 'player2Id' },
  { key: 'pair1', label: 'Pair1', apiValue: 'pair1Id' },
  { key: 'pair2', label: 'Pair2', apiValue: 'pair2Id' },
  { key: 'team1', label: 'Team1', apiValue: 'player1Id' },
  { key: 'team2', label: 'Team2', apiValue: 'player2Id' },
]

const SwapPlayerContainer = ({ onSuccess, onCancel }: SwapPlayerContainerProps) => {
  const session = useSession()
  const token = (session?.data?.user as { accessToken: string })?.accessToken
  const queryClient = useQueryClient()

  const [match1Id, setMatch1Id] = useState('')
  const [match2Id, setMatch2Id] = useState('')
  const [match1Slot, setMatch1Slot] = useState('')
  const [match2Slot, setMatch2Slot] = useState('')

  const { mutate, isPending } = useMutation({
    mutationKey: ['swap-players'],
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/match/swap-players`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            match1Id,
            match2Id,
            match1Slot:
              slotOptions.find(option => option.key === match1Slot)?.apiValue ||
              '',
            match2Slot:
              slotOptions.find(option => option.key === match2Slot)?.apiValue ||
              '',
          }),
        },
      )
      return res.json()
    },
    onSuccess: data => {
      if (!data?.success) {
        toast.error(data?.message || 'Failed to swap players')
        return
      }

      toast.success(data?.message || 'Players swapped successfully')
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      onSuccess?.()
      setMatch1Id('')
      setMatch2Id('')
      setMatch1Slot('')
      setMatch2Slot('')
    },
    onError: () => {
      toast.error('Something went wrong while swapping players')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!match1Id || !match2Id || !match1Slot || !match2Slot) {
      toast.error('All fields are required')
      return
    }

    mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#343A40]">Match 1 ID</label>
          <Input
            value={match1Id}
            onChange={e => setMatch1Id(e.target.value)}
            placeholder="Enter match 1 id"
            className="h-[48px] border border-[#C0C3C1]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#343A40]">Match 2 ID</label>
          <Input
            value={match2Id}
            onChange={e => setMatch2Id(e.target.value)}
            placeholder="Enter match 2 id"
            className="h-[48px] border border-[#C0C3C1]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#343A40]">Match 1 Slot</label>
          <Select value={match1Slot} onValueChange={setMatch1Slot}>
            <SelectTrigger className="h-[48px] border border-[#C0C3C1]">
              <SelectValue placeholder="Select slot" />
            </SelectTrigger>
            <SelectContent>
              {slotOptions.map(option => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#343A40]">Match 2 Slot</label>
          <Select value={match2Slot} onValueChange={setMatch2Slot}>
            <SelectTrigger className="h-[48px] border border-[#C0C3C1]">
              <SelectValue placeholder="Select slot" />
            </SelectTrigger>
            <SelectContent>
              {slotOptions.map(option => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-[44px]"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isPending}
          className="h-[44px] bg-[#DF1020] hover:bg-[#C40E1C] text-white"
        >
          {isPending ? 'Swapping...' : 'Swap Player'}
        </Button>
      </div>
    </form>
  )
}

export default SwapPlayerContainer
