"use client";

import { useEffect, useMemo, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, MoveLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import TableSkeleton from "@/app/(organizer)/_components/player-paricipation-loading";
import ErrorContainer from "@/components/shared/ErrorContainer/ErrorContainer";
import NotFound from "@/components/shared/NotFound/NotFound";
import { TournamentPlayersRoundApiResponse } from "../../create-match/_components/round-tournament-data-type";

type MatchParticipant = {
  _id: string;
  fullName?: string;
  email?: string;
  teamName?: string;
};

type MatchPlayer = {
  _id: string;
  name: string;
};

type SelectablePlayer = {
  _id: string;
  name: string;
};

type TournamentEntry = {
  playerId?: { _id: string; fullName?: string; email?: string } | null;
  pairId?: { _id: string; teamName?: string } | null;
};

const getParticipantId = (
  participant: MatchParticipant | string | null | undefined,
) => {
  if (!participant) return "";
  if (typeof participant === "string") return participant;
  return participant._id || "";
};

const getParticipantDisplayName = (
  participant: MatchParticipant | string | null | undefined,
) => {
  if (!participant || typeof participant === "string") return "";
  return (
    participant.fullName?.trim() ||
    participant.teamName?.trim() ||
    participant.email?.trim() ||
    ""
  );
};

type SingleMatchResponse = {
  success: boolean;
  message?: string;
  data: {
    _id: string;
    tournamentId: {
      _id: string;
      tournamentName: string;
      sportName: string;
      format: string;
    };
    round: number;
    matchNumber: number;
    matchType: string;
    player1Id: MatchParticipant | null;
    player2Id: MatchParticipant | null;
    pair1Id: MatchParticipant | null;
    pair2Id: MatchParticipant | null;
    date: string | null;
    venue?: string;
    status: string;
  };
  players: MatchPlayer[];
};

const ALLOWED_STATUSES = [
  "pending",
  "scheduled",
  "in-progress",
  "completed",
  "rescheduled",
] as const;

const formSchema = z.object({
  date: z.date().nullable(),
  venue: z.string().min(1, "Venue is required"),
  status: z.enum(ALLOWED_STATUSES, { message: "Match status is required" }),
  player1Id: z.string().min(1, "Player / Pair 1 is required"),
  player2Id: z.string().min(1, "Player / Pair 2 is required"),
});

const normalizeStatus = (
  status?: string,
): (typeof ALLOWED_STATUSES)[number] => {
  const value = status?.trim().toLowerCase();

  if (!value) return "scheduled";
  if (value === "ongoing" || value === "in progress") return "in-progress";
  if (value === "upcoming") return "scheduled";
  if (value === "cancelled") return "rescheduled";

  if (ALLOWED_STATUSES.includes(value as (typeof ALLOWED_STATUSES)[number])) {
    return value as (typeof ALLOWED_STATUSES)[number];
  }

  return "scheduled";
};

const EditMatchForm = () => {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.id as string;

  const session = useSession();
  const token = (session?.data?.user as { accessToken: string })?.accessToken;
  const queryClient = useQueryClient();
  const isParticipantValueHydratedRef = useRef(false);

  const {
    data: matchData,
    isLoading,
    isError,
    error,
  } = useQuery<SingleMatchResponse>({
    queryKey: ["single-match-edit", matchId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/match/${matchId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.json();
    },
    enabled: !!matchId && !!token,
  });

  const match = matchData?.data;

  const { data: tournamentDetails } =
    useQuery<TournamentPlayersRoundApiResponse>({
      queryKey: ["tournament-details-for-edit", match?.tournamentId?._id],
      queryFn: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/findplayer/${match?.tournamentId?._id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        return res.json();
      },
      enabled: !!match?.tournamentId?._id && !!token,
    });

  const players = matchData?.players ?? [];
  const tournamentEntries = (tournamentDetails?.data ?? []) as TournamentEntry[];
  const selectablePlayers = useMemo<SelectablePlayer[]>(() => {
    const options = new Map<string, SelectablePlayer>();

    players.forEach((player) => {
      options.set(player._id, player);
    });

    tournamentEntries.forEach((entry) => {
      if (entry.pairId?._id) {
        options.set(entry.pairId._id, {
          _id: entry.pairId._id,
          name: entry.pairId.teamName?.trim() || "Unnamed pair",
        });
        return;
      }

      if (entry.playerId?._id) {
        options.set(entry.playerId._id, {
          _id: entry.playerId._id,
          name:
            entry.playerId.fullName?.trim() ||
            entry.playerId.email?.trim() ||
            "Unnamed player",
        });
      }
    });

    const player1 = match?.player1Id ?? match?.pair1Id;
    const player2 = match?.player2Id ?? match?.pair2Id;

    [player1, player2].forEach((participant) => {
      const participantId = getParticipantId(participant);
      if (!participantId) return;

      const fallbackName =
        getParticipantDisplayName(participant) || "Selected participant";

      if (!options.has(participantId)) {
        options.set(participantId, {
          _id: participantId,
          name: fallbackName,
        });
      }
    });

    return Array.from(options.values());
  }, [
    players,
    tournamentEntries,
    match?.player1Id,
    match?.pair1Id,
    match?.player2Id,
    match?.pair2Id,
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: match?.date ? new Date(match?.date) : null,
      venue: match?.venue || "",
      status: normalizeStatus(match?.status),
      player1Id: getParticipantId(match?.player1Id ?? match?.pair1Id),
      player2Id: getParticipantId(match?.player2Id ?? match?.pair2Id),
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["edit-match", matchId],
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const payload = {
        date:
          values.date instanceof Date
            ? format(values.date, "yyyy-MM-dd")
            : values.date,
        venue: values.venue,
        status: values.status,
        player1Id: values.player1Id,
        player2Id: values.player2Id,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/match/${matchId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      return res.json();
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong");
        return;
      }

      toast.success(data?.message || "Match updated successfully");
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["single-match", matchId] });
      queryClient.invalidateQueries({
        queryKey: ["single-match-edit", matchId],
      });
      router.push("/organizer/matches-management");
    },
  });

  useEffect(() => {
    if (!match) return;
    isParticipantValueHydratedRef.current = false;
    form.reset({
      date: match.date ? new Date(match.date) : null,
      venue: match.venue || "",
      status: normalizeStatus(match.status),
      player1Id: getParticipantId(match.player1Id ?? match.pair1Id),
      player2Id: getParticipantId(match.player2Id ?? match.pair2Id),
    });
  }, [match, form]);

  useEffect(() => {
    if (!match || isParticipantValueHydratedRef.current) return;
    if (selectablePlayers.length === 0) return;

    const player1Id = getParticipantId(match.player1Id ?? match.pair1Id);
    const player2Id = getParticipantId(match.player2Id ?? match.pair2Id);

    form.setValue("player1Id", player1Id, {
      shouldDirty: false,
      shouldValidate: false,
    });
    form.setValue("player2Id", player2Id, {
      shouldDirty: false,
      shouldValidate: false,
    });
    isParticipantValueHydratedRef.current = true;
  }, [match, selectablePlayers, form]);

  if (isLoading) {
    return (
      <div className="p-6">
        <TableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <ErrorContainer
          message={(error as Error)?.message || "Something went wrong"}
        />
      </div>
    );
  }

  if (!matchData?.success || !match) {
    return (
      <div className="p-6">
        <NotFound message="Match not found" />
      </div>
    );
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const selectedDate =
      values.date instanceof Date && !isNaN(values.date.getTime())
        ? values.date
        : values.date !== null
          ? new Date(values.date)
          : new Date();

    if (Number.isNaN(selectedDate.getTime())) {
      toast.error("Please select a valid date");
      return;
    }

    const roundsByNumber =
      tournamentDetails?.rounds
        ?.slice()
        .sort((a, b) => a.roundNumber - b.roundNumber) ?? [];

    const currentRoundIndex = roundsByNumber.findIndex(
      (round) => round.roundNumber === match.round,
    );

    if (currentRoundIndex !== -1) {
      const currentRound = roundsByNumber[currentRoundIndex];
      const nextRound = roundsByNumber[currentRoundIndex + 1];

      const roundStartDate = new Date(currentRound.date);
      const nextRoundDate = nextRound ? new Date(nextRound.date) : null;

      selectedDate.setHours(0, 0, 0, 0);
      roundStartDate.setHours(0, 0, 0, 0);
      if (nextRoundDate) nextRoundDate.setHours(0, 0, 0, 0);

      if (selectedDate < roundStartDate) {
        toast.error(
          `Round ${match.round} match date must be on or after ${format(
            roundStartDate,
            "MMM dd, yyyy",
          )}.`,
        );
        return;
      }

      if (nextRoundDate && selectedDate >= nextRoundDate) {
        toast.error(
          `Round ${match.round} match date must be before ${format(
            nextRoundDate,
            "MMM dd, yyyy",
          )}.`,
        );
        return;
      }
    }

    mutate(values);
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/organizer/matches-management")}
          className="h-10 px-5 rounded-[8px]"
        >
          <MoveLeft/> Back
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-base text-[#434C45] leading-[150%] font-medium">
                Match Type
              </label>
              <Input
                value={match.matchType || ""}
                disabled
                className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium text-[#434C45]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-base text-[#434C45] leading-[150%] font-medium">
                Tournament
              </label>
              <Input
                value={match.tournamentId?.tournamentName || ""}
                disabled
                className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium text-[#434C45]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-base text-[#434C45] leading-[150%] font-medium">
                Round
              </label>
              <Input
                value={`Round ${match.round} - Match ${match.matchNumber}`}
                disabled
                className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium text-[#434C45]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="player1Id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                    Player / Pair 1
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium text-[#434C45]">
                        <SelectValue placeholder="Select player / pair 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectablePlayers.map((player) => (
                          <SelectItem key={player._id} value={player._id}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="player2Id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                    Player / Pair 2
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium text-[#434C45]">
                        <SelectValue placeholder="Select player / pair 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectablePlayers.map((player) => (
                          <SelectItem key={player._id} value={player._id}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-black leading-[120%]">
                    Start Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left h-12 ${!field.value && "text-muted-foreground"}`}
                      >
                        {field.value instanceof Date &&
                        !isNaN(field.value.getTime())
                          ? format(field.value, "MMM dd, yyyy")
                          : "mm/dd/yyyy"}

                        <CalendarIcon className="ml-auto h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ?? undefined}
                        onSelect={(date) => field.onChange(date ?? null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                    Venue
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter venue"
                      className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium text-[#434C45]"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                    Match Status
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium text-[#434C45]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rescheduled">Rescheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/organizer/matches-management")}
              className="h-[49px] text-[#929292] text-lg font-medium leading-[150%] border-[1px] border-[#929292] rounded-[8px] py-3 px-16"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              type="submit"
              className="h-[49px] bg-gradient-to-b from-[#DF1020] to-[#310000] hover:from-[#310000] hover:to-[#DF1020] transition-all duration-300 text-[#F7F8FA] font-bold text-lg leading-[120%] rounded-[8px] px-20"
            >
              {isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditMatchForm;
