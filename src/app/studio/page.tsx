import { PinStudio } from "@/components/PinStudio";
import { StudioGate } from "@/components/StudioGate";
import { hasStudioSession } from "@/lib/studio-auth";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const allowed = await hasStudioSession();
  return allowed ? <PinStudio /> : <StudioGate />;
}
