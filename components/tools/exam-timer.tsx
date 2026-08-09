"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Flag, Pause, Play, RotateCcw, TimerReset, Volume2 } from "lucide-react";
import { useActiveTimer } from "@/lib/local-hooks";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Exam timer backed by absolute timestamps (`endAt`), so it stays accurate
 * while the tab is hidden and survives refresh. Notifications/sound are a
 * progressive enhancement — the countdown itself is display-only otherwise.
 */

function parseDuration(h: string, m: string, s: string): number | null {
  const hours = Number(h) || 0;
  const minutes = Number(m) || 0;
  const seconds = Number(s) || 0;
  if (hours < 0 || minutes < 0 || seconds < 0) return null;
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  const total = (hours * 3600 + minutes * 60 + seconds) * 1000;
  return total > 0 ? total : null;
}

function now(): number {
  return Date.now();
}

function useTick(active: boolean, interval = 250) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => force((n) => n + 1), interval);
    return () => window.clearInterval(id);
  }, [active, interval]);
}

function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // audio unavailable — ignore
  }
}

export function ExamTimer() {
  const [timer, setTimer, clearTimer] = useActiveTimer();
  const [h, setH] = useState("");
  const [m, setM] = useState("");
  const [s, setS] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const finishedNotifiedRef = useRef(false);

  useTick(timer.running);

  const remaining = useMemo(() => {
    if (timer.running && timer.endAt !== null) {
      return Math.max(0, timer.endAt - now());
    }
    return Math.max(0, timer.durationMs - timer.elapsedMs);
  }, [timer]);

  const elapsed = timer.durationMs - remaining;
  const isFinished = timer.durationMs > 0 && remaining === 0;

  // Time's up: mark the completion state and alert once (sound + notification).
  useEffect(() => {
    if (!isFinished) {
      finishedNotifiedRef.current = false;
      return;
    }
    if (finishedNotifiedRef.current) return;
    finishedNotifiedRef.current = true;
    beep();
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification("Coursify — Exam Timer", {
          body: timer.label ? `Time's up for "${timer.label}"` : "Time's up — your session has ended.",
        });
      } catch {
        // notifications blocked — ignore
      }
    }
    setTimer((t) => ({ ...t, running: false, endAt: null, finishedAt: now() }));
  }, [isFinished, timer.label, setTimer]);

  const canConfigure = !timer.running;

  const start = useCallback(() => {
    const durationMs = parseDuration(h, m, s);
    if (durationMs === null) return;
    setTimer({
      label: "",
      durationMs,
      endAt: now() + durationMs,
      elapsedMs: 0,
      running: true,
      finishedAt: null,
    });
  }, [h, m, s, setTimer]);

  const resume = useCallback(() => {
    setTimer((t) => {
      if (t.running || t.durationMs === 0) return t;
      return { ...t, endAt: now() + Math.max(0, t.durationMs - t.elapsedMs), running: true };
    });
  }, [setTimer]);

  const pause = useCallback(() => {
    setTimer((t) => {
      if (!t.running) return t;
      return { ...t, endAt: null, elapsedMs: t.durationMs - Math.max(0, t.endAt! - now()), running: false };
    });
  }, [setTimer]);

  const reset = useCallback(() => {
    setTimer({ label: "", durationMs: 0, endAt: null, elapsedMs: 0, running: false, finishedAt: null });
    setH("");
    setM("");
    setS("");
    setConfirmReset(false);
  }, [setTimer]);

  const finishSession = useCallback(() => {
    // Keep a record of how long was actually spent, then clear.
    setTimer({ label: "", durationMs: 0, endAt: null, elapsedMs: 0, running: false, finishedAt: null });
    setH("");
    setM("");
    setS("");
  }, [setTimer]);

  const requestNotifications = useCallback(() => {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().catch(() => undefined);
  }, []);

  const hasSession = timer.durationMs > 0 || timer.running;

  return (
    <div className="flex flex-col gap-4">
      {hasSession && (
        <div
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border p-5 text-center",
            isFinished
              ? "border-signal-green/40 bg-signal-green/10"
              : "border-border bg-background"
          )}
        >
          <p className="font-mono text-4xl font-medium tracking-tight text-ink">
            {isFinished ? "0:00" : formatClock(remaining)}
          </p>
          <p className="text-xs text-muted">
            {isFinished
              ? `Time's up — you studied for ${formatClock(elapsed)}.`
              : timer.running
                ? "Counting down — safe to switch tabs."
                : "Paused"}
          </p>
        </div>
      )}

      {/* Custom duration input */}
      {!hasSession ? (
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Custom duration</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <DurationField label="Hours" value={h} onChange={setH} maxLength={2} />
            <DurationField label="Minutes" value={m} onChange={setM} maxLength={2} />
            <DurationField label="Seconds" value={s} onChange={setS} maxLength={2} />
          </div>
          <button
            onClick={start}
            disabled={parseDuration(h, m, s) === null}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink-solid font-medium text-on-ink transition-colors hover:bg-ink-solid/90 disabled:opacity-40"
          >
            <Play size={15} />
            Start Countdown
          </button>
          <button
            onClick={requestNotifications}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            <Volume2 size={13} />
            Allow end-of-timer notifications
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            {!timer.running ? (
              <button
                onClick={resume}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink-solid font-medium text-on-ink transition-colors hover:bg-ink-solid/90"
              >
                <Play size={15} />
                Resume
              </button>
            ) : (
              <button
                onClick={pause}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink-solid font-medium text-on-ink transition-colors hover:bg-ink-solid/90"
              >
                <Pause size={15} />
                Pause
              </button>
            )}
            <button
              onClick={finishSession}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background font-medium text-ink transition-colors hover:bg-surface"
            >
              <Flag size={15} />
              Finish Session
            </button>
          </div>
          <button
            onClick={() => setConfirmReset((v) => !v)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            <RotateCcw size={13} />
            Reset timer
          </button>
          {confirmReset && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background p-3 text-xs text-ink">
              <span>Discard this session? It can&apos;t be restored.</span>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={reset}
                  className="rounded-full bg-red-500/10 px-3 py-1 font-medium text-red-500 hover:bg-red-500/20"
                >
                  Discard
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="rounded-full bg-surface px-3 py-1 font-medium text-ink"
                >
                  Keep
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {hasSession && elapsed > 0 && !timer.running && !isFinished && (
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <TimerReset size={13} />
          {formatClock(elapsed)} elapsed so far
        </p>
      )}
    </div>
  );
}

function DurationField({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="0"
        aria-label={label}
        className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-center font-mono text-[15px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </div>
  );
}