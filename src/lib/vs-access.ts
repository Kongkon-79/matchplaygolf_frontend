import {
  isAdminRole,
  isOrganizerRole,
  isUserRole,
  normalizeRole,
} from "@/lib/role-utils";

interface MatchParticipant {
  _id?: string;
}

interface MatchPairParticipant {
  player1?: MatchParticipant | null;
  player2?: MatchParticipant | null;
}

interface MatchAccessTarget {
  createdBy?: string;
  player1Id?: MatchParticipant | null;
  player2Id?: MatchParticipant | null;
  pair1Id?: MatchPairParticipant | null;
  pair2Id?: MatchPairParticipant | null;
}

interface VsAccessParams {
  role?: string | null;
  userId?: string | null;
  tournamentCreatedBy?: string | null;
  match: MatchAccessTarget;
}

const isUserInMatch = (userId?: string | null, match?: MatchAccessTarget) => {
  if (!userId || !match) return false;

  const participantIds = [
    match.player1Id?._id,
    match.player2Id?._id,
    match.pair1Id?.player1?._id,
    match.pair1Id?.player2?._id,
    match.pair2Id?.player1?._id,
    match.pair2Id?.player2?._id,
  ].filter(Boolean);

  return participantIds.includes(userId);
};

export const canViewVsMatch = ({
  role,
  userId,
  tournamentCreatedBy,
  match,
}: VsAccessParams) => {
  if (isAdminRole(role)) return true;

  if (isOrganizerRole(role)) {
    const ownerId = match.createdBy || tournamentCreatedBy;
    return Boolean(userId && ownerId && userId === ownerId);
  }

  if (isUserRole(role)) {
    return isUserInMatch(userId, match);
  }

  return false;
};

export const getVsAccessDeniedMessage = ({
  role,
}: {
  role?: string | null;
}) => {
  if (isOrganizerRole(role)) {
    return "You can only view VS details for tournaments you created.";
  }

  if (isUserRole(role)) {
    return "You can only view VS details for matches you are part of.";
  }

  if (normalizeRole(role)) {
    return "You do not have permission to view these VS details.";
  }

  return "Please log in to view VS details.";
};
