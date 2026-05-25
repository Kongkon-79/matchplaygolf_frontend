
"use client";

import React, { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import type {
  SinglePlayerApiResponse,
  TournamentPlayer,
} from "./single-player-data-type";

/** ===================== HELPERS ===================== */
const isSingleEntry = (x?: TournamentPlayer | null) => !!x?.playerId && !x?.pairId;
const isPairEntry = (x?: TournamentPlayer | null) => !!x?.pairId && !x?.playerId;

/**
 * ✅ Seeder input kept as string (to avoid RHF + zod transform type issues)
 * - "" allowed
 * - only non-negative integer allowed
 */
const optionalSeederString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => v === undefined || v === "" || /^[0-9]+$/.test(v), {
    message: "Seeder must be a non-negative integer",
  });

/** ===================== ✅ SCHEMA ===================== */
const singleSchema = z.object({
  entryType: z.literal("single"),
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().trim().min(6, "Phone is required"),
  clubName: z.string().trim().min(1, "Club name is required"),
  seeder: optionalSeederString,

  // not used in single, keep optional
  p1FullName: z.string().optional().or(z.literal("")),
  p1Email: z.string().optional().or(z.literal("")),
  p1Phone: z.string().optional().or(z.literal("")),
  p1ClubName: z.string().optional().or(z.literal("")),
  p1Seeder: optionalSeederString,

  p2FullName: z.string().optional().or(z.literal("")),
  p2Email: z.string().optional().or(z.literal("")),
  p2Phone: z.string().optional().or(z.literal("")),
  p2ClubName: z.string().optional().or(z.literal("")),
  p2Seeder: optionalSeederString,
});

const pairSchema = z.object({
  entryType: z.literal("pair"),

  // not used in pair, keep optional
  fullName: z.string().optional().or(z.literal("")),
  email: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  clubName: z.string().optional().or(z.literal("")),
  seeder: optionalSeederString,

  // pair required
  p1FullName: z.string().trim().min(2, "Player 1 full name is required"),
  p1Email: z.string().trim().email("Valid email is required").optional().or(z.literal("")),
  p1Phone: z.string().trim().min(6, "Player 1 phone is required"),
  p1ClubName: z.string().trim().min(1, "Player 1 club name is required"),
  p1Seeder: optionalSeederString,

  p2FullName: z.string().trim().min(2, "Player 2 full name is required"),
  p2Email: z.string().trim().email("Valid email is required").optional().or(z.literal("")),
  p2Phone: z.string().trim().min(6, "Player 2 phone is required"),
  p2ClubName: z.string().trim().min(1, "Player 2 club name is required"),
  p2Seeder: optionalSeederString,
});

const formSchema = z.discriminatedUnion("entryType", [singleSchema, pairSchema]);
type FormValues = z.infer<typeof formSchema>;

/** ✅ FIX: accept string | undefined */
const parseSeeder = (v?: string): number | undefined => {
  const s = (v ?? "").trim();
  if (s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export default function EditPlayerModal({
  open,
  onOpenChange,
  playerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string | null;
}) {
  const { data: session } = useSession();
  const token =
    (session?.user as unknown as { accessToken?: string } | undefined)?.accessToken ?? "";

  const queryClient = useQueryClient();
  const enabled = Boolean(open && playerId && token);

  const { data, isLoading, isFetching, isError } = useQuery<SinglePlayerApiResponse>({
    queryKey: ["single-player", playerId],
    enabled,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/players/${playerId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = (await res.json()) as SinglePlayerApiResponse;

      if (!res.ok || json?.success === false) {
        throw new Error((json as unknown as { message?: string })?.message || "Failed to load player");
      }

      return json;
    },
  });

  const playerData = data?.data;

  const mode = useMemo<"single" | "pair" | "unknown">(() => {
    if (!playerData) return "unknown";
    if (isSingleEntry(playerData)) return "single";
    if (isPairEntry(playerData)) return "pair";
    return "unknown";
  }, [playerData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryType: "single",
      fullName: "",
      email: "",
      phone: "",
      clubName: "",
      seeder: "",

      p1FullName: "",
      p1Email: "",
      p1Phone: "",
      p1ClubName: "",
      p1Seeder: "",

      p2FullName: "",
      p2Email: "",
      p2Phone: "",
      p2ClubName: "",
      p2Seeder: "",
    },
    mode: "onChange",
  });

  /** ✅ Fill form with fetched data */
  useEffect(() => {
    if (!playerData) return;

    if (isSingleEntry(playerData)) {
      form.reset({
        entryType: "single",
        fullName: playerData.playerId?.fullName ?? "",
        email: playerData.playerId?.email ?? "",
        phone: playerData.playerId?.phone ?? "",
        clubName: playerData.playerId?.clubName ?? "",
        seeder:
          playerData.playerId?.seeder !== undefined
            ? String(playerData.playerId.seeder)
            : "",

        p1FullName: "",
        p1Email: "",
        p1Phone: "",
        p1ClubName: "",
        p1Seeder: "",

        p2FullName: "",
        p2Email: "",
        p2Phone: "",
        p2ClubName: "",
        p2Seeder: "",
      });
    }

    if (isPairEntry(playerData)) {
      form.reset({
        entryType: "pair",
        fullName: "",
        email: "",
        phone: "",
        clubName: "",
        seeder: "",

        p1FullName: playerData.pairId?.player1?.fullName ?? "",
        p1Email: playerData.pairId?.player1?.email ?? "",
        p1Phone: playerData.pairId?.player1?.phone ?? "",
        p1ClubName: playerData.pairId?.player1?.clubName ?? "",
        p1Seeder:
          playerData.pairId?.player1?.seeder !== undefined
            ? String(playerData.pairId.player1.seeder)
            : "",

        p2FullName: playerData.pairId?.player2?.fullName ?? "",
        p2Email: playerData.pairId?.player2?.email ?? "",
        p2Phone: playerData.pairId?.player2?.phone ?? "",
        p2ClubName: playerData.pairId?.player2?.clubName ?? "",
        p2Seeder:
          playerData.pairId?.player2?.seeder !== undefined
            ? String(playerData.pairId.player2.seeder)
            : "",
      });
    }
  }, [playerData, form]);

  const { mutate: updatePlayer, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!playerId) throw new Error("Missing playerId");
      if (!token) throw new Error("Missing token");

      const singleSeeder = parseSeeder(values.seeder);
      const p1Seeder = parseSeeder(values.p1Seeder);
      const p2Seeder = parseSeeder(values.p2Seeder);

      const body =
        values.entryType === "single"
          ? {
              userInfo: {
                fullName: values.fullName.trim(),
                email: values.email?.trim() || undefined,
                phone: values.phone.trim(),
                clubName: values.clubName?.trim() || undefined,
                ...(singleSeeder !== undefined ? { seeder: singleSeeder } : {}),
              },
            }
          : {
              pairInfo: {
                player1Info: {
                  fullName: values.p1FullName.trim(),
                  phone: values.p1Phone.trim(),
                  email: values.p1Email?.trim() || undefined,
                  clubName: values.p1ClubName?.trim() || undefined,
                  ...(p1Seeder !== undefined ? { seeder: p1Seeder } : {}),
                },
                player2Info: {
                  fullName: values.p2FullName.trim(),
                  phone: values.p2Phone.trim(),
                  email: values.p2Email?.trim() || undefined,
                  clubName: values.p2ClubName?.trim() || undefined,
                  ...(p2Seeder !== undefined ? { seeder: p2Seeder } : {}),
                },
              },
            };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/players/${playerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const json = (await res.json()) as unknown as { success?: boolean; message?: string };

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || "Failed to update");
      }

      return json;
    },
    onSuccess: () => {
      toast.success("Updated successfully");
      queryClient.invalidateQueries({ queryKey: ["all-players", "single-player", playerId] });
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Update failed";
      toast.error(msg);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => updatePlayer(values);

  if (!playerId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[560px]">
        <div className="p-6 space-y-4">
          <DialogHeader className="space-y-1 ">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-lg">Edit Player ( <span className="text-base text-[#131313] font-semibold">
                {mode === "single" ? "Single" : mode === "pair" ? "Pair" : "Loading..."}
              </span> )</DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">Update info and save changes.</p>
          </DialogHeader>

          <Separator />

          {!token ? (
            <div className="rounded-md border p-4 text-sm">
              You are not authenticated. Please login again.
            </div>
          ) : isLoading || isFetching ? (
            <div className="space-y-3">
              <div className="h-10 w-full rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
            </div>
          ) : isError ? (
            <div className="rounded-md border p-4 text-sm">Failed to load player data.</div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  onSubmit,
                  () => toast.error("Please fix the form errors")
                )}
                className="space-y-6"
              >
                {/* SINGLE */}
                {mode === "single" && (
                  <div className="space-y-4">
                    <div className="text-sm font-semibold">User Info</div>

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="clubName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Club Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter club name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seeder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seeder (optional)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* PAIR */}
                {mode === "pair" && (
                  <div className="space-y-6">
                    {/* Player 1 */}
                    <div className="space-y-3">
                      <div className="text-sm font-semibold">Player 1</div>

                      <FormField
                        control={form.control}
                        name="p1FullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Player 1 full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="p1Email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Player 1 email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="p1Phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Player 1 phone" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="p1ClubName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Club Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Player 1 club name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="p1Seeder"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Seeder (optional)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Player 2 */}
                    <div className="space-y-3">
                      <div className="text-sm font-semibold">Player 2</div>

                      <FormField
                        control={form.control}
                        name="p2FullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Player 2 full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="p2Email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Player 2 email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="p2Phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Player 2 phone" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="p2ClubName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Club Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Player 2 club name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="p2Seeder"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Seeder (optional)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="e.g. 0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isPending}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isPending || mode === "unknown"}
                    className="w-full sm:w-auto"
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>

        {/* <div className="border-t px-6 py-3 text-xs text-muted-foreground">
          Tip: Please double-check phone numbers before saving.
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
















// "use client";

// import React, { useEffect, useMemo } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// import { useSession } from "next-auth/react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// import { z } from "zod";
// import { useForm, type SubmitHandler } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { SinglePlayerApiResponse, TournamentPlayer } from "./single-player-data-type";



// /** ===================== HELPERS ===================== */
// const isSingleEntry = (x?: TournamentPlayer | null) => !!x?.playerId && !x?.pairId;
// const isPairEntry = (x?: TournamentPlayer | null) => !!x?.pairId && !x?.playerId;

// /**
//  * ✅ Seeder input kept as string (to avoid RHF + zod transform type issues)
//  * - "" allowed
//  * - only non-negative integer allowed
//  */
// const optionalSeederString = z
//   .string()
//   .trim()
//   .optional()
//   .or(z.literal(""))
//   .refine((v) => v === undefined || v === "" || /^[0-9]+$/.test(v), {
//     message: "Seeder must be a non-negative integer",
//   });

// /** ===================== ✅ SCHEMA ===================== */
// const singleSchema = z.object({
//   entryType: z.literal("single"),
//   fullName: z.string().trim().min(2, "Full name is required"),
//   email: z.string().trim().email("Valid email is required").optional().or(z.literal("")),
//   phone: z.string().trim().min(6, "Phone is required"),
//   seeder: optionalSeederString,

//   // not used in single, keep optional
//   p1FullName: z.string().optional().or(z.literal("")),
//   p1Email: z.string().optional().or(z.literal("")),
//   p1Phone: z.string().optional().or(z.literal("")),
//   p1Seeder: optionalSeederString,

//   p2FullName: z.string().optional().or(z.literal("")),
//   p2Email: z.string().optional().or(z.literal("")),
//   p2Phone: z.string().optional().or(z.literal("")),
//   p2Seeder: optionalSeederString,
// });

// const pairSchema = z.object({
//   entryType: z.literal("pair"),

//   // not used in pair, keep optional
//   fullName: z.string().optional().or(z.literal("")),
//   email: z.string().optional().or(z.literal("")),
//   phone: z.string().optional().or(z.literal("")),
//   seeder: optionalSeederString,

//   // pair required
//   p1FullName: z.string().trim().min(2, "Player 1 full name is required"),
//   p1Email: z.string().trim().email("Valid email is required").optional().or(z.literal("")),
//   p1Phone: z.string().trim().min(6, "Player 1 phone is required"),
//   p1Seeder: optionalSeederString,

//   p2FullName: z.string().trim().min(2, "Player 2 full name is required"),
//   p2Email: z.string().trim().email("Valid email is required").optional().or(z.literal("")),
//   p2Phone: z.string().trim().min(6, "Player 2 phone is required"),
//   p2Seeder: optionalSeederString,
// });

// const formSchema = z.discriminatedUnion("entryType", [singleSchema, pairSchema]);
// type FormValues = z.infer<typeof formSchema>;

// /** ✅ FIX: accept string | undefined */
// const parseSeeder = (v?: string): number | undefined => {
//   const s = (v ?? "").trim();
//   if (s === "") return undefined;
//   const n = Number(s);
//   return Number.isFinite(n) ? n : undefined;
// };

// export default function EditPlayerModal({
//   open,
//   onOpenChange,
//   playerId,
// }: {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   playerId: string | null;
// }) {
//   const { data: session } = useSession();
//   const token =
//     (session?.user as unknown as { accessToken?: string } | undefined)?.accessToken ?? "";

//   const queryClient = useQueryClient();
//   const enabled = Boolean(open && playerId && token);

//   const { data, isLoading, isFetching, isError } = useQuery<SinglePlayerApiResponse>({
//     queryKey: ["single-player", playerId],
//     enabled,
//     queryFn: async () => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/players/${playerId}`,
//         {
//           method: "GET",
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const json = (await res.json()) as SinglePlayerApiResponse;

//       if (!res.ok || json?.success === false) {
//         throw new Error((json as unknown as { message?: string })?.message || "Failed to load player");
//       }

//       return json;
//     },
//   });

//   const playerData = data?.data;

//   const mode = useMemo<"single" | "pair" | "unknown">(() => {
//     if (!playerData) return "unknown";
//     if (isSingleEntry(playerData)) return "single";
//     if (isPairEntry(playerData)) return "pair";
//     return "unknown";
//   }, [playerData]);

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       entryType: "single",
//       fullName: "",
//       email: "",
//       phone: "",
//       seeder: "",

//       p1FullName: "",
//       p1Email: "",
//       p1Phone: "",
//       p1Seeder: "",

//       p2FullName: "",
//       p2Email: "",
//       p2Phone: "",
//       p2Seeder: "",
//     },
//     mode: "onChange",
//   });

//   /** ✅ Fill form with fetched data */
//   useEffect(() => {
//     if (!playerData) return;

//     if (isSingleEntry(playerData)) {
//       form.reset({
//         entryType: "single",
//         fullName: playerData.playerId?.fullName ?? "",
//         email: playerData.playerId?.email ?? "",
//         phone: playerData.playerId?.phone ?? "",
//         seeder:
//           playerData.playerId?.seeder !== undefined
//             ? String(playerData.playerId.seeder)
//             : "",

//         p1FullName: "",
//         p1Email: "",
//         p1Phone: "",
//         p1Seeder: "",

//         p2FullName: "",
//         p2Email: "",
//         p2Phone: "",
//         p2Seeder: "",
//       });
//     }

//     if (isPairEntry(playerData)) {
//       form.reset({
//         entryType: "pair",
//         fullName: "",
//         email: "",
//         phone: "",
//         seeder: "",

//         p1FullName: playerData.pairId?.player1?.fullName ?? "",
//         p1Email: playerData.pairId?.player1?.email ?? "",
//         p1Phone: playerData.pairId?.player1?.phone ?? "",
//         p1Seeder:
//           playerData.pairId?.player1?.seeder !== undefined
//             ? String(playerData.pairId.player1.seeder)
//             : "",

//         p2FullName: playerData.pairId?.player2?.fullName ?? "",
//         p2Email: playerData.pairId?.player2?.email ?? "",
//         p2Phone: playerData.pairId?.player2?.phone ?? "",
//         p2Seeder:
//           playerData.pairId?.player2?.seeder !== undefined
//             ? String(playerData.pairId.player2.seeder)
//             : "",
//       });
//     }
//   }, [playerData, form]);

//   const { mutate: updatePlayer, isPending } = useMutation({
//     mutationFn: async (values: FormValues) => {
//       if (!playerId) throw new Error("Missing playerId");
//       if (!token) throw new Error("Missing token");

//       const singleSeeder = parseSeeder(values.seeder);
//       const p1Seeder = parseSeeder(values.p1Seeder);
//       const p2Seeder = parseSeeder(values.p2Seeder);

//       const body =
//         values.entryType === "single"
//           ? {
//               userInfo: {
//                 fullName: values.fullName.trim(),
//                 email: values.email?.trim() || undefined,
//                 phone: values.phone.trim(),
//                 ...(singleSeeder !== undefined ? { seeder: singleSeeder } : {}),
//               },
//             }
//           : {
//               pairInfo: {
//                 player1Info: {
//                   fullName: values.p1FullName.trim(),
//                   phone: values.p1Phone.trim(),
//                   email: values.p1Email?.trim() || undefined,
//                   ...(p1Seeder !== undefined ? { seeder: p1Seeder } : {}),
//                 },
//                 player2Info: {
//                   fullName: values.p2FullName.trim(),
//                   phone: values.p2Phone.trim(),
//                   email: values.p2Email?.trim() || undefined,
//                   ...(p2Seeder !== undefined ? { seeder: p2Seeder } : {}),
//                 },
//               },
//             };

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/players/${playerId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(body),
//         }
//       );

//       const json = (await res.json()) as unknown as { success?: boolean; message?: string };

//       if (!res.ok || json?.success === false) {
//         throw new Error(json?.message || "Failed to update");
//       }

//       return json;
//     },
//     onSuccess: () => {
//       toast.success("Updated successfully");
//       queryClient.invalidateQueries({ queryKey: ["all-players", "single-player", playerId] });
//       onOpenChange(false);
//     },
//     onError: (err: unknown) => {
//       const msg = err instanceof Error ? err.message : "Update failed";
//       toast.error(msg);
//     },
//   });

//   const onSubmit: SubmitHandler<FormValues> = (values) => updatePlayer(values);

//   if (!playerId) return null;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="p-0 sm:max-w-[560px]">
//         <div className="p-6 space-y-4">
//           <DialogHeader className="space-y-1 ">
//             <div className="flex items-center justify-between gap-3">
//               <DialogTitle className="text-lg">Edit Player ( <span className="text-base text-[#131313] font-semibold">
//                 {mode === "single" ? "Single" : mode === "pair" ? "Pair" : "Loading..."}
//               </span> )</DialogTitle>
              
//             </div>
//             <p className="text-sm text-muted-foreground">Update info and save changes.</p>
//           </DialogHeader>

//           <Separator />

//           {!token ? (
//             <div className="rounded-md border p-4 text-sm">
//               You are not authenticated. Please login again.
//             </div>
//           ) : isLoading || isFetching ? (
//             <div className="space-y-3">
//               <div className="h-10 w-full rounded bg-muted" />
//               <div className="h-10 w-full rounded bg-muted" />
//               <div className="h-10 w-full rounded bg-muted" />
//             </div>
//           ) : isError ? (
//             <div className="rounded-md border p-4 text-sm">Failed to load player data.</div>
//           ) : (
//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit(
//                   onSubmit,
//                   () => toast.error("Please fix the form errors")
//                 )}
//                 className="space-y-6"
//               >
//                 {/* SINGLE */}
//                 {mode === "single" && (
//                   <div className="space-y-4">
//                     <div className="text-sm font-semibold">User Info</div>

//                     <FormField
//                       control={form.control}
//                       name="fullName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Full Name</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Enter full name" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <FormField
//                         control={form.control}
//                         name="email"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Email</FormLabel>
//                             <FormControl>
//                               <Input placeholder="Enter email" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <FormField
//                         control={form.control}
//                         name="phone"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Phone</FormLabel>
//                             <FormControl>
//                               <Input placeholder="Enter phone" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>

//                     {/* Seeder (optional) */}
//                     <FormField
//                       control={form.control}
//                       name="seeder"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Seeder (optional)</FormLabel>
//                           <FormControl>
//                             <Input type="number" placeholder="e.g. 0" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 )}

//                 {/* PAIR */}
//                 {mode === "pair" && (
//                   <div className="space-y-6">
//                     {/* Player 1 */}
//                     <div className="space-y-3">
//                       <div className="text-sm font-semibold">Player 1</div>

//                       <FormField
//                         control={form.control}
//                         name="p1FullName"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Full Name</FormLabel>
//                             <FormControl>
//                               <Input placeholder="Player 1 full name" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <FormField
//                           control={form.control}
//                           name="p1Email"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Email</FormLabel>
//                               <FormControl>
//                                 <Input placeholder="Player 1 email" {...field} />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />

//                         <FormField
//                           control={form.control}
//                           name="p1Phone"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Phone</FormLabel>
//                               <FormControl>
//                                 <Input placeholder="Player 1 phone" {...field} />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       </div>

//                       <FormField
//                         control={form.control}
//                         name="p1Seeder"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Seeder (optional)</FormLabel>
//                             <FormControl>
//                               <Input type="number" placeholder="e.g. 0" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>

//                     <Separator />

//                     {/* Player 2 */}
//                     <div className="space-y-3">
//                       <div className="text-sm font-semibold">Player 2</div>

//                       <FormField
//                         control={form.control}
//                         name="p2FullName"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Full Name</FormLabel>
//                             <FormControl>
//                               <Input placeholder="Player 2 full name" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <FormField
//                           control={form.control}
//                           name="p2Email"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Email (optional)</FormLabel>
//                               <FormControl>
//                                 <Input placeholder="Player 2 email" {...field} />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />

//                         <FormField
//                           control={form.control}
//                           name="p2Phone"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Phone</FormLabel>
//                               <FormControl>
//                                 <Input placeholder="Player 2 phone" {...field} />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       </div>

//                       <FormField
//                         control={form.control}
//                         name="p2Seeder"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Seeder (optional)</FormLabel>
//                             <FormControl>
//                               <Input type="number" placeholder="e.g. 0" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => onOpenChange(false)}
//                     disabled={isPending}
//                     className="w-full sm:w-auto"
//                   >
//                     Cancel
//                   </Button>

//                   <Button
//                     type="submit"
//                     disabled={isPending || mode === "unknown"}
//                     className="w-full sm:w-auto"
//                   >
//                     {isPending ? "Saving..." : "Save Changes"}
//                   </Button>
//                 </div>
//               </form>
//             </Form>
//           )}
//         </div>

//         {/* <div className="border-t px-6 py-3 text-xs text-muted-foreground">
//           Tip: Please double-check phone numbers before saving.
//         </div> */}
//       </DialogContent>
//     </Dialog>
//   );
// }