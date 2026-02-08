"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useEffect } from "react"
import { TournamentResponseData } from "./single-tournament-data-type";
import HoldEachRoundToggle from "./hold-each-round";

const formSchema = z.object({
  tournamentName: z.string().min(2, {
    message: "Event Name must be at least 2 characters.",
  }),
  sportName: z.string().min(1, {
    message: "Sport Name is required.",
  }),
  numberOfSeeds: z
    .coerce
    .number()
    .int()
    .optional(),

  drawSize: z.coerce.number().pipe(z.number().min(1).int()),

  drawFormat: z.string().min(1, {
    message: "Draw Format is required.",
  }),
  format: z.string().min(1, {
    message: "Format is required.",
  }),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),

  location: z.string().optional(),
  // terms: z.boolean().refine((val) => val === true, {
  //   message: "You must accept the terms and conditions.",
  // }),
})

const TournamentDetailsPage = (data: { data: TournamentResponseData }) => {
  console.log(data)
  const tournamentId = (data?.data?.tournament as unknown as { _id: string })?._id;
  const session = useSession();
  const token = (session?.data?.user as { accessToken: string })?.accessToken;
  console.log(token)
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tournamentName: "",
      sportName: "",
      drawSize: 8,
      drawFormat: "",
      format: "",
      startDate: null,
      endDate: null,
      numberOfSeeds: 1,
      location: "",
      // terms: false,
    },
  })

  const DRAW_FORMAT_OPTIONS = [
    // { id: "matrix", label: "Matrix 2", value: "matrix" },
    { id: "knockout", label: "Knockout ?", value: "Knockout" },
    { id: "teams", label: "Teams ?", value: "Teams" },
  ]



  useEffect(() => {
    if (!data?.data?.tournament) return;

    form.reset({
      tournamentName: data?.data?.tournament?.tournamentName ?? "",
      sportName: data?.data?.tournament?.sportName ?? "",
      drawFormat: data?.data?.tournament?.drawFormat,
      format: data?.data?.tournament?.format,
      drawSize: data?.data?.tournament?.drawSize,
      location: data?.data?.tournament?.location,
      numberOfSeeds: Number(data?.data?.tournament?.numberOfSeeds),
      startDate: data?.data?.tournament?.startDate
        ? new Date(data?.data?.tournament?.startDate)
        : null,
      endDate: data?.data?.tournament?.endDate
        ? new Date(data?.data?.tournament?.endDate)
        : null,
      // terms: false,
    });
  }, [data, form]);


  const { mutate, isPending } = useMutation({
    mutationKey: ["tournament-details", tournamentId],
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${tournamentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong");
        return;
      }
      toast.success(data?.message || "Tournement updated successfully")
      queryClient.invalidateQueries({ queryKey: ["single-tournament"] })
    },
  })


  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    mutate(values)
  }
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="tournamentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#343A40] leading-[150%] font-medium">Event Name *</FormLabel>
                  <FormControl>
                    <Input className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]" placeholder="Enter your tournament name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="sportName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#343A40] leading-[150%] font-medium">Sport *</FormLabel>
                  <FormControl>
                    <Input className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]" placeholder="Golf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="sportName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                    Sport <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      key={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45]">
                        <SelectValue placeholder="Select Sport name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Golf">Golf</SelectItem>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Tennis">Tennis</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="drawFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                    Draw Format <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-6">
                      {DRAW_FORMAT_OPTIONS?.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={`py-3 px-4 rounded-[8px] border-2 text-base font-medium leading-[120%] transition-all duration-200 ${field.value === option.value
                            ? "border-primary bg-[#F0FFFE] text-[#434C45]"
                            : "border-[#C0C3C1] bg-white text-[#434C45] hover:border-primary"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                    Format <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      key={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]">
                        <SelectValue placeholder="Pairs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Pairs">Pairs</SelectItem>
                        <SelectItem value="Team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="drawSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#434C45] leading-[150%] font-medium">
                    Draw Size
                  </FormLabel>
                  <FormControl>
                    <Select
                      key={String(field.value)}
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]">
                        <SelectValue placeholder="Parallel Unique  Club" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="16">16</SelectItem>
                        <SelectItem value="32">32</SelectItem>
                        <SelectItem value="64">64</SelectItem>
                        <SelectItem value="128">128</SelectItem>
                        <SelectItem value="256">256</SelectItem>
                        <SelectItem value="512">512</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfSeeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#343A40] leading-[150%] font-medium">Number of Seeds (optional) </FormLabel>
                  <FormControl>
                    <Input className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]" placeholder="Completed" value={String(field.value)} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-black leading-[120%]">
                    Start Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left h-12 ${!field.value && "text-muted-foreground"
                            }`}
                        >
                          {/* {field.value
                            ? format(field.value, "MMM dd, yyyy")
                            : "mm/dd/yyyy"} */}
                          {field.value instanceof Date && !isNaN(field.value.getTime())
                            ? format(field.value, "MMM dd, yyyy")
                            : "mm/dd/yyyy"}

                          <CalendarIcon className="ml-auto h-4 w-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      {/* <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      /> */}
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
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-black leading-[120%]">
                    End Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left h-12 ${!field.value && "text-muted-foreground"
                            }`}
                        >
                          {/* {field.value
                            ? format(field.value, "MMM dd, yyyy")
                            : "mm/dd/yyyy"} */}
                          {field.value instanceof Date && !isNaN(field.value.getTime())
                            ? format(field.value, "MMM dd, yyyy")
                            : "mm/dd/yyyy"}

                          <CalendarIcon className="ml-auto h-4 w-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      {/* <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      /> */}
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-[#343A40] leading-[150%] font-medium">Location</FormLabel>
                  <FormControl>
                    <Input className="w-full h-[48px] py-2 px-3 rounded-[8px] border border-[#C0C3C1] text-base font-medium leading-[120%] text-[#434C45)]" placeholder="Home V Away" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          {/* <div>
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="terms"
                      className="mt-3"
                    />
                  </FormControl>
                  <div>
                    <Label
                      htmlFor="terms"
                      className="text-base text-[#1F2937] font-normal leading-[150%]"
                    >

                      If checked, the next round of matches will not be displayed until the current round has been completed.
                    </Label> <br />

                    <FormMessage className="text-red-500 pt-2" />
                  </div>
                </FormItem>
              )}
            />
          </div> */}


          {/* Buttons */}
          <div className="flex justify-end gap-6 pt-3">
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

      {/* hold each round */}
      <div>
        <HoldEachRoundToggle
          tournamentId={tournamentId}
          defaultValue={data?.data?.tournament?.onHold}
        />
        {/* <h4 className="text-base md:text-lg font-semibold text-[#131313] pb-1">Hold Each Round</h4>
        <p className="text-sm md:text-base text-[#424242] text-font-normal">If checked, the next round of matches will not be displayed until the current round has been completed.</p> */}
      </div>
    </div>
  )
}

export default TournamentDetailsPage