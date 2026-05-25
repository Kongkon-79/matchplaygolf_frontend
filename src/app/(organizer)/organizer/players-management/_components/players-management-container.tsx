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
import { Eye, SquarePen, Trash } from "lucide-react";
import MatchPlayGolfPagination from "@/components/ui/matchplaygolf-pagination";
import { Input } from "@/components/ui/input";
import DeleteModal from "@/components/modals/delete-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import NotFound from "@/components/shared/NotFound/NotFound";
import ErrorContainer from "@/components/shared/ErrorContainer/ErrorContainer";
import TableSkeletonWrapper from "@/components/shared/TableSkeletonWrapper/TableSkeletonWrapper";
import { useDebounce } from "@/hooks/useDebounce";
import PlayersView from "./players-view";
import { TournamentPlayerApiResponse, TournamentPlayerItem } from "./players-management-data-type";
import Image from "next/image";
import EditPlayerModal from "./edit-player";

const PlayersManagementContainer = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editPlayerModalOpen, setEditPlayerModalOpen] = useState(false);
  const [viewPlayer, setViewPlayer] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [selectedPlayer, setSelectedPlayer] =
    useState<TournamentPlayerItem | null>(null);
    const debouncedSearch = useDebounce(search, 500);

  const queryClient = useQueryClient();
  const session = useSession();
  const token = (session?.data?.user as { accessToken: string })?.accessToken;
  console.log(token);

  console.log(search);

  // get tournament api
  const { data, isLoading, isError, error } = useQuery<TournamentPlayerApiResponse>({
    queryKey: ["all-players", currentPage, debouncedSearch],
    queryFn: async () => {
      const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/players/all?page=${currentPage}&limit=8&tournamentName=${debouncedSearch}`,{
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
      );
      return res.json();
    },
    enabled: !!token,
  });

  console.log(data?.data)

  let content;

  if (isLoading) {
    content = (
      <div>
        <TableSkeletonWrapper count={5} />
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
    data?.data?.length === 0
  ) {
    content = (
      <div>
        <NotFound message="Oops! No data available. Modify your filters or check your internet connection." />
      </div>
    );
  } else if (
    data &&
    data?.data &&
    data?.data?.length > 0
  ) {
    content = (
      <div>
        <Table className="">
          <TableHeader className="bg-[#FCE7E9] rounded-t-[12px]">
            <TableRow className="">
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] py-4 pl-6">
                Tournament Name
              </TableHead>
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-left py-4 ">
                Player Name
              </TableHead>
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-center py-4 ">
                Handicap
              </TableHead>
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-center py-4 ">
                Country
              </TableHead>
                 <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-center py-4 ">
                Club Name
              </TableHead>
              <TableHead className="text-sm font-normal leading-[150%] text-[#343A40] text-center py-4 ">
                Number
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
            {data?.data?.map((item, index) => {
              return (
                <TableRow key={index} className="">
                  <TableCell className="w-[267px] text-base font-medium text-[#68706A] leading-[150%] pl-6 py-4">
                    {item?.tournamentDetails?.tournamentName || "N/A"}
                  </TableCell>
                  <TableCell className="flex items-center justify-start gap-2 text-base font-normal text-[#68706A] leading-[150%] py-4">
                    <div>
                      <Image src={item?.playerDetails?.profileImage || "/images/common/no-user.jpeg"} alt="Profile" width={40} height={40} className="w-8 h-8 rounded-full object-cover" />
                    </div>
                    <div>
                      {item?.playerDetails?.fullName || "N/A"} <br/> {item?.playerDetails?.email || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-base font-normal text-[#68706A] leading-[150%] text-center py-4">
                    {item?.playerDetails?.handicap || "N/A"}
                  </TableCell>
                  <TableCell className="text-base font-normal text-[#68706A] leading-[150%] text-center py-4">
                   {item?.playerDetails?.country || "N/A"}
                  </TableCell>
                    <TableCell className="text-base font-normal text-[#68706A] leading-[150%] text-center py-4">
                   {item?.playerDetails?.clubName || "N/A"}
                  </TableCell>
                  <TableCell className="text-base font-normal text-[#68706A] leading-[150%] text-center py-4">
                   {item?.playerDetails?.phone || "N/A"}
                  </TableCell>
                  <TableCell className="text-base font-medium text-[#68706A] leading-[150%] text-center py-4">
                    <button
                      className={`w-[140px] h-[40px] ${
                        item?.playerDetails?.status === "active"
                          ? "bg-[#E6FAEE] text-[#27BE69] py-2 px-4"
                          : "bg-[#E7E7E7] text-[#616161] py-2 px-4"
                      }`}
                    >
                      {item?.playerDetails?.status || "N/A"}
                    </button>
                  </TableCell>
                  <TableCell className="flex items-center justify-center gap-6 py-4">
                      <button
                      onClick={() => {
                        setPlayerId(item?.playerId)
                        setEditPlayerModalOpen(true)
                      }}
                      className="cursor-pointer"
                    >
                      <SquarePen  className="h-6 w-6 text-[#181818]" />
                    </button>
                    <button
                      onClick={() => {
                        setViewPlayer(true);
                        setSelectedPlayer(item);
                      }}
                      className="cursor-pointer"
                    >
                      <Eye className="h-6 w-6 text-[#181818]" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteModalOpen(true);
                        setPlayerId(item?.playerId);
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

  // delete tournament api
  const { mutate } = useMutation({
    mutationKey: ["delete-player"],
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/players/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast.error(data?.message || "Something went wrong");
        return;
      }
      toast.success(data?.message || "Player deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["all-players"] });
    },
  });

  const handleDelete = () => {
    if (playerId) {
      mutate(playerId);
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
              className="w-[300px] lg:w-[479px] h-[48px] border border-[#C0C3C1] rounded-[4px] outline-none right-0 text-base font-medium leading-[120%] text-[#343A40]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>
        </div>

        {/* table  */}
        <div>{content}</div>

        {/* pagination  */}
        {data && data?.pagination && data?.pagination?.totalPages > 1 && (
          <div className="w-full flex items-center justify-between pb-6">
            <p className="text-base font-normal text-[#68706A] leading-[150%]">
              Showing {data?.pagination?.page} to 8 of{" "}
              {data?.pagination?.totalRecords} results
            </p>
            <div>
              <MatchPlayGolfPagination
                currentPage={currentPage}
                totalPages={data?.pagination?.totalPages}
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
            desc="Are you sure you want to delete this tournaments?"
          />
        )}

        {/* tournament view modal  */}
        <div>
          {viewPlayer && (
            <PlayersView
              open={viewPlayer}
              onOpenChange={(open: boolean) => setViewPlayer(open)}
              tournamentData={selectedPlayer}
            />
          )}
        </div>

         {/* player edit modal  */}

        <div>
          {
            editPlayerModalOpen && (
              <EditPlayerModal
              open={editPlayerModalOpen}
              onOpenChange={setEditPlayerModalOpen}
              playerId={playerId}
              />
            )
          }
        </div>
      </div>
    </div>
  );
};

export default PlayersManagementContainer;
