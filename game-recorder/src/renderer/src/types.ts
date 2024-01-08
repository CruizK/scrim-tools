export enum IconType {
  sword,
  skull,
  library,
  gear
}
export type Marker = {
  timestamp: number;
  icon: IconType;
  count?: number
}
