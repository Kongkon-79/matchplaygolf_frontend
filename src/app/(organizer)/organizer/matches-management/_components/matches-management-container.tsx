"use client";
import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Plus, SquarePen, Trash } from "lucide-react";

import { Input } from "@/components/ui/input";
import DeleteModal from "@/components/modals/delete-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSession } from "next-auth/react";
import { MatchApiResponse } from "./matches-data-type";
import moment from "moment";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SwapPlayerContainer from "../swap-player/_components/swap-player-container";
import TableSkeleton from "@/app/(organizer)/_components/player-paricipation-loading";
import ErrorContainer from "@/components/shared/ErrorContainer/ErrorContainer";
import NotFound from "@/components/shared/NotFound/NotFound";
import MatchPlayGolfPagination from "@/components/ui/matchplaygolf-pagination";

const MatchesManagementContainer = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [swapPlayerModalOpen, setSwapPlayerModalOpen] = useState(false);
  const [matchId, setMatchId] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const queryClient = useQueryClient();
  const session = useSession();
  const token = (session?.data?.user as { accessToken: string })?.accessToken;
  console.log(token);

  console.log(search);

  // get tournament api
  const { data, isLoading, isError, error } = useQuery<MatchApiResponse>({
    queryKey: ["matches", currentPage, debouncedSearch],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/match?page=${currentPage}&limit=8&tournamentName=${debouncedSearch}`,
      );
      return res.json();
    },
  });

  let content;

  if (isLoading) {
    content = (
      <div>
        <TableSkeleton />
      </div>
    );
  } else if (isError) {
    content = (
      <div>
        <ErrorContainer message={error?.message || "Something went wrong"} />
      </div>
    );
  } else if (
    data &&
    data?.data &&
    data?.data?.matches &&
    data?.data?.matches?.length === 0
  ) {
    content = (
      <div>
        <NotFound message="Oops! No data available. Modify your filters or check your internet connection." />
      </div>
    );
  } else if (
    data &&
    data?.data &&
    data?.data?.matches &&
    data?.data?.matches?.length > 0
  ) {
    content = (
      <div>
        <Table className="">
          <TableHeader className="bg-[#FCE7E9] rounded-t-[12px]">
            <TableRow className="">
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-center py-4 pl-6">
                Tournament Name
              </TableHead>
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-center py-4 ">
                Round
              </TableHead>
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-center py-4 ">
                Score
              </TableHead>
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-center py-4 ">
                Match Type
              </TableHead>
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-center py-4 ">
                Date
              </TableHead>
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-center py-4 ">
                Status
              </TableHead>
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-center py-4">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="border-b border-x border-[#E6E7E6] rounded-b-[12px]">
            {data?.data?.matches?.map((item) => {
              return (
                <TableRow key={item?._id} className="">
                  <TableCell className="text-base font-normal text-[#68706A] leading-[150%] text-center py-4">
                    {item?.tournamentId?.tournamentName}
                  </TableCell>
                  <TableCell className="text-base font-normal text-[#68706A] leading-[150%] text-center py-4">
                    {item?.round}
                  </TableCell>
                  <TableCell className="text-base font-normal text-[#68706A] leading-[150%] text-center py-4">
                    {item?.matchType === "Pairs" ? (
                      <div>
                        <span>{item?.pair1Score}</span> / {item?.pair2Score}
                      </div>
                    ) : (
                      <div>
                        <span>{item?.player1Score}</span> / {item?.player2Score}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-base font-normal text-[#68706A] leading-[150%] text-center py-4">
                    {item?.matchType}
                  </TableCell>
                  <TableCell className="text-base font-medium text-[#343A40] leading-[150%] text-center py-4">
                    {moment(item?.createdAt).format("MMM DD YYYY")}
                  </TableCell>

                  <TableCell className="text-base font-medium text-[#68706A] leading-[150%] text-center py-4">
                    <button
                      className={`w-[140px] h-[40px] ${
                        item?.status === "Ongoing"
                          ? "bg-[#E6FAEE] text-[#27BE69] py-2 px-4"
                          : item?.status === "Upcoming"
                            ? "bg-[#EFF6FF] text-[#2563EB] py-2 px-4"
                            : "bg-[#E8E8E8] text-[#6C757D] py-2 px-4"
                      }`}
                    >
                      {item?.status}
                    </button>
                  </TableCell>
                  <TableCell className="flex items-center justify-center gap-6 py-4">
                    <Link
                      href={`/organizer/matches-management/edit-match/${item?._id}`}
                    >
                      <button className="cursor-pointer">
                        <SquarePen />
                      </button>
                    </Link>
                    <Link
                      href={`/organizer/matches-management/view-match/${item?._id}`}
                    >
                      <button className="cursor-pointer">
                        <Eye className="h-6 w-6 " />
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        setDeleteModalOpen(true);
                        setMatchId(item?._id);
                      }}
                      className="cursor-pointer"
                    >
                      <Trash className="h-6 w-6 text-primary" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  console.log(data);

  // delete match api
  const { mutate } = useMutation({
    mutationKey: ["delete-match"],
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/match/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong");
        return;
      }
      toast.success(data?.message || "Matches deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const handleDelete = () => {
    if (matchId) {
      mutate(matchId);
    }
    setDeleteModalOpen(false);
  };

  return (
    <div>
      {/* table container */}
      <div className="p-6 space-y-6">
        {/* table header  */}
        <div className="w-full flex items-center justify-between">
          <div>
            <Input
              type="search"
              className="w-[479px] h-[48px] border border-[#C0C3C1] rounded-[4px] outline-none right-0 text-base font-medium leading-[120%] text-[#343A40]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>
          <div className="flex items-center gap-4">
            {/* <button
              onClick={() => setSwapPlayerModalOpen(true)}
              className="flex items-center gap-2 bg-[#DF1020] py-3 px-5 rounded-[8px] text-[#F8F9FA] text-base font-medium leading-[150%] "
            >
              <Plus /> Swap Player
            </button> */}
            <Link href="/organizer/matches-management/create-match">
              <button className="flex items-center gap-2 bg-[#DF1020] py-3 px-5 rounded-[8px] text-[#F8F9FA] text-base font-medium leading-[150%] ">
                <Plus /> Create Match
              </button>
            </Link>
          </div>
        </div>

        {/* table  */}
        <div>{content}</div>

        {/* pagination  */}
        {data &&
          data?.data &&
          data?.data?.pagination &&
          data?.data?.pagination?.totalPages > 1 && (
            <div className="w-full flex items-center justify-between py-6">
              <p className="text-base font-normal text-[#68706A] leading-[150%]">
                Showing {currentPage} to 8 of {data?.data?.pagination?.total}{" "}
                results
              </p>
              <div>
                <MatchPlayGolfPagination
                  currentPage={currentPage}
                  totalPages={data?.data?.pagination?.totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            </div>
          )}

        {/* delete modal  */}
        {deleteModalOpen && (
          <DeleteModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDelete}
            title="Are You Sure?"
            desc="Are you sure you want to delete this match?"
          />
        )}

        <Dialog
          open={swapPlayerModalOpen}
          onOpenChange={setSwapPlayerModalOpen}
        >
          <DialogContent className="sm:max-w-[760px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#343A40]">
                Swap Player Between Matches
              </DialogTitle>
            </DialogHeader>
            <SwapPlayerContainer
              onSuccess={() => setSwapPlayerModalOpen(false)}
              onCancel={() => setSwapPlayerModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MatchesManagementContainer;




