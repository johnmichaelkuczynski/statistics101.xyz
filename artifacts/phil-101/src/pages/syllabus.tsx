import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { modules } from "@/data/curriculum";
import { Printer } from "lucide-react";

export default function Syllabus() {
  const totalPoints = modules.reduce((sum, m) => sum + m.points, 0);
  return (
    <PageShell
      title="Syllabus"
      intro="Everything you need to know about how Systems Science 101 is taught, graded, and supported."
    >
      <div className="flex justify-end print:hidden">
        <Button
          variant="outline"
          onClick={() => window.print()}
          data-testid="button-print-syllabus"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>

      <Section title="Course information">
        <DefList
          items={[
            ["Course", "SYSC 101 — Introduction to Systems Science"],
            ["Credits", "3 semester credits"],
            ["Format", "Fully online, asynchronous"],
            ["Term", "Open enrollment / self-paced"],
            ["Prerequisites", "None — open to all undergraduates"],
          ]}
        />
      </Section>

      <Section title="Instructor information">
        <DefList
          items={[
            ["Instructor of record", "Dr. Lawrence Dodge"],
            ["Office hours", "By appointment via the AI Tutor at any time"],
            [
              "Response time",
              "AI Tutor: immediate · Submission feedback: within 5 business days",
            ],
            ["Email", "instructor@example.edu"],
          ]}
        />
      </Section>

      <Section title="Course description">
        <p className="text-stone-800">
          Systems Science 101 introduces students to the scientific study of
          systems — collections of interacting parts whose behavior cannot be
          understood by studying the parts in isolation. The course covers
          the foundational vocabulary developed by Bertalanffy, Wiener,
          Ashby, Meadows, Senge, and the Santa Fe Institute: stocks and
          flows, feedback loops, requisite variety, homeostasis, emergence,
          networks, self-organization, archetypes, leverage points, and
          complex adaptive systems. Through close readings, Socratic
          discussion, and short writing assignments, students learn to
          diagnose system structure, predict dynamic behavior, and identify
          where intervention will actually matter.
        </p>
      </Section>

      <Section title="Course learning outcomes">
        <p className="mb-2 text-stone-800">By the end of this course, students will be able to:</p>
        <ol className="list-decimal space-y-2 pl-5 text-stone-800">
          <li>
            Identify the four defining features of a system (elements,
            interconnections, boundary, purpose) and distinguish open from
            closed systems using the Second Law of Thermodynamics.
          </li>
          <li>
            Diagram and analyze stocks, flows, and feedback loops
            (reinforcing and balancing), and explain the dynamic behavior
            (growth, decay, oscillation, S-curves, collapse) they produce.
          </li>
          <li>
            Apply Ashby's Law of Requisite Variety, distinguish static
            equilibrium from dynamic equilibrium and homeostasis, and
            distinguish resistance, resilience, and robustness as competing
            design objectives.
          </li>
          <li>
            Recognize emergence, self-organization, and the edge of chaos,
            and read scale-free and small-world network topologies.
          </li>
          <li>
            Diagnose the five core system archetypes (Shifting the Burden,
            Limits to Growth, Tragedy of the Commons, Escalation, Success
            to the Successful) and apply Meadows' five-tier leverage-point
            framework to identify where interventions will and will not
            work.
          </li>
          <li>
            Apply the full systems-analysis vocabulary in a term paper that
            analyzes five distinct real-world systems and produces at least
            one non-obvious prediction for each.
          </li>
        </ol>
      </Section>

      <Section title="Required materials">
        <p className="text-stone-800">
          All readings are open educational resources authored by the
          instructor and embedded directly in each module. There is{" "}
          <strong>no textbook to purchase</strong>.
        </p>
      </Section>

      <Section title="Grading & assessments">
        <p className="mb-3 text-stone-800">
          Your final grade is the sum of your scores across all 13 modules
          (total: <strong>{totalPoints} points</strong>). Submissions are
          reviewed by the instructor of record and feedback is provided via
          the AI Tutor. The course follows a standard 90/80/70/60 scale.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-300 bg-stone-100 text-left">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Module</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <tr key={m.id} className="border-b border-stone-200">
                  <td className="px-3 py-2 text-stone-500">{m.number}</td>
                  <td className="px-3 py-2 text-stone-900">{m.title}</td>
                  <td className="px-3 py-2 capitalize text-stone-700">
                    {m.type}
                  </td>
                  <td className="px-3 py-2 text-right text-stone-900">
                    {m.points}
                  </td>
                </tr>
              ))}
              <tr className="bg-stone-50 font-semibold">
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-right">{totalPoints}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Schedule & pacing">
        <p className="text-stone-800">
          The course is asynchronous. Recommended pacing is one module per
          week, but you may move faster or slower. Modules unlock
          sequentially: you must submit each one before the next becomes
          available. Use the <Link href="/modules" className="underline">Modules page</Link> to track which one is next.
        </p>
      </Section>

      <Section title="Late & resubmission policy">
        <p className="text-stone-800">
          Because the course is self-paced, there are no late penalties. You
          may resubmit any module — your most recent submission counts. If
          you have made multiple attempts, your AI Tutor can help you
          identify what to improve.
        </p>
      </Section>

      <Section title="Engagement expectations">
        <ul className="list-disc space-y-1 pl-5 text-stone-800">
          <li>
            For each module, plan to spend at least 15 minutes with the AI
            Tutor before drafting your submission.
          </li>
          <li>
            Submissions should reflect your own thinking, in your own words.
          </li>
          <li>
            The instructor reviews tutor sessions and submissions and may
            reach out if engagement appears insufficient.
          </li>
        </ul>
      </Section>

      <Section title="Academic integrity & AI policy">
        <p className="mb-2 text-stone-800">
          You are encouraged to use the embedded AI Tutor for{" "}
          <strong>discussion, clarification, counter-arguments, and
          formative critique of your own draft thinking</strong>.
        </p>
        <p className="mb-2 text-stone-800">
          The AI Tutor is system-prompted to refuse to write your assignments
          for you. If you ask it to do so, it will pivot back to questions.
        </p>
        <p className="text-stone-800">
          Submitting AI-generated text as your own work — whether from this
          tutor or a third-party service — is a violation of academic
          integrity and will be referred to the dean. All submissions and
          tutor messages are timestamped and stored for audit.
        </p>
      </Section>

      <Section title="Support & accessibility">
        <p className="text-stone-800">
          For technical or academic support, see the{" "}
          <Link href="/support" className="underline">Support</Link> page. For
          accommodations or accessibility concerns, see the{" "}
          <Link href="/accessibility" className="underline">Accessibility</Link>{" "}
          page.
        </p>
      </Section>

      <Section title="Institutional policies">
        <ul className="list-disc space-y-1 pl-5 text-stone-800">
          <li>Non-discrimination & Title IX policies apply throughout the course.</li>
          <li>FERPA: your enrollment and grade records are private.</li>
          <li>Code of Student Conduct applies to all course interactions.</li>
        </ul>
      </Section>
    </PageShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DefList({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="font-semibold text-stone-700">{k}</dt>
          <dd className="text-stone-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
