"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { TournamentResponseData } from "./single-tournament-data-type"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  rememberEmail: z.number().optional(),
  rounds: z.array(
    z.object({
      date: z.date().nullable(),
    })
  ),
});


const TournamentRounds = (data: { data: TournamentResponseData & { rememberEmail?: number; totalRounds?: number } }) => {
  const tournamentId = (data?.data?.tournament as unknown as { _id: string })?._id;

  console.log(data)
  const session = useSession();
  const token = (session?.data?.user as { accessToken: string })?.accessToken;
  console.log(token)
  const queryClient = useQueryClient();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rememberEmail: undefined,
      rounds: [],
    },
  });



  console.log(data?.data)

  // const startDate = data?.data?.tournament?.startDate
  // const startDate = data?.data?.tournament?.startDate
  // ? new Date(data.data.tournament.startDate)
  // : null;



  useEffect(() => {
    if (!data?.data) return;

    const totalRounds = data?.data?.tournament?.totalRounds ?? 0;
    const existingRounds = data.data.rounds ?? [];

    form.reset({
      rememberEmail: data?.data?.tournament?.rememberEmail ?? undefined,
      rounds: Array.from({ length: totalRounds }, (_, index) => ({
        date: existingRounds[index]?.date
          ? new Date(existingRounds[index].date)
          : null,
      })),
    });
  }, [data, form]);




  const { mutate, isPending } = useMutation({
    mutationKey: ["tournament-details", tournamentId],
    mutationFn: async (payload: { rememberEmail: number, rounds: { roundName: string; date: string | null }[] }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${tournamentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong");
        return;
      }
      toast.success(data?.message || "Tournament updated successfully");
      queryClient.invalidateQueries({ queryKey: ["single-tournament"] });
    },
  });


  // function onSubmit(values: z.infer<typeof formSchema>) {

  //     if (!startDate) {
  //   toast.error("Tournament start date not found");
  //   return;
  // }

  // // 🔴 Validate rounds date
  // const invalidRound = values.rounds.find(
  //   (round) => round.date && round.date <= startDate
  // );

  // if (invalidRound) {
  //   toast.error(
  //     `Round deadline must be after ${format(startDate, "dd-MM-yyyy")}`
  //   );
  //   return;
  // }

  
  //   const payload = {
  //     rememberEmail: (values.rememberEmail ?? 0),
  //     rounds: values.rounds.map((round, index) => ({
  //       roundName: `Round ${index + 1}`,
  //       date: round.date ? format(round.date, "yyyy-MM-dd") : null,
  //     })),
  //   };

  //   mutate(payload);
  // }


  function onSubmit(values: z.infer<typeof formSchema>) {
  const startDateRaw = data?.data?.tournament?.startDate
  const endDateRaw = data?.data?.tournament?.endDate

  const start = startDateRaw ? new Date(startDateRaw) : null
  const end = endDateRaw ? new Date(endDateRaw) : null

  if (!start) {
    toast.error("Tournament start date not found")
    return
  }

  if (!end) {
    toast.error("Tournament end date not found")
    return
  }

  // normalize time (avoid time issues)
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())

  // ✅ 1) Validate: each round date must be inside startDate & endDate
  const invalidIndex = values.rounds.findIndex((round) => {
    if (!round.date) return false
    const d = new Date(round.date.getFullYear(), round.date.getMonth(), round.date.getDate())
    return d < startDay || d > endDay
  })

  if (invalidIndex !== -1) {
    toast.error(
      `Round ${invalidIndex + 1} deadline must be between ${format(
        startDay,
        "dd-MM-yyyy"
      )} and ${format(endDay, "dd-MM-yyyy")}`
    )
    return
  }

 // ✅ Duplicate round date check (same date can't be used in multiple rounds)
const seen = new Set<string>()

for (let i = 0; i < values.rounds.length; i++) {
  const d = values.rounds[i]?.date
  if (!d) continue // ignore empty dates

  const key = format(d, "yyyy-MM-dd") // normalize to day

  if (seen.has(key)) {
    toast.error(`Same deadline date can't be used in multiple rounds: ${format(d, "dd-MM-yyyy")}`)
    return
  }

  seen.add(key)
}

  // ✅ 3) Sequential round date check (Round N must be AFTER Round N-1)
  for (let i = 1; i < values.rounds.length; i++) {
    const prev = values.rounds[i - 1]?.date
    const curr = values.rounds[i]?.date

    // If you want required dates, replace this with an error instead of continue
    if (!prev || !curr) continue

    const prevDay = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate())
    const currDay = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate())

    if (currDay <= prevDay) {
      toast.error(
        `Round ${i + 1} deadline must be after Round ${i} (${format(
          prevDay,
          "dd-MM-yyyy"
        )})`
      )
      return
    }
  }

  const payload = {
    rememberEmail: values.rememberEmail ?? 0,
    rounds: values.rounds.map((round, index) => ({
      roundName: `Round ${index + 1}`,
      date: round.date ? format(round.date, "yyyy-MM-dd") : null,
    })),
  }

  mutate(payload)
}



  return (
    <div>
      <h4 className="text-lg md:text-xl font-semibold text-[#181818] leading-[120%]">Reminder Emails Days Before</h4>
      <p className="text-base text-[#181818] leading-[150%] font-normal pt-2">Please enter the number of days before the round deadline for sending a reminder email to those who have not played their match.</p>

      <div className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <FormField
              control={form.control}
              name="rememberEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#343A40] leading-[150%] font-medium">
                    Reminder
                  </FormLabel>
                  <FormControl>
                    <Select
                      key={field.value}
                      value={field.value !== undefined ? String(field.value) : undefined}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#131313] placeholder:text-[#434C45]">
                        <SelectValue placeholder="Select Reminder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Days Later</SelectItem>
                        <SelectItem value="10">10 Days Later</SelectItem>
                        <SelectItem value="15">15 Days Later</SelectItem>
                        <SelectItem value="20">20 Days Later</SelectItem>
                        <SelectItem value="25">25 Days Later</SelectItem>
                        <SelectItem value="30">30 Days Later</SelectItem>
                        <SelectItem value="35">35 Days Later</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div>
              <h4 className="text-lg md:text-xl text-[#181818] font-semibold leading-[120%]">
                Round Deadlines
              </h4>

              {form.watch("rounds")?.map((_, index) => (
                <div key={index} className="space-y-2 py-2">

                  {/* Deadline Date */}
                  <FormField
                    control={form.control}
                    name={`rounds.${index}.date`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left h-12 ${!field.value && "text-muted-foreground"
                                  }`}
                              >
                                {field.value instanceof Date && !isNaN(field.value.getTime())
                                  ? format(field.value, "dd-MM-yyyy")
                                  : "dd/mm/yyyy"}
                                <CalendarIcon className="ml-auto h-4 w-4" />
                              </Button>
                            </FormControl>
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
                </div>
              ))}

            </div>
            {/* Buttons */}
            <div className="flex justify-end gap-6 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="h-[49px] text-[#F2415A] text-lg font-medium leading-[150%] border-[1px] border-[#F2415A] rounded-[8px] py-3 px-16"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                type="submit"
                className="h-[49px] bg-gradient-to-b from-[#DF1020] to-[#310000]
            hover:from-[#310000] hover:to-[#DF1020]
            transition-all duration-300 text-[#F7F8FA] font-bold text-lg leading-[120%] rounded-[8px] px-20"
              >
                {isPending ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default TournamentRounds