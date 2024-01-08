import * as osn from 'obs-studio-node'
import {
  EVideoFormat,
  EColorSpace,
  EScaleType,
  EFPSType,
  ERangeType,
  ESupportedEncoders,
  ERecordingFormat,
  EOBSOutputSignal
} from './obsEnums'
import { BrowserWindow, screen } from 'electron'
import path from 'path'
import crypto from 'crypto'
import { IOBSDevice, TAudioSourceType } from './types'
import WaitQueue from 'wait-queue'
import { getPromiseBomb } from '../utils'
import dayjs from 'dayjs'
import { CaptureType, GameCaptureSettings } from '../../shared/types'
import Manager from '../manager'
import SettingsHandler from '../settings'

export default class Recorder {
  private width = 1920
  private height = 1080
  private scaleInterval?: NodeJS.Timeout
  private window: BrowserWindow
  private previewName = 'preview'

  private startQueue: WaitQueue<osn.EOutputSignal> = new WaitQueue()
  private wroteQueue: WaitQueue<osn.EOutputSignal> = new WaitQueue()

  private scene!: osn.IScene
  private capture!: osn.IInput
  private audioOutput!: osn.IInput
  private audioInput!: osn.IInput
  private captureSceneItem!: osn.ISceneItem
  private recordingFactory!: osn.IAdvancedRecording

  private currentScaleFactor!: osn.IVec2
  startDate!: Date
  endDate!: Date

  constructor(manager: Manager) {
    this.width = 1920
    this.height = 1080
    this.window = manager.window
    this.init()
  }

  private init() {
    const UNIQUE_ID = crypto.randomUUID()
    console.info(`[Recorder] Initializing OBS (${UNIQUE_ID})`)
    osn.NodeObs.IPC.host(UNIQUE_ID)
    osn.NodeObs.SetWorkingDirectory(
      path.join(__dirname, '../../', 'node_modules', 'obs-studio-node')
    )

    const initResult = osn.NodeObs.OBS_API_initAPI(
      'en-US',
      path.join(path.normalize(__dirname), 'osn-data'),
      '1.0.0',
      ''
    )

    if (initResult !== 0) {
      throw new Error(`OBS process initialization failed with code ${initResult}`)
    }

    this.scene = osn.SceneFactory.create('League Of Legends')
    osn.Global.setOutputSource(1, this.scene)
    osn.NodeObs.OBS_service_connectOutputSignals((signalInfo: osn.EOutputSignal) => {
      console.log(signalInfo)
    })
    console.info('[Recorder] OBS initialized successfully')
  }

  configureCapture(type: CaptureType, captureSettings: GameCaptureSettings, settings: SettingsHandler) {
    if (type == CaptureType.game) {
      this.capture = osn.InputFactory.create("game_capture", "Current Capture")
      const { settings } = this.capture
      settings.capture_mode = "window"
      settings.priority = 1
      settings.capture_cursor = captureSettings.capture_cursor
      settings.hook_rate = 3
      settings.window = captureSettings.window
      this.capture.update(settings)
      this.capture.save()
    }
    else if (type == CaptureType.monitor) {
      this.capture = osn.InputFactory.create('monitor_capture', 'Current Capture')

      const settings = this.capture.settings
      settings['monitor'] = 0
      settings['capture_curser'] = captureSettings.capture_cursor

      this.capture.update(settings)
      this.capture.save()
    }

    this.captureSceneItem = this.scene.add(this.capture)

    if (settings.settings.captureScaleFactor) {
      this.currentScaleFactor = settings.settings.captureScaleFactor
      this.captureSceneItem.scale = this.currentScaleFactor
    }

    if (this.scaleInterval) clearInterval(this.scaleInterval)
    this.scaleInterval = setInterval(() => this.scaleVideo(settings), 2000)
  }

  private scaleVideo(settings: SettingsHandler) {
    if (this.capture.width == 0 || this.capture.height == 0 || !this.captureSceneItem) return;
    const xScaleFactor = Math.round((this.width / this.capture.width) * 100) / 100
    const yScaleFactor = Math.round((this.height / this.capture.height) * 100) / 100

    if (
      !this.currentScaleFactor ||
      this.currentScaleFactor.x != xScaleFactor ||
      this.currentScaleFactor.y != yScaleFactor
    ) {
      console.log('Scale Factor', xScaleFactor, yScaleFactor)
      this.currentScaleFactor = { x: xScaleFactor, y: yScaleFactor }
      this.captureSceneItem.scale = this.currentScaleFactor
      settings.set({ captureScaleFactor: this.currentScaleFactor })
    }
  }

  getOutputAudioDevices(): IOBSDevice[] {
    console.log(osn.NodeObs.OBS_settings_getVideoDevices())
    console.log(osn.NodeObs.OBS_settings_getSettings())
    return osn.NodeObs.OBS_settings_getOutputAudioDevices() as IOBSDevice[]
  }

  getInputAudioDevices(): IOBSDevice[] {
    return osn.NodeObs.OBS_settings_getInputAudioDevices() as IOBSDevice[]
  }

  getVideoEncoders(): string[] {
    return osn.VideoEncoderFactory.types()
  }

  setupAudio() {
    const track1 = osn.AudioTrackFactory.create(160, 'track1')
    osn.AudioTrackFactory.setAtIndex(track1, 1)

    const outputDevices = this.getOutputAudioDevices()
    const inputDevices = osn.NodeObs.OBS_settings_getInputAudioDevices() as IOBSDevice[]

    const realOutputDevices = outputDevices.filter((v) => v.id != 'default')
    const realInputDevices = inputDevices.filter((v) => v.id != 'default')

    const outputDevice = realOutputDevices[0]
    const inputDevice = realInputDevices[0]

    const outputType: TAudioSourceType = TAudioSourceType.output
    this.audioOutput = osn.InputFactory.create(outputType, 'desktop-audio', {
      device_id: outputDevice.id
    })
    osn.Global.setOutputSource(2, this.audioOutput)

    const inputType = TAudioSourceType.input
    this.audioInput = osn.InputFactory.create(inputType, 'mic-audio', {
      device_id: inputDevice.id
    })
    osn.Global.setOutputSource(3, this.audioInput)
  }

  configureRecorder() {
    osn.VideoFactory.videoContext = {
      fpsNum: 30,
      fpsDen: 1,
      baseWidth: 1920,
      baseHeight: 1080,
      outputWidth: 1920,
      outputHeight: 1080,
      outputFormat: EVideoFormat.NV12 as unknown as osn.EVideoFormat,
      colorspace: EColorSpace.CS709 as unknown as osn.EColorSpace,
      scaleType: EScaleType.Bicubic as unknown as osn.EScaleType,
      fpsType: EFPSType.Fractional as unknown as osn.EFPSType,
      range: ERangeType.Partial as unknown as osn.ERangeType
    }

    this.recordingFactory = osn.AdvancedRecordingFactory.create()

    this.recordingFactory.path = path.normalize(path.join(__dirname, '../../', 'media'))
    this.recordingFactory.format = ERecordingFormat.MP4 as unknown as osn.ERecordingFormat
    this.recordingFactory.useStreamEncoders = false
    this.recordingFactory.overwrite = false
    this.recordingFactory.noSpace = true

    this.recordingFactory.videoEncoder = osn.VideoEncoderFactory.create(
      ESupportedEncoders.JIM_NVENC,
      'LOL-video-encoder'
    )

    this.recordingFactory.videoEncoder.update({
      rate_control: "VBR",
      bitrate: 2500,
      max_bitrate: 3500,
      keyint_sec: 2,
      psycho_aq: false
    })

    this.recordingFactory.signalHandler = (signal) => {
      this.handleSignal(signal)
    }
  }

  lastFile() {
    return this.recordingFactory.lastFile()
  }

  async start() {
    const recordDate = dayjs()
    this.recordingFactory.fileFormat = recordDate.format("YYYY_M_D_H_m_s")
    this.recordingFactory.start()

    await Promise.race([
      this.startQueue.shift(),
      getPromiseBomb(30000, "[Recorder] OBS timeout waiting to start")
    ])

    this.startQueue.empty();
    this.startDate = new Date()
  }

  async stop(): Promise<string> {
    this.recordingFactory.stop()

    await Promise.race([
      this.wroteQueue.shift(),
      getPromiseBomb(30000, "[Recorder] OBS timeout waiting to write")
    ])

    this.wroteQueue.empty();
    this.endDate = new Date();
    return this.recordingFactory.lastFile()
  }

  createPreview(x: number, y: number, width: number, height: number) {
    console.info('[Recorder] Creating preview')

    osn.NodeObs.OBS_content_createSourcePreviewDisplay(
      this.window.getNativeWindowHandle(),
      this.scene.name,
      this.previewName
    )

    osn.NodeObs.OBS_content_setShouldDrawUI(this.previewName, false)
    osn.NodeObs.OBS_content_setPaddingSize(this.previewName, 0)
    osn.NodeObs.OBS_content_setPaddingColor(this.previewName, 0, 0, 0)

    const winBounds = this.window.getBounds()

    const currentScreen = screen.getDisplayNearestPoint({
      x: winBounds.x,
      y: winBounds.y
    })

    const { scaleFactor } = currentScreen

    console.log('Window scale factor', scaleFactor)
    osn.NodeObs.OBS_content_resizeDisplay(
      this.previewName,
      width * scaleFactor,
      height * scaleFactor
    )
    osn.NodeObs.OBS_content_moveDisplay(this.previewName, x * scaleFactor, y * scaleFactor)
    this.window.on('resize', () => {
      const { width, height } = this.window.getBounds()
      const scaleFactor = 1.0
      osn.NodeObs.OBS_content_resizeDisplay(
        this.previewName,
        width * scaleFactor,
        height * scaleFactor
      )
      osn.NodeObs.OBS_content_moveDisplay(this.previewName, x * scaleFactor, y * scaleFactor)
    })
  }

  private handleSignal(obsSignal: osn.EOutputSignal) {
    console.log(`[Recorder] Got Signal: ${JSON.stringify(obsSignal, null, '\t')}`)
    if (obsSignal.type != "recording") {
      return;
    }

    switch (obsSignal.signal) {
      case EOBSOutputSignal.Start:
        this.startQueue.push(obsSignal);
        break;
      case EOBSOutputSignal.Wrote:
        this.wroteQueue.push(obsSignal);
        break;
    }
  }

  quit() {
    if (this.audioInput)
      this.audioInput.release()
    if (this.audioOutput)
      this.audioOutput.release()
    if (this.capture)
      this.capture.release()
    if (this.scene)
      this.scene.release()
    osn.NodeObs.IPC.disconnect()
  }
}
