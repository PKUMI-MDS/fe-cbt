import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const flow = [
  { href: "/", label: "Landing" },
  { href: "/register", label: "Register" },
  { href: "/waiting-approval", label: "Approval" },
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/exam/detail", label: "Detail" },
  { href: "/exam/instruction", label: "Instruksi" },
  { href: "/exam", label: "Exam" },
  { href: "/exam/completed", label: "Completed" },
  { href: "/exam/history", label: "History" },
  { href: "/exam/score", label: "Score" },
];

interface FlowNavProps {
  currentHref: string;
}

export default function FlowNav({ currentHref }: FlowNavProps) {
  if (currentHref === "/exam") return null;

  // Handle forgot-password as side page
  if (currentHref === "/forgot-password") {
    return (
      <nav className="flow-nav" aria-label="Flow page navigator">
        <div className="flow-nav-inner">
          <div>
            <p className="flow-step">Side Page</p>
            <p className="text-sm font-bold text-slate-950">Forgot Password</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="btn-secondary" href="/login">
              <ArrowLeft className="h-4 w-4" />
              Prev: Login
            </Link>
            <Link className="btn-primary" href="/dashboard">
              Next: Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  const index = flow.findIndex((p) => p.href === currentHref);
  if (index === -1) return null;

  const prev = flow[index - 1];
  const next = flow[index + 1];

  return (
    <nav className="flow-nav" aria-label="Flow page navigator">
      <div className="flow-nav-inner">
        <div>
          <p className="flow-step">Prototype Flow</p>
          <p className="text-sm font-bold text-slate-950">
            {index + 1} / {flow.length} — {flow[index].label}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {prev ? (
            <Link className="btn-secondary" href={prev.href}>
              <ArrowLeft className="h-4 w-4" />
              Prev: {prev.label}
            </Link>
          ) : (
            <span className="btn-secondary opacity-50">Prev</span>
          )}
          {next ? (
            <Link className="btn-primary" href={next.href}>
              Next: {next.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="btn-primary opacity-50">Next</span>
          )}
        </div>
      </div>
    </nav>
  );
}
