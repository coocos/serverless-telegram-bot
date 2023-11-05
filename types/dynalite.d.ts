// Dynalite currently lacks type definitions out of the box
// and @types/dynalite does not exist so let's whip up our own
type DynaliteOptions = {
  verbose?: boolean;
  debug?: boolean;
  ssl?: boolean;
  path?: string;
  createTableMs?: number;
};

declare module "dynalite" {
  import type { Server } from "http";
  export default function dynalite(options: DynaliteOptions): Server;
}
