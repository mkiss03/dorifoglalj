import { redirect } from "next/navigation";
import { getUser, isAdmin } from "@/lib/supabase/server";

/** A logikus, megjegyezhető admin belépési pont — mindig a helyes helyre
 * dob: bejelentkezett admint a szerkesztőbe, bejelentkezett, de nem admin
 * felhasználót a saját dashboardjára, egyébként az admin belépő oldalra. */
export default async function AdminIndexPage() {
  const user = await getUser();
  if (!user) redirect("/admin/bejelentkezes");
  redirect((await isAdmin()) ? "/admin/szerkeszto" : "/dashboard");
}
