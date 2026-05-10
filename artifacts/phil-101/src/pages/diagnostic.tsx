import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentStudent,
  getGetCurrentStudentQueryKey,
  useLogin,
  useLogout,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  LogIn,
  LogOut,
  RotateCcw,
  ShieldCheck,
  UserCircle2,
  XCircle,
} from "lucide-react";
import { modules as curriculum } from "@/data/curriculum";

const TESTERS = [
  {
    role: "student" as const,
    label: "Test Student",
    email: "beta.student@statistics-101.test",
    name: "Beta Student",
    description: "Standard student account. Sees the integrity-monitored canvas, paste blocking, and live AI-detection scoring.",
    icon: GraduationCap,
  },
  {
    role: "admin" as const,
    label: "Test Admin",
    email: "beta.admin@statistics-101.test",
    name: "Beta Admin",
    description: "Promotes to admin (if no other admin exists, this account claims it via /api/admin/bootstrap). Can view the Admin dashboard and toggle accommodation.",
    icon: ShieldCheck,
  },
  {
    role: "accommodated" as const,
    label: "Accommodated Student",
    email: "beta.accommodated@statistics-101.test",
    name: "Beta Accommodated",
    description: "After signing in as this account, an admin must toggle accommodation in /admin/submissions. Then this student gets a plain textarea and AI scoring is skipped.",
    icon: UserCircle2,
  },
];

type Tester = (typeof TESTERS)[number];

const QUICK_LINKS = [
  { href: "/", label: "Start Here", icon: BookOpen, group: "Student" },
  { href: "/syllabus", label: "Syllabus", icon: ClipboardList, group: "Student" },
  { href: "/modules", label: "Modules", icon: BookOpen, group: "Student" },
  { href: "/assessments", label: "Assessments", icon: ClipboardList, group: "Student" },
  { href: "/admin/submissions", label: "Admin: Submissions", icon: ShieldCheck, group: "Admin" },
];

export default function Diagnostic() {
  const qc = useQueryClient();
  const me = useQuery({
    queryKey: getGetCurrentStudentQueryKey(),
    queryFn: () => getCurrentStudent(),
  });
  const student = me.data?.student ?? null;

  const [busyRole, setBusyRole] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  const login = useLogin();
  const logout = useLogout({
    mutation: {
      onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: getGetCurrentStudentQueryKey() });
      },
    },
  });

  async function signInAs(t: Tester) {
    try {
      setBusyRole(t.role);
      await login.mutateAsync({ data: { email: t.email, name: t.name } });

      if (t.role === "admin") {
        const base = import.meta.env.BASE_URL;
        try {
          const res = await fetch(`${base}api/admin/bootstrap`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            toast.success("Signed in as Test Admin (admin claimed).");
          } else if (res.status === 403) {
            toast.warning(
              "Signed in, but an admin already exists. Sign in as that admin instead, or have them grant admin to this account.",
            );
          } else {
            toast.warning(`Signed in. Admin bootstrap returned ${res.status}.`);
          }
        } catch {
          toast.warning("Signed in, but admin bootstrap call failed.");
        }
      } else {
        toast.success(`Signed in as ${t.label}.`);
      }

      await qc.invalidateQueries({ queryKey: getGetCurrentStudentQueryKey() });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusyRole(null);
    }
  }

  async function signInCustom() {
    const email = customEmail.trim().toLowerCase();
    const name = customName.trim();
    if (!email || !name) {
      toast.error("Email and name are required.");
      return;
    }
    try {
      setBusyRole("custom");
      await login.mutateAsync({ data: { email, name } });
      toast.success(`Signed in as ${name}.`);
      await qc.invalidateQueries({ queryKey: getGetCurrentStudentQueryKey() });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusyRole(null);
    }
  }

  return (
    <PageShell
      title="Diagnostic"
      intro="Internal beta-testing console. One-click sign-in as a test student or admin, plus jump-links into every part of the app. This page is unprotected on purpose during the beta."
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl">
            <FlaskConical className="h-5 w-5" />
            Current session
          </CardTitle>
        </CardHeader>
        <CardContent>
          {me.isLoading ? (
            <p className="text-sm text-stone-600">Checking session…</p>
          ) : student ? (
            <div className="flex flex-wrap items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <div className="font-medium text-stone-900">{student.name}</div>
                <div className="text-sm text-stone-600">{student.email}</div>
              </div>
              <div className="flex gap-2">
                {student.isAdmin && (
                  <Badge variant="default" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
                {student.accommodated && (
                  <Badge variant="secondary">Accommodated</Badge>
                )}
                {!student.isAdmin && !student.accommodated && (
                  <Badge variant="outline">Standard student</Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                data-testid="button-diagnostic-signout"
              >
                <LogOut className="mr-1 h-3.5 w-3.5" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-stone-400" />
              <span className="text-sm text-stone-700">
                Not signed in. Pick a tester below to start.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">One-click testers</CardTitle>
          <p className="text-sm text-stone-600">
            Each button signs out the current session if needed and signs in
            using a fixed test email. The accounts persist across reloads, so
            their submissions, drafts, and progress accumulate normally.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {TESTERS.map((t) => {
              const Icon = t.icon;
              const isCurrent = student?.email === t.email;
              return (
                <div
                  key={t.role}
                  className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4"
                  data-testid={`tester-card-${t.role}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-stone-700" />
                    <h3 className="font-serif text-base font-semibold text-stone-900">
                      {t.label}
                    </h3>
                    {isCurrent && (
                      <Badge variant="default" className="ml-auto gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-stone-600">{t.description}</p>
                  <div className="text-xs font-mono text-stone-500">
                    {t.email}
                  </div>
                  <Button
                    size="sm"
                    variant={isCurrent ? "outline" : "default"}
                    onClick={() => signInAs(t)}
                    disabled={busyRole !== null}
                    data-testid={`button-signin-${t.role}`}
                  >
                    <LogIn className="mr-1 h-3.5 w-3.5" />
                    {busyRole === t.role
                      ? "Signing in…"
                      : isCurrent
                        ? "Re-sign in"
                        : `Sign in as ${t.label}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Custom tester</CardTitle>
          <p className="text-sm text-stone-600">
            Use this when you want to spin up a fresh student account on the
            fly (e.g. to test the empty state, the integrity disclosure modal,
            or a brand-new gradebook).
          </p>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              signInCustom();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="diag-email">Email</Label>
              <Input
                id="diag-email"
                type="email"
                placeholder="tester+1@statistics-101.test"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                data-testid="input-diagnostic-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="diag-name">Name</Label>
              <Input
                id="diag-name"
                placeholder="Jane Tester"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                data-testid="input-diagnostic-name"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={busyRole !== null}
                data-testid="button-diagnostic-custom-signin"
              >
                <LogIn className="mr-1 h-3.5 w-3.5" />
                Sign in
              </Button>
            </div>
          </form>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => {
              const stamp = Date.now().toString(36);
              setCustomEmail(`tester+${stamp}@statistics-101.test`);
              setCustomName(`Tester ${stamp.toUpperCase()}`);
            }}
            data-testid="button-diagnostic-fill-random"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Fill with a fresh random tester
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Jump into the app</CardTitle>
          <p className="text-sm text-stone-600">
            Quick links to every part of the app. Sign in first if a page
            requires it.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-stone-700">
              Pages
            </h4>
            <div className="flex flex-wrap gap-2">
              {QUICK_LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <Link key={l.href} href={l.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`link-diagnostic-${l.href.replace(/[^a-z0-9]+/gi, "-")}`}
                    >
                      <Icon className="mr-1 h-3.5 w-3.5" />
                      {l.label}
                      <ExternalLink className="ml-1 h-3 w-3 opacity-60" />
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-stone-700">
              Open a specific module
            </h4>
            <div className="flex flex-wrap gap-2">
              {curriculum.map((m) => (
                <Link key={m.id} href={`/modules/${m.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`link-diagnostic-module-${m.id}`}
                  >
                    {m.id.toUpperCase()} · {m.title}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-stone-700">
              Open a tutor for a module
            </h4>
            <div className="flex flex-wrap gap-2">
              {curriculum.map((m) => (
                <Link key={m.id} href={`/tutor/${m.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`link-diagnostic-tutor-${m.id}`}
                  >
                    Tutor · {m.id.toUpperCase()}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">What to test</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-stone-800">
            <li>
              Sign in as <strong>Test Student</strong>. Open a module, dismiss
              the integrity disclosure modal, draft something in Box 1, fetch
              feedback, then write a real submission in Box 2 and submit it.
            </li>
            <li>
              Try to paste external text into Box 2 — it should be blocked.
              Watch the AI-detection traffic-light bar update as you type.
            </li>
            <li>
              Use the symbol palette to insert μ, σ, x̄, etc. into a
              submission, and confirm those characters land at the caret.
            </li>
            <li>
              Sign in as <strong>Test Admin</strong>. Open{" "}
              <code>/admin/submissions</code>, replay a submission, and toggle
              accommodation on the Accommodated Student.
            </li>
            <li>
              Sign back in as <strong>Accommodated Student</strong>. Confirm
              you now see a plain textarea on the assignment page.
            </li>
            <li>
              Open the AI Tutor for any module and confirm it asks Socratic
              questions before giving direct answers.
            </li>
          </ol>
        </CardContent>
      </Card>
    </PageShell>
  );
}
