import ffmpegPath from "ffmpeg-static"
import { spawn } from "child_process"
import path from "path"
import fs from "fs/promises"

export const getPromiseBomb = (fuse: number, reason: string) => {
  return new Promise((_res, rej) => setTimeout(rej, fuse, reason))
}

export const getPromiseWait = (wait: number) => {
  return new Promise((res, _rej) => setTimeout(res, wait))
}

export const getFileSizeMB = async (videoPath: string) => {
  const fsStat = await fs.stat(videoPath);
  return fsStat.size / (1024 * 1024)
}

export const generateThumbnail = async (videoPath: string): Promise<string> => {
  const filename = path.basename(videoPath).split('.')[0]
  const fileDir = path.dirname(videoPath)
  const output = path.join(fileDir, `${filename}.png`)
  const args = [
    "-y",
    "-i", `${videoPath}`,
    "-vf", 'thumbnail=50',
    "-frames:v", "1",
    `${output}`
  ]

  await useFfmpeg(args);
  return output
}

export const trimStartingBlackFrames = async (videoPath: string): Promise<number> => {
  if (!ffmpegPath) throw new Error("No ffmpeg")
  const args = [
    "-i", videoPath,
    "-vf", "blackdetect=d=0.05:pix_th=0.10",
    "-t", "20",
    "-an",
    "-f", "null",
    "-"
  ]

  let finalString = ""
  const dir = path.dirname(videoPath)
  const tmpFile = `${dir}/tmp.mp4`
  await useFfmpeg(args, undefined, (data) => finalString += data)
  const matches = finalString.matchAll(/black_start:0 black_end:(\d+\.\d+)/g)
  let time = 0
  for (const match of matches) {
    time = Number(match[1])
    console.log(time)
    const trimArgs = [
      "-y",
      "-i", videoPath,
      "-ss", time.toString(),
      "-c", "copy",
      "-copyts",
      tmpFile
    ]
    await useFfmpeg(trimArgs)
    await fs.unlink(videoPath)
    await fs.rename(tmpFile, videoPath)
    break;
  }
  return time
}


export function useFfmpeg(args: string[], onData?: (data: string) => void, onErrData?: (data: string) => void): Promise<void> {
  return new Promise((res, rej) => {
    if (!ffmpegPath) return rej(new Error("No FFmpeg"))
    const output = spawn(ffmpegPath, args)
    if (onData) output.stdout.on("data", (data) => onData(data))
    output.stderr.setEncoding("utf-8")
    if (onErrData) output.stderr.on("data", data => onErrData(data))
    output.on("close", () => res())
  })
}
