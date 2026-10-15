import { useState } from "react";
import { NEXT_STEP, PAYMENT_LABEL, STATUSES, rs, type Admission, type AdmissionStatus } from "@/lib/admissions/shared";
import { fullDate, statusLabel, waNumber } from "./helpers";

export type AdmissionChanges = { status: AdmissionStatus; campus: string | null; notes: string; notify: boolean };

export function StatusPill({ status }: { status: AdmissionStatus }) {
  return <span className={`pill ${status}`}>{statusLabel(status)}</span>;
}

type DrawerProps = {
  admission: Admission;
  campuses: { id: string; name: string }[];
  sameStudent: number; // other admissions from the same phone number
  onClose: () => void;
  onSave: (changes: AdmissionChanges) => Promise<void>;
};

export function AdmissionDrawer({ admission, campuses, sameStudent, onClose, onSave }: DrawerProps) {
  const [status, setStatus] = useState(admission.status);
  const [campus, setCampus] = useState(admission.campus);
  const [notes, setNotes] = useState(admission.notes);
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);

  const next = NEXT_STEP[admission.status];
  const closed = admission.status === "enrolled" || admission.status === "cancelled";
  const { student } = admission;

  async function save(newStatus: AdmissionStatus) {
    setBusy(true);
    await onSave({ status: newStatus, campus, notes, notify });
    setBusy(false);
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer open" aria-label={`Admission ${admission.id}`}>
        <div className="drawer-head">
          <div>
            <h2>
              {admission.id} <StatusPill status={admission.status} />
            </h2>
            <div className="muted small">Created {fullDate(admission.createdAt)}</div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close">✕</button>
        </div>

        <div className="drawer-body">
          {!closed && (
            <div>
              <div className="section-title">Next step</div>
              <div className="next-actions">
                {next && (
                  <button className="btn primary" disabled={busy} onClick={() => save(next[0])}>
                    {next[1]}
                  </button>
                )}
                <button
                  className="btn danger"
                  disabled={busy}
                  onClick={() => confirm(`Cancel admission ${admission.id}?`) && save("cancelled")}
                >
                  Cancel admission
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="section-title">
              Student {sameStudent > 0 && <span className="pill enrolled">{sameStudent} other admission{sameStudent > 1 ? "s" : ""}</span>}
            </div>
            <div className="card">
              <div className="kv">
                <span>👤</span><strong>{student.name}</strong>
                <span>📞</span><span>{student.phone}</span>
                {student.email && (<><span>✉️</span><span>{student.email}</span></>)}
              </div>
              <div className="contact-actions">
                <a className="btn" href={`tel:+${waNumber(student.phone)}`}>📞 Call</a>
                <a className="btn" href={`https://wa.me/${waNumber(student.phone)}`} target="_blank" rel="noopener">💬 WhatsApp</a>
                {student.email && <a className="btn" href={`mailto:${student.email}`}>✉️ Email</a>}
              </div>
            </div>
          </div>

          <div>
            <div className="section-title">Course</div>
            <table className="lines">
              <tbody>
                <tr><td>Course</td><td className="num">{admission.courseName}</td></tr>
                <tr><td>Campus</td><td className="num">{admission.campusName}</td></tr>
                <tr><td>Batch</td><td className="num">{admission.batchLabel}</td></tr>
                <tr><td>Starts</td><td className="num">{admission.batchStart}</td></tr>
                <tr className="total">
                  <td>
                    {admission.payment
                      ? `Paid · ${PAYMENT_LABEL[admission.payment.method]}${admission.payment.txnId !== "-" ? ` · ${admission.payment.txnId}` : ""}`
                      : "Fee · not paid yet"}
                  </td>
                  <td className="num">{rs(admission.fee)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save(status);
            }}
          >
            <div className="section-title">Update admission</div>
            <div className="form-grid">
              <div>
                <label htmlFor="fStatus">Status</label>
                <select id="fStatus" value={status} onChange={(e) => setStatus(e.target.value as AdmissionStatus)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fCampus">Campus</label>
                <select id="fCampus" value={campus} onChange={(e) => setCampus(e.target.value)}>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="fNotes">Internal notes</label>
              <textarea id="fNotes" placeholder="Only visible to staff" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <label className="check">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Send the student a WhatsApp update when the status changes
            </label>
            <div className="save-row">
              <button className="btn primary" type="submit" disabled={busy}>Save changes</button>
            </div>
          </form>

          <div>
            <div className="section-title">History</div>
            <ul className="timeline">
              {[...admission.statusHistory].reverse().map((entry) => (
                <li key={`${entry.status}-${entry.at}`}>
                  <span><StatusPill status={entry.status} /></span>
                  <span className="muted small">{fullDate(entry.at)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
