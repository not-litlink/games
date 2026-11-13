export type Settings = { range: number; speed: number; brightness: number; reduced: boolean };
import {DEFAULT_VISION} from './maze';
export function defaultSettings(reduced = false): Settings {
  return { range: DEFAULT_VISION, speed: 2.5, brightness: 1, reduced };
}
// Vision belongs to the maze; resetting comfort controls must never change it.
export function resetControls(current: Settings, reduced = false): Settings {
  return { ...defaultSettings(reduced), range: current.range };
}
