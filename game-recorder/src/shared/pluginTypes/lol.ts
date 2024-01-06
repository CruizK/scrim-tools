type EventData = {
  timestamp: number
}

export type LolGameData = {
  kills: EventData[],
  deaths: EventData[]
}
