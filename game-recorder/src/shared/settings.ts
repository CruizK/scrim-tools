import type Manager from "../main/manager";
import { CaptureType } from "./types";

export type Settings = {
  // video
  captureScaleFactor: any
  videoEncoder: string
  captureType: CaptureType

  // audio
  useMicrophone: boolean
}

type SettingSchemaCommon = {
  name?: string;
  description: string
}
type SettingSchemaSwitchType = {
  type: "switch",
} & SettingSchemaCommon
type SettingSchemaOptionType = {
  type: "options"
  options: {
    name: string
    value: string
  }[]
} & SettingSchemaCommon
type SettingSchemaFileType = {
  type: "file",
} & SettingSchemaCommon

type SettingSchemaType = SettingSchemaOptionType | SettingSchemaSwitchType | SettingSchemaFileType
type SettingCategory = "video" | "audio"

export type SettingSchema = {
  [key in SettingCategory]: {
    name: string;
    options: {
      [key in keyof Settings]?: {
        type: SettingSchemaType;
      }
    }
  }
}

export function getSettingSchema(manager: Manager): SettingSchema {
  return {
    audio: {
      name: "Audio",
      options: {
        useMicrophone: {
          type: {
            type: "switch",
            name: "Enable Microphone",
            description: "",
          }
        }
      }
    },
    video: {
      name: "Recording & Video",
      options: {
        captureType: {
          type: {
            type: "options",
            name: "Capture Type",
            description: "Choose a way to capture the running game",
            options: Object.values(CaptureType).map(x => ({ name: x, value: x }))
          }
        },
        videoEncoder: {
          type: {
            type: "options",
            name: "Video Encoder",
            description: "Choose an OBS video encoder to use (jim_nvenc is recommended)",
            options: manager.recorder.getVideoEncoders().map(x => ({ name: x, value: x }))
          }
        },
      }
    }
  }
}
