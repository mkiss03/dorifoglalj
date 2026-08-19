import { getUser } from "@/lib/supabase/server";
import { ChangeEmailForm, ChangePasswordForm } from "../AccountForms";

export default async function DashboardAccountPage() {
  const user = await getUser();

  return (
    <section>
      <h1 className="font-display text-3xl text-ink">Fiók</h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        A bejelentkezéshez használt e-mail címed és jelszavad — ez nem jelenik meg a publikus
        foglalási oldaladon.
      </p>

      <div className="shadow-sheet mt-6 rounded-3xl bg-white p-6">
        <h2 className="font-display text-xl text-ink">E-mail cím</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Módosításkor megerősítő emailt küldünk a jelenlegi és az új címedre is — a váltás csak
          mindkettő megerősítése után lép életbe.
        </p>
        <div className="mt-4">
          <ChangeEmailForm currentEmail={user?.email ?? ""} />
        </div>
      </div>

      <div className="shadow-sheet mt-6 rounded-3xl bg-white p-6">
        <h2 className="font-display text-xl text-ink">Jelszó módosítása</h2>
        <p className="mt-1 text-sm text-ink-soft">Állíts be egy új jelszót a bejelentkezéshez.</p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </div>
    </section>
  );
}
