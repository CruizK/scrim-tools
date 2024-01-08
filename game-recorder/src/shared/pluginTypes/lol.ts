type EventData = {
  timestamp: number
}

export type LolGameData = {
  gameId: number;
  diff: number;
  duration: number;
  kills: EventData[];
  deaths: EventData[];
}
