import { createClient } from "@/lib/supabase/server";
import { resolveContent } from "@/lib/content/resolve";
import { ContentEditor } from "./ContentEditor";

export default async function SzerkesztoPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("key, value");
  const content = resolveContent(data ?? []);

  return <ContentEditor initialContent={content} />;
}
