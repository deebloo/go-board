import { attr } from "@joist/observable";

export const num = attr<number>({ read: Number });

export const arr = attr<string[]>({
  read: (val) => val.split(","),
  write: (val) => val.join(","),
});
