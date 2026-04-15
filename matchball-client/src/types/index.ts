export type SkillLevel = 'Newbie' | 'Amateur' | 'SemiPro';
export type Position = 'GK' | 'DF' | 'MF' | 'FW';
export type UserRole = 'Player' | 'Captain' | 'FieldOwner';
export type MatchStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type FieldStatus = 'Available' | 'Unavailable' | 'Maintenance';
export type PricingModel = 'Hourly' | 'Fixed';
export type TimeSlotStatus = 'Available' | 'Booked' | 'Blocked';

export interface User {
  id: string;
  name: string;
  nickname: string;
  email: string;
  skillLevel: SkillLevel;
  position: Position;
  role: UserRole;
  age: number;
  location: string;
  latitude: number;
  longitude: number;
  availability: string;
  experienceYears: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  captainId: string;
  captainName: string;
  behaviorScore: number;
  memberCount: number;
  averageSkillLevel: number;
  members: TeamMember[];
}

export interface TeamMember {
  userId: string;
  name: string;
  nickname: string;
  position: string;
  skillLevel: string;
  role: string;
}

export interface Match {
  id: string;
  teamAId: string;
  teamAName: string;
  teamBId: string;
  teamBName: string;
  matchTime: string;
  location: string;
  fieldId: string | null;
  fieldName: string | null;
  status: MatchStatus;
  result: MatchResult | null;
}

export interface MatchResult {
  scoreA: number;
  scoreB: number;
  confirmed: boolean;
}

export interface MatchSuggestion {
  teamId: string;
  teamName: string;
  score: number;
  behaviorScore: number;
  averageSkillLevel: number;
  explanation: string;
}

export interface Field {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  ownerName: string;
  rating: number;
  status: FieldStatus;
  pricingModel: PricingModel;
  pricePerHour: number;
  latitude: number;
  longitude: number;
  timeSlots: FieldTimeSlot[];
}

export interface FieldTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  price: number | null;
  status: TimeSlotStatus;
}

export type DayOfWeekName =
  | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type ScheduleSlotStatus = 'Available' | 'Booked';

export interface TeamScheduleSlot {
  id: string;
  teamId: string;
  dayOfWeek: DayOfWeekName;
  startHour: number;
  endHour: number;
  fieldId: string | null;
  fieldName: string | null;
  status: ScheduleSlotStatus;
  matchId: string | null;
  opponentName: string | null;
  upcomingMatchTime: string | null;
  notes: string | null;
}

export type InvitationStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';

export interface MatchInvitation {
  id: string;
  fromTeamId: string;
  fromTeamName: string;
  fromTeamBehaviorScore: number;
  fromTeamAverageSkillLevel: number;
  fromTeamMemberCount: number;
  toTeamId: string;
  toTeamName: string;
  proposedTime: string;
  location: string;
  fieldId: string | null;
  message: string | null;
  status: InvitationStatus;
  matchId: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedEntityId: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}
