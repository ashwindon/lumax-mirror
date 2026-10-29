import { notFound } from "next/navigation";
import { PlantView } from "@/components/plant/PlantView";
import { plantByCode, plants } from "@/domain/catalog/plants";
import type { PlantCode } from "@/domain/types";

// Pages under (app) render only after the demo sign-in is read in the browser, so
// there is no server-rendered shell to validate for instant navigation yet.
export const instant = false;

export async function generateStaticParams() {
  return plants.map((p) => ({ code: p.code.toLowerCase() }));
}

export default async function PlantPage({ params }: PageProps<"/plants/[code]">) {
  const { code } = await params;
  const plantCode = code.toUpperCase() as PlantCode;
  if (!plantByCode[plantCode]) notFound();
  return <PlantView code={plantCode} />;
}
