import { writable } from "svelte/store";

export const route = writable({
  name: "Home",
  args: {}
})
