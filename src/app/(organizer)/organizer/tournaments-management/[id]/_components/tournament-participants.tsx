// "use client";

// import { useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm, useFieldArray } from "react-hook-form";
// import { z } from "zod";
// import { useSession } from "next-auth/react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";

// import CsvUploadInput from "./CsvUploadInput";
// import { TournamentResponseData } from "./single-tournament-data-type";

// /* ---------------- HELPERS ---------------- */

// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// const createEmptyPlayer = () => ({
//   fullName: "",
//   email: "",
//   phone: "",
//   captainName: "",
//   seed: "",
// });

// const getDefaultPlayers = (format?: string) => {
//   if (format === "Pairs") {
//     return [createEmptyPlayer(), createEmptyPlayer()];
//   }

//   return [createEmptyPlayer()];
// };

// /* ---------------- ZOD SCHEMA ---------------- */

// const playerSchema = z.object({
//   fullName: z.string().optional(),
//   email: z.string().optional(),
//   phone: z.string().optional(),
//   captainName: z.string().optional(),
//   seed: z.string().optional(),
// });

// const formSchema = z
//   .object({
//     players: z.array(playerSchema),
//     csvFile: z
//       .instanceof(File)
//       .refine((file) => file.type === "text/csv", {
//         message: "Only CSV files are allowed",
//       })
//       .optional(),
//   })
//   .refine(
//     (data) => {
//       const hasCsvFile = !!data.csvFile;

//       const hasPlayerData = data.players.some(
//         (player) =>
//           player.fullName ||
//           player.email ||
//           player.phone ||
//           player.captainName ||
//           player.seed,
//       );

//       return hasCsvFile || hasPlayerData;
//     },
//     {
//       message: "Please provide either CSV file or player information",
//       path: ["csvFile"],
//     },
//   )
//   .superRefine((data, ctx) => {
//     if (data.csvFile) return;

//     const isPairFormat = data.players.length === 2;

//     data.players.forEach((player, index) => {
//       const hasAnyValue =
//         !!player.fullName ||
//         !!player.email ||
//         !!player.phone ||
//         !!player.captainName ||
//         !!player.seed;

//       if (!hasAnyValue) return;

//       if (!player.fullName || player.fullName.trim().length < 2) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Full name is required",
//           path: ["players", index, "fullName"],
//         });
//       }

//       if (!player.email || !emailRegex.test(player.email)) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Valid email is required",
//           path: ["players", index, "email"],
//         });
//       }

//       if (!player.phone || player.phone.trim().length < 6) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Valid phone is required",
//           path: ["players", index, "phone"],
//         });
//       }

//       if (!isPairFormat) {
//         if (!player.captainName || player.captainName.trim().length < 2) {
//           ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             message: "Captain name is required",
//             path: ["players", index, "captainName"],
//           });
//         }
//       }
//     });
//   });

// type FormValues = z.infer<typeof formSchema>;

// /* ---------------- COMPONENT ---------------- */

// const TournamentParticipantsPage = (data: { data: TournamentResponseData }) => {
//   const queryClient = useQueryClient();

//   const tournamentId = (data?.data?.tournament as unknown as { _id: string })
//     ?._id;
//   const format = data?.data?.tournament?.format;
//   const isPair = format === "Pairs";

//   const { data: session } = useSession();
//   const token = (session?.user as { accessToken: string })?.accessToken;

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       csvFile: undefined,
//       players: getDefaultPlayers(format),
//     },
//   });

//   const { fields } = useFieldArray({
//     control: form.control,
//     name: "players",
//   });

//   useEffect(() => {
//     form.reset({
//       csvFile: undefined,
//       players: getDefaultPlayers(format),
//     });
//   }, [format, form]);

//   const { mutate, isPending } = useMutation({
//     mutationKey: ["tournament-participants", tournamentId],

//     mutationFn: async (values: FormValues) => {
//       const filledPlayers = values.players.filter(
//         (player) =>
//           player.fullName ||
//           player.email ||
//           player.phone ||
//           player.captainName ||
//           player.seed,
//       );

//       if (!values.csvFile) {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${tournamentId}`,
//           {
//             method: "PUT",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify({
//               players: filledPlayers,
//             }),
//           },
//         );

//         if (!res.ok) {
//           throw new Error("Participant size exceeds tournament player size");
//         }

//         return res.json();
//       }

//       const formData = new FormData();

//       if (filledPlayers.length > 0) {
//         formData.append("players", JSON.stringify(filledPlayers));
//       }

//       formData.append("csvFile", values.csvFile);

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${tournamentId}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formData,
//         },
//       );

//       if (!res.ok) {
//         throw new Error("Participant size exceeds tournament player size");
//       }

//       return res.json();
//     },

//     onSuccess: (response) => {
//       if (!response?.success) {
//         toast.error(response?.message || "Something went wrong");
//         return;
//       }

//       toast.success(response?.message || "Tournament updated successfully");
//       queryClient.invalidateQueries({ queryKey: ["single-tournament"] });

//       form.reset({
//         csvFile: undefined,
//         players: getDefaultPlayers(format),
//       });
//     },

//     onError: (error) => {
//       console.error(error);
//       toast.error("Participant size exceeds tournament player size");
//     },
//   });

//   const onSubmit = (values: FormValues) => {
//     mutate(values);
//   };

//   return (
//     <div>
//       <h4 className="pb-6 text-lg font-semibold md:text-xl">
//         Participants ({format})
//       </h4>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
//           {fields.map((field, index) => {
//             const participantLabel = isPair ? `Player ${index + 1}` : "Team";
//             const contactLabel = isPair ? participantLabel : "Team Captain";

//             return (
//               <div
//                 key={field.id}
//                 className="rounded-lg border border-gray-200 p-6"
//               >
//                 <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//                   <FormField
//                     control={form.control}
//                     name={`players.${index}.fullName`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
//                           {participantLabel} Name
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base font-semibold leading-[150%] text-[#343A40] placeholder:text-[#8E938F]"
//                             placeholder={
//                               isPair ? `Enter Player ${index + 1} Name` : "Enter Team Name"
//                             }
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name={`players.${index}.email`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
//                           {contactLabel} Email
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base font-semibold leading-[150%] text-[#343A40] placeholder:text-[#8E938F]"
//                             placeholder={
//                               isPair
//                                 ? `Enter Player ${index + 1} Email`
//                                 : "Enter Team Captain Email"
//                             }
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name={`players.${index}.phone`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
//                           {contactLabel} Phone
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base font-semibold leading-[150%] text-[#343A40] placeholder:text-[#8E938F]"
//                             placeholder={
//                               isPair
//                                 ? `Enter Player ${index + 1} Phone`
//                                 : "Enter Team Captain Phone number"
//                             }
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
//                   {!isPair && (
//                     <FormField
//                       control={form.control}
//                       name={`players.${index}.captainName`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
//                             Team Captain Name
//                           </FormLabel>
//                           <FormControl>
//                             <Input
//                               className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base font-semibold leading-[150%] text-[#343A40] placeholder:text-[#8E938F]"
//                               placeholder="Enter Team Captain Name"
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   )}

//                   <FormField
//                     control={form.control}
//                     name={`players.${index}.seed`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
//                           Seed (optional)
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base font-semibold leading-[150%] text-[#343A40] placeholder:text-[#8E938F]"
//                             placeholder="Enter Seed"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </div>
//             );
//           })}

//           <FormField
//             control={form.control}
//             name="csvFile"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
//                   Import CSV file (optional). CSV format: fullName, email, phone
//                 </FormLabel>
//                 <FormControl>
//                   <CsvUploadInput
//                     value={field.value || null}
//                     onChange={(file) => {
//                       field.onChange(file);
//                     }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <div className="flex justify-end gap-6 pt-6">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() =>
//                 form.reset({
//                   csvFile: undefined,
//                   players: getDefaultPlayers(format),
//                 })
//               }
//               className="h-[49px] rounded-[8px] border-[1px] border-[#F2415A] px-16 py-3 text-lg font-medium leading-[150%] text-[#F2415A]"
//             >
//               Cancel
//             </Button>

//             <Button
//               disabled={isPending}
//               type="submit"
//               className="h-[49px] rounded-[8px] bg-gradient-to-b from-[#DF1020] to-[#310000] px-20 text-lg font-bold leading-[120%] text-[#F7F8FA] transition-all duration-300 hover:from-[#310000] hover:to-[#DF1020]"
//             >
//               {isPending ? "Saving..." : "Add"}
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// };

// export default TournamentParticipantsPage;





"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { toast } from "sonner";

import CsvUploadInput from "./CsvUploadInput";
import { TournamentResponseData } from "./single-tournament-data-type";

/* ---------------- HELPERS ---------------- */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createEmptyPlayer = () => ({
  fullName: "",
  email: "",
  phone: "",
  captainName: "",
  seeder: undefined as number | undefined,
});

const getDefaultPlayers = (format?: string) => {
  if (format === "Pairs") {
    return [createEmptyPlayer(), createEmptyPlayer()];
  }

  return [createEmptyPlayer()];
};

/* ---------------- ZOD SCHEMA ---------------- */

const playerSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  captainName: z.string().optional(),
  seeder: z.number().optional(),
});

const formSchema = z
  .object({
    players: z.array(playerSchema),
    csvFile: z
      .instanceof(File)
      .refine((file) => file.type === "text/csv", {
        message: "Only CSV files are allowed",
      })
      .optional(),
  })
  .refine(
    (data) => {
      const hasCsvFile = !!data.csvFile;

      const hasPlayerData = data.players.some(
        (player) =>
          player.fullName ||
          player.email ||
          player.phone ||
          player.captainName ||
          player.seeder !== undefined,
      );

      return hasCsvFile || hasPlayerData;
    },
    {
      message: "Please provide either CSV file or player information",
      path: ["csvFile"],
    },
  )
  .superRefine((data, ctx) => {
    if (data.csvFile) return;

    const isPairFormat = data.players.length === 2;

    data.players.forEach((player, index) => {
      const hasAnyValue =
        !!player.fullName ||
        !!player.email ||
        !!player.phone ||
        !!player.captainName ||
        player.seeder !== undefined;

      if (!hasAnyValue) return;

      if (!player.fullName || player.fullName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Full name is required",
          path: ["players", index, "fullName"],
        });
      }

      if (!player.email || !emailRegex.test(player.email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid email is required",
          path: ["players", index, "email"],
        });
      }

      if (!player.phone || player.phone.trim().length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid phone is required",
          path: ["players", index, "phone"],
        });
      }

      if (!isPairFormat) {
        if (!player.captainName || player.captainName.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Captain name is required",
            path: ["players", index, "captainName"],
          });
        }
      }

      if (
        player.seeder === undefined ||
        Number.isNaN(player.seeder)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seed number is required",
          path: ["players", index, "seeder"],
        });
      }
    });
  });

type FormValues = z.infer<typeof formSchema>;

/* ---------------- COMPONENT ---------------- */

const TournamentParticipantsPage = (data: { data: TournamentResponseData }) => {
  const queryClient = useQueryClient();

  const tournamentId = (data?.data?.tournament as unknown as { _id: string })
    ?._id;
  const format = data?.data?.tournament?.format;
  const isPair = format === "Pairs";

  const { data: session } = useSession();
  const token = (session?.user as { accessToken: string })?.accessToken;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      csvFile: undefined,
      players: getDefaultPlayers(format),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "players",
  });

  useEffect(() => {
    form.reset({
      csvFile: undefined,
      players: getDefaultPlayers(format),
    });
  }, [format, form]);

  const { mutate, isPending } = useMutation({
    mutationKey: ["tournament-participants", tournamentId],

    mutationFn: async (values: FormValues) => {
      const filledPlayers = values.players.filter(
        (player) =>
          player.fullName ||
          player.email ||
          player.phone ||
          player.captainName ||
          player.seeder !== undefined,
      );

      if (!values.csvFile) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${tournamentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              players: filledPlayers,
            }),
          },
        );

        if (!res.ok) {
          throw new Error("Failed to update tournament");
        }

        return res.json();
      }

      const formData = new FormData();

      if (filledPlayers.length > 0) {
        formData.append("players", JSON.stringify(filledPlayers));
      }

      formData.append("csvFile", values.csvFile);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${tournamentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error("Failed to update tournament");
      }

      return res.json();
    },

    onSuccess: (response) => {
      if (!response?.success) {
        toast.error(response?.message || "Something went wrong");
        return;
      }

      toast.success(response?.message || "Tournament updated successfully");
      queryClient.invalidateQueries({ queryKey: ["single-tournament"] });

      form.reset({
        csvFile: undefined,
        players: getDefaultPlayers(format),
      });
    },

    onError: (error) => {
      console.error(error);
      toast.error("Failed to update tournament");
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values);
  };

  return (
    <div>
      <h4 className="pb-6 text-lg font-semibold md:text-xl">
        Participants ({format})
      </h4>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {fields.map((field, index) => {
            const participantLabel = isPair ? `Player ${index + 1}` : "Team";
            const contactLabel = isPair ? participantLabel : "Team Captain";

            return (
              <div
                key={field.id}
                className="rounded-lg border border-gray-200 p-6"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name={`players.${index}.fullName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
                          {participantLabel} Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base font-semibold leading-[150%] text-[#343A40] placeholder:text-[#8E938F]"
                            placeholder={
                              isPair ? `Enter Player ${index + 1} Name` : "Enter Team Name"
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`players.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
                          {contactLabel} Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base font-semibold leading-[150%] text-[#343A40] placeholder:text-[#8E938F]"
                            placeholder={
                              isPair
                                ? `Enter Player ${index + 1} Email`
                                : "Enter Team Captain Email"
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`players.${index}.phone`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
                          {contactLabel} Phone
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base font-semibold leading-[150%] text-[#343A40] placeholder:text-[#8E938F]"
                            placeholder={
                              isPair
                                ? `Enter Player ${index + 1} Phone`
                                : "Enter Team Captain Phone number"
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
                  {!isPair && (
                    <FormField
                      control={form.control}
                      name={`players.${index}.captainName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
                            Team Captain Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base font-semibold leading-[150%] text-[#343A40] placeholder:text-[#8E938F]"
                              placeholder="Enter Team Captain Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name={`players.${index}.seeder`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
                          Seed
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base font-semibold leading-[150%] text-[#343A40] placeholder:text-[#8E938F]"
                            placeholder="Enter Seed"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? undefined : Number(value),
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500"/>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            );
          })}

          <FormField
            control={form.control}
            name="csvFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold leading-[150%] text-[#343A40]">
                  Import CSV file (optional). CSV format: fullName, email, phone
                </FormLabel>
                <FormControl>
                  <CsvUploadInput
                    value={field.value || null}
                    onChange={(file) => {
                      field.onChange(file);
                    }}
                  />
                </FormControl>
                <FormMessage className="text-red-500"/>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-6 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.reset({
                  csvFile: undefined,
                  players: getDefaultPlayers(format),
                })
              }
              className="h-[49px] rounded-[8px] border-[1px] border-[#F2415A] px-16 py-3 text-lg font-medium leading-[150%] text-[#F2415A]"
            >
              Cancel
            </Button>

            <Button
              disabled={isPending}
              type="submit"
              className="h-[49px] rounded-[8px] bg-gradient-to-b from-[#DF1020] to-[#310000] px-20 text-lg font-bold leading-[120%] text-[#F7F8FA] transition-all duration-300 hover:from-[#310000] hover:to-[#DF1020]"
            >
              {isPending ? "Saving..." : "Add"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TournamentParticipantsPage;













// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm, useFieldArray } from "react-hook-form";
// import { z } from "zod";
// import { useSession } from "next-auth/react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";

// import CsvUploadInput from "./CsvUploadInput";
// import { TournamentResponseData } from "./single-tournament-data-type";

// /* ---------------- ZOD SCHEMA ---------------- */

// const playerSchema = z.object({
//   fullName: z.string().optional(),
//   email: z.string().optional(),
//   phone: z.string().optional(),
//   captainName: z.string().optional(),
//   seed: z.string().optional(),
// });

// const formSchema = z
//   .object({
//     players: z.array(playerSchema),
//     csvFile: z
//       .instanceof(File)
//       .refine((file) => file.type === "text/csv", {
//         message: "Only CSV files are allowed",
//       })
//       .optional(),
//   })
//   .refine(
//     (data) => {
//       const hasCsvFile = !!data.csvFile;

//       const hasPlayerData = data.players.some(
//         (player) =>
//           player.fullName ||
//           player.email ||
//           player.phone ||
//           player.captainName ||
//           player.seed,
//       );

//       return hasCsvFile || hasPlayerData;
//     },
//     {
//       message: "Please provide either CSV file or player information",
//       path: ["csvFile"],
//     },
//   )
//   .refine(
//     (data) => {
//       if (!data.csvFile) {
//         const playersWithData = data.players.filter(
//           (player) =>
//             player.fullName ||
//             player.email ||
//             player.phone ||
//             player.captainName ||
//             player.seed,
//         );

//         // ✅ Seed is optional, so removed from required validation
//         return playersWithData.every(
//           (player) =>
//             player.fullName &&
//             player.fullName.length >= 2 &&
//             player.email &&
//             /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player.email) &&
//             player.phone &&
//             player.phone.length >= 6 &&
//             player.captainName &&
//             player.captainName.length >= 2,
//         );
//       }
//       return true;
//     },
//     {
//       message: "Please complete all fields for each player you're adding",
//       path: ["players"],
//     },
//   );

// // const formSchema = z
// //   .object({
// //     players: z.array(playerSchema),
// //     csvFile: z
// //       .instanceof(File)
// //       .refine((file) => file.type === "text/csv", {
// //         message: "Only CSV files are allowed",
// //       })
// //       .optional(),
// //   })
// //   .refine(
// //     (data) => {
// //       // Check if CSV file exists
// //       const hasCsvFile = !!data.csvFile

// //       // Check if any player has filled data
// //       const hasPlayerData = data.players.some(
// //         (player) =>
// //           player.fullName ||
// //           player.email ||
// //           player.phone ||
// //           player.captainName ||
// //           player.seed
// //       )

// //       // At least one of them must be present
// //       return hasCsvFile || hasPlayerData
// //     },
// //     {
// //       message: "Please provide either CSV file or player information",
// //       path: ["csvFile"],
// //     }
// //   )
// //   .refine(
// //     (data) => {
// //       // If no CSV file, validate that players with data are complete
// //       if (!data.csvFile) {
// //         const playersWithData = data.players.filter(
// //           (player) =>
// //             player.fullName ||
// //             player.email ||
// //             player.phone ||
// //             player.captainName ||
// //             player.seed
// //         )

// //         // Check if all filled players have complete data
// //         return playersWithData.every(
// //           (player) =>
// //             player.fullName &&
// //             player.fullName.length >= 2 &&
// //             player.email &&
// //             /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player.email) &&
// //             player.phone &&
// //             player.phone.length >= 6 &&
// //             player.captainName &&
// //             player.captainName.length >=2 &&
// //             player.seed &&
// //             player.seed.length >= 1
// //         )
// //       }
// //       return true
// //     },
// //     {
// //       message: "Please complete all fields for each player you're adding",
// //       path: ["players"],
// //     }
// //   )

// type FormValues = z.infer<typeof formSchema>;

// /* ---------------- COMPONENT ---------------- */

// // interface Props {
// //   data: Tournament
// // }

// const TournamentParticipantsPage = (data: { data: TournamentResponseData }) => {
//   const queryClient = useQueryClient();

//   const tournamentId = (data?.data?.tournament as unknown as { _id: string })
//     ?._id;
//   const format = data?.data?.tournament?.format;
//   // const { _id: tournamentId, format } = data
//   const isPair = format === "Pairs";

//   console.log("Received tournament data:", isPair);

//   const { data: session } = useSession();
//   const token = (session?.user as { accessToken: string })?.accessToken;

//   /* ---------------- FORM ---------------- */

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       csvFile: undefined,
//       players: isPair
//         ? [
//             { fullName: "", email: "", phone: "", captainName: "", seed: "" },
//             { fullName: "", email: "", phone: "", captainName: "", seed: "" },
//           ]
//         : [{ fullName: "", email: "", phone: "", captainName: "", seed: "" }],
//     },
//   });

//   const { fields } = useFieldArray({
//     control: form.control,
//     name: "players",
//   });

//   const { mutate, isPending } = useMutation({
//     mutationKey: ["tournament-participants", tournamentId],

//     mutationFn: async (values: FormValues) => {
//       const filledPlayers = values.players.filter(
//         (player) =>
//           player.fullName ||
//           player.email ||
//           player.phone ||
//           player.captainName ||
//           player.seed,
//       );

//       // 🔹 CASE 1: CSV NOT uploaded → send JSON
//       if (!values.csvFile) {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${tournamentId}`,
//           {
//             method: "PUT",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify({
//               players: filledPlayers,
//             }),
//           },
//         );

//         if (!res.ok) {
//           throw new Error("Participant size exceeds tournament player size");
//         }

//         return res.json();
//       }

//       // 🔹 CASE 2: CSV uploaded → send FormData
//       const formData = new FormData();

//       if (filledPlayers.length > 0) {
//         formData.append("players", JSON.stringify(filledPlayers));
//       }

//       formData.append("csvFile", values.csvFile);

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournament/${tournamentId}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formData,
//         },
//       );

//       if (!res.ok) {
//         throw new Error("Participant size exceeds tournament player size");
//       }

//       return res.json();
//     },

//     onSuccess: (response) => {
//       if (!response?.success) {
//         toast.error(response?.message || "Something went wrong");
//         return;
//       }

//       toast.success(response?.message || "Tournament updated successfully");
//       queryClient.invalidateQueries({ queryKey: ["single-tournament"] });
//       form.reset();
//     },

//     onError: (error) => {
//       console.error(error);
//       toast.error("Participant size exceeds tournament player size");
//     },
//   });

//   /* ---------------- SUBMIT ---------------- */

//   const onSubmit = (values: FormValues) => {
//     const payload = {
//       players: values.players,
//       csvFile: values.csvFile,
//     };

//     mutate(payload);
//   };

//   /* ---------------- UI ---------------- */

//   console.log(format);

//   return (
//     <div>
//       <h4 className="text-lg md:text-xl font-semibold pb-6">
//         Participants ({format})
//       </h4>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
//           {fields.map((field, index) => {
//             const participantLabel = isPair ? `Player ${index + 1}` : "Team";
//             const contactLabel = isPair ? participantLabel : "Team Captain";

//             return (
//               <div
//                 key={field.id}
//                 className="border border-gray-200 rounded-lg p-6"
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <FormField
//                     control={form.control}
//                     name={`players.${index}.fullName`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-base text-[#343A40] font-semibold leading-[150%]">
//                           {participantLabel} Name
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base text-[#343A40] placeholder:text-[#8E938F] font-semibold leading-[150%]"
//                             placeholder="Enter Team Name"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name={`players.${index}.email`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-base text-[#343A40] font-semibold leading-[150%]">
//                           {contactLabel} Email
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base text-[#343A40] placeholder:text-[#8E938F] font-semibold leading-[150%]"
//                             placeholder="Enter Team Captain Email"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name={`players.${index}.phone`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-base text-[#343A40] font-semibold leading-[150%]">
//                           {contactLabel} Phone
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base text-[#343A40] placeholder:text-[#8E938F] font-semibold leading-[150%]"
//                             placeholder="Enter Team Captain Phone number"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
//                   {format !== "Pairs" && (
//                     <FormField
//                       control={form.control}
//                       name={`players.${index}.captainName`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-base text-[#343A40] font-semibold leading-[150%]">
//                             Team Captain Name
//                           </FormLabel>
//                           <FormControl>
//                             <Input
//                               className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base text-[#343A40] placeholder:text-[#8E938F] font-semibold leading-[150%]"
//                               placeholder="Enter Team Captain Name"
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   )}

//                   <FormField
//                     control={form.control}
//                     name={`players.${index}.seed`}
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-base text-[#343A40] font-semibold leading-[150%]">
//                           Seed (optional)
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                           className="h-[48px] rounded-[4px] border border-[#C0C3C1] text-base text-[#343A40] placeholder:text-[#8E938F] font-semibold leading-[150%]"
//                           placeholder="Enter Seed"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                     )}
//                   />
//                 </div>
//               </div>
//             );
//           })}

//           {/* CSV Upload */}
//           <FormField
//             control={form.control}
//             name="csvFile"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-base text-[#343A40] font-semibold leading-[150%]">
//                   Import CSV file (optional). CSV format: fullName, email, phone
//                 </FormLabel>
//                 <FormControl>
//                   <CsvUploadInput
//                     value={field.value || null}
//                     onChange={(file) => {
//                       field.onChange(file);
//                     }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Buttons */}
//           <div className="flex justify-end gap-6 pt-6">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => form.reset()}
//               className="h-[49px] text-[#F2415A] text-lg font-medium leading-[150%] border-[1px] border-[#F2415A] rounded-[8px] py-3 px-16"
//             >
//               Cancel
//             </Button>
//             <Button
//               disabled={isPending}
//               type="submit"
//               className="h-[49px] bg-gradient-to-b from-[#DF1020] to-[#310000]
//                 hover:from-[#310000] hover:to-[#DF1020]
//                 transition-all duration-300 text-[#F7F8FA] font-bold text-lg leading-[120%] rounded-[8px] px-20"
//             >
//               {isPending ? "Saving..." : "Add"}
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// };

// export default TournamentParticipantsPage;
