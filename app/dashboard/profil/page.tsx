import { getUser, createClient } from "@/lib/supabase/server";
import type { Provider } from "@/lib/supabase/types";
import { ProfileForm } from "../ProfileForm";
import { LogoCoverUploader } from "../LogoCoverUploader";

export default async function DashboardProfilePage() {
  const user = await getUser();
  const supabase = await createClient();
  const { data: provider } = await supabase.from("providers").select("*").eq("id", user!.id).single();
  const typedProvider = provider as Provider | null;

  return (
    <section>
      <h1 className="font-display text-3xl text-ink">Profil</h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        Ez jelenik meg a publikus foglalási oldaladon — minél teljesebb, annál megbízhatóbb a vendégeidnek.
      </p>

      <div className="shadow-sheet mt-6 overflow-hidden rounded-3xl bg-white">
        <LogoCoverUploader provider={typedProvider} />
        <div className="px-6 pb-6 pt-12">
          <ProfileForm provider={typedProvider} />
        </div>
      </div>
    </section>
  );
}
