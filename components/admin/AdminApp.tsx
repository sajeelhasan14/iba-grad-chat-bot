"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { STATUSES, rs, type Admission, type AdmissionStatus } from "@/lib/admissions/shared";
import { AdmissionDrawer, StatusPill, type AdmissionChanges } from "./AdmissionDrawer";
import { ago, chime, isToday, matches, statusLabel, unlockAudio } from "./helpers";

type Campus = { id: string; name: string };
type Phase = "loading" | "login" | "app";

class NotLoggedIn extends Error {}

// Every admin request goes through here; a 401 sends the admin back to the login screen.
async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
    credentials: "same-origin",
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401 && path !== "login") throw new NotLoggedIn();
  if (!response.ok) throw new Error(data.error ?? response.statusText);
  return data as T;
}

export function AdminApp() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [tab, setTab] = useState<"admissions" | "students">("admissions");
  const [filter, setFilter] = useState<"all" | AdmissionStatus>("all");
  const [query, setQuery] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [live, setLive] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [toast, setToast] = useState({ text: "", show: false });
  const [sound, setSound] = useState(() => {
    try {
      return localStorage.getItem("ibagrads-admin-sound") !== "off";
    } catch {
      return true;
    }
  });
  const [, setTick] = useState(0); // re-render every minute so "5 min ago" stays right

  // What we saw last time (id → status), to notice new admissions and new payments.
  const knownRef = useRef<Map<string, AdmissionStatus> | null>(null);
  const soundRef = useRef(sound);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((text: string) => {
    setToast({ text, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((current) => ({ ...current, show: false })), 3200);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ admissions: Admission[]; campuses: Campus[] }>("admissions");
      const known = knownRef.current;
      if (known) {
        const added = data.admissions.filter((admission) => !known.has(admission.id));
        const newlyPaid = data.admissions.filter((admission) => known.get(admission.id) === "pending_payment" && admission.status === "paid");
        if (added.length || newlyPaid.length) {
          setFresh((current) => new Set([...current, ...added.map((a) => a.id), ...newlyPaid.map((a) => a.id)]));
          setTimeout(() => setFresh(new Set()), 3000);
          if (soundRef.current) chime();
          if (added.length === 1) showToast(`🎓 New admission ${added[0].id} – ${added[0].student.name} · ${added[0].courseName}`);
          else if (added.length > 1) showToast(`🎓 ${added.length} new admissions`);
          else showToast(`💵 Payment received for ${newlyPaid[0].id} – ${rs(newlyPaid[0].fee)}`);
        }
      }
      knownRef.current = new Map(data.admissions.map((admission) => [admission.id, admission.status]));
      setAdmissions(data.admissions);
      setCampuses(data.campuses);
      setLive(true);
      setPhase("app");
    } catch (error) {
      if (error instanceof NotLoggedIn) {
        knownRef.current = null;
        setPhase("login");
      } else {
        setLive(false);
      }
    }
  }, [showToast]);

  // Boot: if the cookie is still valid we go straight to the panel, otherwise the login form.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Live: check for new admissions every 5 seconds (only while the tab is visible).
  useEffect(() => {
    if (phase !== "app") return;
    const poller = setInterval(() => !document.hidden && void refresh(), 5000);
    const ticker = setInterval(() => setTick((tick) => tick + 1), 60_000);
    return () => {
      clearInterval(poller);
      clearInterval(ticker);
    };
  }, [phase, refresh]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpenId(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("password") as HTMLInputElement;
    setLoginError("");
    try {
      await api("login", { method: "POST", body: JSON.stringify({ password: input.value }) });
      input.value = "";
      unlockAudio(); // browsers only allow sound after a click
      await refresh();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Couldn't sign in");
    }
  }

  async function logout() {
    await api("logout", { method: "POST" }).catch(() => {});
    knownRef.current = null;
    setOpenId(null);
    setPhase("login");
  }

  function toggleSound() {
    const next = !sound;
    setSound(next);
    soundRef.current = next;
    try {
      localStorage.setItem("ibagrads-admin-sound", next ? "on" : "off");
    } catch {}
    if (next) chime();
  }

  async function save(id: string, changes: AdmissionChanges) {
    try {
      const { admission, notified } = await api<{ admission: Admission; notified: boolean }>(`admissions/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      setAdmissions((current) => current.map((item) => (item.id === id ? admission : item)));
      knownRef.current?.set(admission.id, admission.status);
      showToast(notified ? "Saved · student notified on WhatsApp ✓" : "Saved ✓");
    } catch (error) {
      if (error instanceof NotLoggedIn) setPhase("login");
      else showToast(`Couldn't save: ${error instanceof Error ? error.message : "error"}`);
    }
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const count = (status: AdmissionStatus) => admissions.filter((a) => a.status === status).length;
    const paidToday = admissions.filter((a) => a.payment && isToday(a.payment.paidAt) && a.status !== "cancelled");
    return {
      awaitingPayment: count("pending_payment"),
      toConfirm: count("paid"),
      confirmed: count("confirmed") + count("enrolled"),
      collectedToday: paidToday.reduce((sum, a) => sum + a.fee, 0),
      paidTodayCount: paidToday.length,
    };
  }, [admissions]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: admissions.length };
    for (const admission of admissions) result[admission.status] = (result[admission.status] ?? 0) + 1;
    return result;
  }, [admissions]);

  const rows = admissions.filter((a) => (filter === "all" || a.status === filter) && matches(a, query.trim().toLowerCase()));

  // One row per student (by phone), like the "Customers" tab in the reference.
  const students = useMemo(() => {
    const byPhone = new Map<string, { name: string; phone: string; email: string | null; count: number; paid: number; last: string; courses: Set<string> }>();
    for (const admission of [...admissions].reverse()) {
      const key = admission.student.phone.replace(/\D/g, "");
      const student = byPhone.get(key) ?? { name: "", phone: "", email: null, count: 0, paid: 0, last: admission.createdAt, courses: new Set<string>() };
      student.name = admission.student.name;
      student.phone = admission.student.phone;
      student.email = admission.student.email ?? student.email;
      student.count++;
      if (admission.payment && admission.status !== "cancelled") student.paid += admission.fee;
      student.last = admission.createdAt;
      student.courses.add(admission.courseName.split(" (")[0]);
      byPhone.set(key, student);
    }
    const q = studentQuery.trim().toLowerCase();
    return [...byPhone.values()]
      .filter((s) => !q || [s.name, s.phone, s.email].join(" ").toLowerCase().includes(q))
      .sort((a, b) => new Date(b.last).getTime() - new Date(a.last).getTime());
  }, [admissions, studentQuery]);

  const open = admissions.find((admission) => admission.id === openId) ?? null;

  // ── Screens ───────────────────────────────────────────────────────────────
  if (phase === "loading") return null;

  if (phase === "login") {
    return (
      <section className="login">
        <form className="login-card" onSubmit={login}>
          <Image src="/avatar.svg" alt="" width={84} height={84} unoptimized className="login-logo" />
          <h1>Admissions Admin</h1>
          <p className="muted">Sign in to manage WhatsApp admissions</p>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
          <button className="btn primary" type="submit">Sign in</button>
          <p className="error">{loginError}</p>
        </form>
      </section>
    );
  }

  return (
    <>
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <Image src="/avatar.svg" alt="" width={40} height={40} unoptimized className="brand-logo" />
            <span className="wordmark">IBAGRADS</span>
            <span className="brand-tag">Admin</span>
          </div>
          <nav className="tabs" role="tablist">
            <button className={`tab${tab === "admissions" ? " active" : ""}`} onClick={() => setTab("admissions")}>
              Admissions {stats.toConfirm > 0 && <span className="tab-count">{stats.toConfirm}</span>}
            </button>
            <button className={`tab${tab === "students" ? " active" : ""}`} onClick={() => setTab("students")}>Students</button>
          </nav>
          <div className="top-actions">
            <span className={`live${live ? "" : " off"}`} title="Auto-refreshes every 5 seconds">
              <i />
              <span className="live-text">{live ? "Live" : "Offline"}</span>
            </span>
            <button className="icon-btn" onClick={toggleSound} title={sound ? "New-admission sound: on" : "New-admission sound: off"}>
              {sound ? "🔔" : "🔕"}
            </button>
            <button className="btn ghost" onClick={logout}>Sign out</button>
          </div>
        </header>

        <main className="main">
          <section className="stats">
            <div className="stat">
              <div className="label">Awaiting payment</div>
              <div className="value">{stats.awaitingPayment}</div>
              <div className="hint">Admission created, not paid yet</div>
            </div>
            <div className={`stat${stats.toConfirm ? " attention" : ""}`}>
              <div className="label">To confirm</div>
              <div className="value">{stats.toConfirm}</div>
              <div className="hint">Paid, waiting for your confirmation</div>
            </div>
            <div className="stat">
              <div className="label">Confirmed</div>
              <div className="value">{stats.confirmed}</div>
              <div className="hint">Confirmed · enrolled</div>
            </div>
            <div className="stat">
              <div className="label">Fees collected today</div>
              <div className="value">{rs(stats.collectedToday)}</div>
              <div className="hint">{stats.paidTodayCount} payment{stats.paidTodayCount === 1 ? "" : "s"} today</div>
            </div>
          </section>

          {tab === "admissions" ? (
            <section className="panel">
              <div className="toolbar">
                <div className="chips">
                  {(["all", ...STATUSES] as const).map((status) => (
                    <button key={status} className={`chip${filter === status ? " active" : ""}`} onClick={() => setFilter(status)}>
                      {status === "all" ? "All" : statusLabel(status)} <b>{counts[status] ?? 0}</b>
                    </button>
                  ))}
                </div>
                <input className="search" type="search" placeholder="Search admission #, name, phone, course…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="table-wrap">
                <table className="table" id="admissionsTable">
                  <thead>
                    <tr>
                      <th>Admission</th><th>Created</th><th>Student</th><th>Course</th><th className="num">Fee</th><th>Campus</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((admission) => (
                      <tr key={admission.id} className={fresh.has(admission.id) ? "fresh" : ""} onClick={() => setOpenId(admission.id)}>
                        <td className="c-id"><span className="id">{admission.id}</span></td>
                        <td className="c-time muted">{ago(admission.createdAt)}</td>
                        <td className="c-student student">
                          <strong>{admission.student.name}</strong>
                          <span className="muted small">{admission.student.phone}</span>
                        </td>
                        <td className="c-course course-cell">{admission.courseName}<div className="muted small">Starts {admission.batchStart}</div></td>
                        <td className="c-fee num">
                          <strong>{rs(admission.fee)}</strong>
                          <div className="muted small">{admission.payment ? "Paid" : "Unpaid"}</div>
                        </td>
                        <td className="c-campus">{admission.campusName}</td>
                        <td className="c-status"><StatusPill status={admission.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length === 0 && (
                  <div className="empty">
                    {admissions.length ? "No admissions match this filter." : "No admissions yet. New WhatsApp admissions appear here automatically."}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="panel">
              <div className="toolbar">
                <input className="search" type="search" placeholder="Search name, phone, email…" value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} />
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Student</th><th>Phone</th><th className="num">Admissions</th><th className="num">Fees paid</th><th>Last admission</th><th>Courses</th></tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student.phone}
                        onClick={() => {
                          // Clicking a student shows their admissions.
                          setQuery(student.phone);
                          setFilter("all");
                          setTab("admissions");
                        }}
                      >
                        <td>
                          <strong>{student.name}</strong>
                          {student.count > 1 && <span className="pill enrolled" title="More than one admission">Returning</span>}
                          {student.email && <div className="muted small">{student.email}</div>}
                        </td>
                        <td>{student.phone}</td>
                        <td className="num" data-l="Admissions">{student.count}</td>
                        <td className="num" data-l="Paid">{rs(student.paid)}</td>
                        <td className="muted" data-l="Last">{ago(student.last)}</td>
                        <td className="muted course-cell">{[...student.courses].join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {students.length === 0 && <div className="empty">No students yet.</div>}
              </div>
            </section>
          )}
        </main>
      </div>

      {open && (
        <AdmissionDrawer
          key={`${open.id}-${open.statusHistory.length}`} // reset the form when the admission changes
          admission={open}
          campuses={campuses}
          sameStudent={admissions.filter((a) => a.student.phone === open.student.phone && a.id !== open.id).length}
          onClose={() => setOpenId(null)}
          onSave={(changes) => save(open.id, changes)}
        />
      )}

      <div className={`toast${toast.show ? " show" : ""}`}>{toast.text}</div>
    </>
  );
}
