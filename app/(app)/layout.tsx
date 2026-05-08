import { Nav } from "@/components/nav";

/**
 * Layout for all authenticated pages — wraps them with a shared nav.
 *
 * The route group `(app)` does NOT appear in URLs. /dashboard, /quiz,
 * /saved still work the same — they just inherit this layout.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div className="pb-20 sm:pb-0">{children}</div>
    </>
  );
}