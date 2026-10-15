"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PAYMENT_LABEL, rs, type CheckoutInfo, type PaymentMethod } from "@/lib/admissions/shared";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const METHODS: { id: PaymentMethod; icon: string; hint: string }[] = [
  { id: "jazzcash", icon: "📱", hint: "Mobile wallet" },
  { id: "easypaisa", icon: "📲", hint: "Mobile wallet" },
  { id: "card", icon: "💳", hint: "Visa / Mastercard" },
];

export function Checkout() {
  const [info, setInfo] = useState<CheckoutInfo | null>(null);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("jazzcash");
  const [wallet, setWallet] = useState("");
  const [paying, setPaying] = useState(false);
  const [closeHint, setCloseHint] = useState(false);

  // The admission id comes from the URL (?id=ADM-1001). Read in an effect: the page itself is static.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") ?? "";
    fetch(`/api/pay?id=${encodeURIComponent(id)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Couldn't load this payment");
        setInfo(data);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const walletOk = /^03\d{9}$/.test(wallet.replace(/[\s-]/g, ""));
  const canPay = !!info && !paying && (method === "card" || walletOk);

  async function pay() {
    if (!info || !canPay) return;
    setPaying(true);
    setError("");
    await sleep(1500); // feels like a real gateway
    try {
      const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: info.id, method }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Payment failed");
      setInfo(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  function backToChat() {
    window.close(); // works when the browser opened this tab from the chat
    setCloseHint(true); // if it didn't close, tell the student to switch tabs
  }

  const paid = info && info.status !== "pending_payment";

  return (
    <main className="page">
      <div className="demo-banner">Demo checkout · no real money is charged</div>

      <section className="card">
        <header className="card-head">
          <Image src="/avatar.svg" alt="" width={44} height={44} unoptimized className="logo" />
          <div>
            <div className="brand">IBAGRADS</div>
            <div className="muted small">Secure admission payment</div>
          </div>
        </header>

        {!info && !error && <p className="muted center">Loading…</p>}
        {!info && error && <p className="error center">{error}</p>}

        {info && (
          <>
            <div className="summary">
              <Row label="Admission" value={info.id} />
              <Row label="Student" value={info.studentName} />
              <Row label="Course" value={info.courseName} />
              <Row label="Campus" value={info.campusName} />
              <Row label="Batch starts" value={info.batchStart} />
              <div className="total">
                <span>Total</span>
                <strong>{rs(info.fee)}</strong>
              </div>
            </div>

            {paid ? (
              <div className="success">
                <div className="tick">✓</div>
                <h1>Payment successful</h1>
                <p className="muted">
                  {rs(info.fee)} paid
                  {info.payment && info.payment.method !== "campus" ? ` via ${PAYMENT_LABEL[info.payment.method]}` : ""}
                </p>
                {info.payment?.txnId && info.payment.txnId !== "-" && <p className="txn">Transaction ID: {info.payment.txnId}</p>}
                <p className="small">You&apos;ll get a confirmation in your IBAGRADS chat.</p>
                <button className="btn" onClick={backToChat}>Back to chat</button>
                {closeHint && <p className="muted small">You can close this tab and switch back to the chat.</p>}
              </div>
            ) : (
              <>
                <h2 className="section">Pay with</h2>
                <div className="methods" role="radiogroup">
                  {METHODS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={method === option.id}
                      className={`method${method === option.id ? " selected" : ""}`}
                      onClick={() => setMethod(option.id)}
                    >
                      <span className="method-icon">{option.icon}</span>
                      <span className="method-name">{PAYMENT_LABEL[option.id]}</span>
                      <span className="muted small">{option.hint}</span>
                    </button>
                  ))}
                </div>

                {method === "card" ? (
                  <div className="fields">
                    <label>Card number<input defaultValue="4242 4242 4242 4242" inputMode="numeric" /></label>
                    <div className="two">
                      <label>Expiry<input defaultValue="12/28" /></label>
                      <label>CVC<input defaultValue="123" inputMode="numeric" /></label>
                    </div>
                    <p className="muted small">Demo card details are filled in for you.</p>
                  </div>
                ) : (
                  <div className="fields">
                    <label>
                      {PAYMENT_LABEL[method]} mobile number
                      <input value={wallet} onChange={(event) => setWallet(event.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" />
                    </label>
                    <p className="muted small">Any 03XX number works in this demo. No OTP is sent.</p>
                  </div>
                )}

                {error && <p className="error">{error}</p>}
                <button className="btn primary" disabled={!canPay} onClick={pay}>
                  {paying ? "Processing payment…" : `Pay ${rs(info.fee)}`}
                </button>
              </>
            )}
          </>
        )}
      </section>

      <p className="foot muted small">🔒 Payments are processed securely · IBAGRADS</p>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="row">
      <span className="muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
