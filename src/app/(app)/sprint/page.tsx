import { SprintBoard } from "@/components/sprint/SprintBoard";

// Pages under (app) render only after the demo sign-in is read in the browser, so
// there is no server-rendered shell to validate for instant navigation yet.
export const instant = false;

export default function SprintPage() {
  return <SprintBoard />;
}
