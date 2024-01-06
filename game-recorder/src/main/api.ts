import { ipcMain } from "electron";
import { MainApi, ReqResponseApi, mainToRendererCalls, requestResponseCalls } from "../shared";
import Manager from "./manager";
import db from "./db";

export function buildReqResApi(manager: Manager): ReqResponseApi {
  return {
    getVideos: async (_request) => {
      return db.getVideos(20)
    },
  }
}

export function buildApi(reqRes: ReqResponseApi): MainApi {
  const api = reqRes;

  for (const key of requestResponseCalls) {
    ipcMain.handle(key['type'], async (_, ...args) => await api[key['type']](args[0] as never))
  }
  for (const key of mainToRendererCalls) {
    api[key['mType']] = (window, value) => window.webContents.send(key["mType"], value)
  }

  return api as MainApi
}
