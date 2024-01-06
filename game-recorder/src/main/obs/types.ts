export interface IOBSDevice {
  id: string
  description: string
}

export enum TAudioSourceType {
  input = 'wasapi_input_capture',
  output = 'wasapi_output_capture'
}
