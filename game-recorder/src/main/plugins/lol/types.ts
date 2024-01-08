import summoner from "./typedata/lol-summoner.v1.current-summoner.json"
import matchhistory from "./typedata/lol-match-history.v1.products.lol.puuid.matches.json"
import timeline from "./typedata/lol-match-history.v1.game-timelines.gameid.json"
import game from "./typedata/lol-match-history.v1.games.gameId.json"
import gamestats from "./typedata/liveclientdata.gamestats.json"
import { AxiosResponse } from "axios";

export type LCUInfo = {
  port: number;
  authToken: string;
}

type Response<T> = Promise<AxiosResponse<T>>

export type GetSummonerResponse = Response<typeof summoner>;

export type MatchHistory = Response<typeof matchhistory>

export type GameTimeline = Response<typeof timeline>

export type GameResponse = Response<typeof game>

export type LiveGameStats = Response<typeof gamestats>
