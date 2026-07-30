import { Container } from "@/components/ui/Container";

export default function KeresesLoading() {
  return (
    <section className="py-10 lg:py-14">
      <Container>
        <div className="h-3 w-16 animate-pulse rounded-full bg-panel" />
        <div className="mt-4 h-9 w-80 max-w-full animate-pulse rounded-full bg-panel" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-full bg-panel" />

        <div className="shadow-sheet mt-8 animate-pulse rounded-3xl bg-white p-5 lg:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-[60px] rounded-2xl bg-paper-alt" />
            <div className="h-[60px] rounded-2xl bg-paper-alt" />
            <div className="h-[60px] rounded-2xl bg-paper-alt" />
          </div>
          <div className="mt-4 h-9 w-64 max-w-full rounded-full bg-paper-alt" />
          <div className="mt-5 h-12 w-32 rounded-full bg-paper-alt" />
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shadow-card animate-pulse overflow-hidden rounded-2xl bg-white">
              <div className="h-32 w-full bg-panel" />
              <div className="space-y-2 p-4 pt-8">
                <div className="h-3 w-16 rounded-full bg-panel" />
                <div className="h-4 w-32 rounded-full bg-panel" />
                <div className="h-3 w-24 rounded-full bg-panel" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
