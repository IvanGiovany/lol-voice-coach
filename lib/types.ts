export type GamePhase = "Early" | "Mid" | "Late";

export type Role =
  | "Top"
  | "Jungle"
  | "Mid"
  | "ADC"
  | "Support";

export interface CoachRequest {
  champion: string;
  role: Role;
  phase: GamePhase;
  situation: string;
}

export interface CoachMessage {
  id: string;
  from: "user" | "coach";
  text: string;
  createdAt: number;
}
