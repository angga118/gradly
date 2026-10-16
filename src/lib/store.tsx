"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { signIn, signOut } from "next-auth/react";
import { emptyStats } from "./stats";
import type {
  AppNotification,
  Booking,
  BookingDraft,
  BookingStatus,
  DocType,
  HighlightCard,
  LedgerEntry,
  Package,
  PortfolioItem,
  Role,
  Stats,
  SubsidyApplication,
  Testimonial,
  User,
  Withdrawal,
} from "./types";

/* ------------------------------------------------------------------ *
 * Fetch helpers — every call is best-effort; failures leave state as-is.
 * ------------------------------------------------------------------ */

async function getJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function sendJSON<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(path, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!res.ok) return { ok: false, error: data?.error ?? "Terjadi kesalahan." };
    return { ok: true, data: data ?? undefined };
  } catch {
    return { ok: false, error: "Tidak dapat menghubungi server." };
  }
}

async function sendForm<T>(
  path: string,
  form: FormData,
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(path, { method: "POST", body: form });
    const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!res.ok) return { ok: false, error: data?.error ?? "Terjadi kesalahan." };
    return { ok: true, data: data ?? undefined };
  } catch {
    return { ok: false, error: "Tidak dapat menghubungi server." };
  }
}

const emptyDraftState: BookingDraft = {
  packageId: null,
  useSubsidy: false,
  customerName: "",
  customerPhone: "",
  eventDate: "",
  eventTime: "",
  location: "",
  note: "",
};

interface GradlyContextValue {
  hydrated: boolean;
  session: User | null;
  users: User[];
  packages: Package[];
  bookings: Booking[];
  subsidyApplications: SubsidyApplication[];
  notifications: AppNotification[];
  portfolio: PortfolioItem[];
  highlights: HighlightCard[];
  testimonials: Testimonial[];
  ledger: LedgerEntry[];
  withdrawals: Withdrawal[];
  stats: Stats;
  draft: BookingDraft;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    phone: string;
    city: string;
    role: Role;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  savePackage: (pkg: Package) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  createBooking: (input: {
    packageId: string;
    customerName: string;
    customerPhone: string;
    eventDate: string;
    eventTime: string;
    location: string;
    note: string;
    subsidized: boolean;
  }) => Promise<Booking>;
  setBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  attachPayment: (id: string, file: File) => Promise<void>;
  submitSubsidy: (input: {
    docType: DocType;
    kelurahan: string;
    address: string;
    file: File;
  }) => Promise<SubsidyApplication>;
  reviewSubsidy: (
    id: string,
    decision: "Terverifikasi" | "Ditolak",
    reason?: string,
  ) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addPortfolio: (input: {
    title: string;
    packageName: string;
    clientName: string;
    location: string;
    shotDate: string;
    tone: string;
    file: File;
  }) => Promise<void>;
  removePortfolio: (id: string) => Promise<void>;
  requestWithdrawal: (
    amount: number,
    bankAccount: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  verifyPayment: (bookingId: string) => Promise<{ ok: boolean; error?: string }>;
  processWithdrawal: (
    id: string,
    status: "Diproses" | "Selesai",
  ) => Promise<{ ok: boolean; error?: string }>;
  setDraft: (patch: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  userById: (id: string) => User | undefined;
  packageById: (id: string) => Package | undefined;
}

const GradlyContext = createContext<GradlyContextValue | null>(null);

export function GradlyProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subsidyApplications, setSubsidyApplications] = useState<SubsidyApplication[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [highlights, setHighlights] = useState<HighlightCard[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<Stats>(() => emptyStats());
  const [draft, setDraftState] = useState<BookingDraft>(emptyDraftState);

  const loadPublic = useCallback(async () => {
    const [pkgs, port, hi, testi, photogs, st] = await Promise.all([
      getJSON<{ packages: Package[] }>("/api/packages"),
      getJSON<{ portfolio: PortfolioItem[] }>("/api/portfolio"),
      getJSON<{ highlights: HighlightCard[] }>("/api/highlights"),
      getJSON<{ testimonials: Testimonial[] }>("/api/testimonials"),
      getJSON<{ photographers: User[] }>("/api/photographers"),
      getJSON<Stats>("/api/stats"),
    ]);
    if (pkgs) setPackages(pkgs.packages);
    if (port) setPortfolio(port.portfolio);
    if (hi) setHighlights(hi.highlights);
    if (testi) setTestimonials(testi.testimonials);
    if (photogs) setUsers(photogs.photographers);
    if (st) setStats(st);
  }, []);

  const loadScoped = useCallback(async (user: User) => {
    const [bk, subs, notifs] = await Promise.all([
      getJSON<{ bookings: Booking[] }>("/api/bookings"),
      getJSON<{ subsidyApplications: SubsidyApplication[] }>("/api/subsidy-applications"),
      getJSON<{ notifications: AppNotification[] }>("/api/notifications"),
    ]);
    if (bk) setBookings(bk.bookings);
    if (subs) setSubsidyApplications(subs.subsidyApplications);
    if (notifs) setNotifications(notifs.notifications);

    if (user.role === "fotografer" || user.role === "admin") {
      const [led, wd, pkgs] = await Promise.all([
        getJSON<{ ledger: LedgerEntry[] }>("/api/ledger"),
        getJSON<{ withdrawals: Withdrawal[] }>("/api/withdrawals"),
        getJSON<{ packages: Package[] }>("/api/packages?all=1"),
      ]);
      if (led) setLedger(led.ledger);
      if (wd) setWithdrawals(wd.withdrawals);
      if (pkgs) setPackages(pkgs.packages);
    }
  }, []);

  const refetchMe = useCallback(async (): Promise<User | null> => {
    const me = await getJSON<{ user: User | null }>("/api/me");
    const user = me?.user ?? null;
    setSession(user);
    return user;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadPublic();
        const me = await getJSON<{ user: User | null }>("/api/me");
        if (cancelled) return;
        const user = me?.user ?? null;
        setSession(user);
        if (user) await loadScoped(user);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPublic, loadScoped]);

  const login = useCallback<GradlyContextValue["login"]>(
    async (email, password) => {
      try {
        const res = await signIn("credentials", { email, password, redirect: false });
        if (!res.ok || res.error) {
          if (res.code === "rate_limited") {
            return { ok: false, error: "Terlalu banyak percobaan masuk. Coba lagi dalam beberapa menit." };
          }
          return { ok: false, error: "Email atau kata sandi salah." };
        }
      } catch {
        return { ok: false, error: "Gagal masuk. Coba lagi." };
      }
      const user = await refetchMe();
      if (!user) return { ok: false, error: "Gagal memuat sesi." };
      await loadScoped(user);
      return { ok: true };
    },
    [refetchMe, loadScoped],
  );

  const register = useCallback<GradlyContextValue["register"]>(
    async (input) => {
      const res = await sendJSON<{ ok: boolean }>("/api/auth/register", "POST", input);
      if (!res.ok) return { ok: false, error: res.error };
      return login(input.email, input.password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
    } catch {
      /* ignore */
    }
    setSession(null);
    setBookings([]);
    setSubsidyApplications([]);
    setNotifications([]);
    setLedger([]);
    setWithdrawals([]);
    setDraftState(emptyDraftState);
  }, []);

  const updateProfile = useCallback<GradlyContextValue["updateProfile"]>(async (patch) => {
    const res = await sendJSON<{ user: User }>("/api/profile", "PATCH", patch);
    if (res.ok && res.data?.user) {
      const updated = res.data.user;
      setSession(updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    }
  }, []);

  const changePassword = useCallback<GradlyContextValue["changePassword"]>(
    async (current, next) => {
      const res = await sendJSON<{ ok: boolean }>("/api/profile/password", "POST", {
        current,
        next,
      });
      return res.ok ? { ok: true } : { ok: false, error: res.error };
    },
    [],
  );

  const savePackage = useCallback<GradlyContextValue["savePackage"]>(
    async (pkg) => {
      const body = {
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        subsidyPrice: pkg.subsidyPrice ?? undefined,
        subsidyEnabled: pkg.subsidyEnabled,
        features: pkg.features,
        isActive: pkg.isActive,
        popular: pkg.popular,
      };
      const isNew = !packages.some((p) => p.id === pkg.id);
      const res = isNew
        ? await sendJSON<{ package: Package }>("/api/packages", "POST", body)
        : await sendJSON<{ package: Package }>(`/api/packages/${pkg.id}`, "PATCH", body);
      if (res.ok && res.data?.package) {
        const saved = res.data.package;
        setPackages((prev) =>
          isNew ? [...prev, saved] : prev.map((p) => (p.id === saved.id ? saved : p)),
        );
      }
    },
    [packages],
  );

  const deletePackage = useCallback<GradlyContextValue["deletePackage"]>(async (id) => {
    const res = await sendJSON<{ ok: boolean }>(`/api/packages/${id}`, "DELETE");
    if (res.ok) setPackages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const createBooking = useCallback<GradlyContextValue["createBooking"]>(async (input) => {
    const res = await sendJSON<{ booking: Booking }>("/api/bookings", "POST", input);
    if (!res.ok || !res.data?.booking) {
      throw new Error(res.error ?? "Gagal membuat booking.");
    }
    const booking = res.data.booking;
    setBookings((prev) => [booking, ...prev]);
    return booking;
  }, []);

  const setBookingStatus = useCallback<GradlyContextValue["setBookingStatus"]>(
    async (id, status) => {
      const res = await sendJSON<{ booking: Booking }>(`/api/bookings/${id}`, "PATCH", {
        status,
      });
      if (res.ok && res.data?.booking) {
        const updated = res.data.booking;
        setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      }
    },
    [],
  );

  const attachPayment = useCallback<GradlyContextValue["attachPayment"]>(
    async (id, file) => {
      const form = new FormData();
      form.append("file", file);
      const res = await sendForm<{ booking: Booking }>(
        `/api/bookings/${id}/payment`,
        form,
      );
      if (res.ok && res.data?.booking) {
        const updated = res.data.booking;
        setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      }
    },
    [],
  );

  const submitSubsidy = useCallback<GradlyContextValue["submitSubsidy"]>(async (input) => {
    const form = new FormData();
    form.append("docType", input.docType);
    form.append("kelurahan", input.kelurahan);
    form.append("address", input.address);
    form.append("file", input.file);
    const res = await sendForm<{ subsidyApplication: SubsidyApplication }>(
      "/api/subsidy-applications",
      form,
    );
    if (!res.ok || !res.data?.subsidyApplication) {
      throw new Error(res.error ?? "Gagal mengirim ajuan.");
    }
    const app = res.data.subsidyApplication;
    setSubsidyApplications((prev) => [app, ...prev]);
    return app;
  }, []);

  const reviewSubsidy = useCallback<GradlyContextValue["reviewSubsidy"]>(
    async (id, decision, reason) => {
      const res = await sendJSON<{ subsidyApplication: SubsidyApplication }>(
        `/api/subsidy-applications/${id}`,
        "PATCH",
        { decision, reason },
      );
      if (res.ok && res.data?.subsidyApplication) {
        const updated = res.data.subsidyApplication;
        setSubsidyApplications((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a)),
        );
      }
    },
    [],
  );

  const markNotificationRead = useCallback<GradlyContextValue["markNotificationRead"]>(
    async (id) => {
      const res = await sendJSON<{ ok: boolean }>(`/api/notifications/${id}`, "PATCH");
      if (res.ok) {
        const now = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, readAt: now } : n)),
        );
      }
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    const res = await sendJSON<{ ok: boolean }>("/api/notifications/read-all", "POST");
    if (res.ok) {
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    }
  }, []);

  const addPortfolio = useCallback<GradlyContextValue["addPortfolio"]>(async (input) => {
    const form = new FormData();
    form.append("title", input.title);
    form.append("packageName", input.packageName);
    form.append("clientName", input.clientName);
    form.append("location", input.location);
    form.append("shotDate", input.shotDate);
    form.append("tone", input.tone);
    form.append("file", input.file);
    const res = await sendForm<{ portfolio: PortfolioItem }>("/api/portfolio", form);
    if (!res.ok || !res.data?.portfolio) {
      throw new Error(res.error ?? "Gagal mengunggah foto.");
    }
    const item = res.data.portfolio;
    setPortfolio((prev) => [item, ...prev]);
  }, []);

  const removePortfolio = useCallback<GradlyContextValue["removePortfolio"]>(async (id) => {
    const res = await sendJSON<{ ok: boolean }>(`/api/portfolio/${id}`, "DELETE");
    if (res.ok) setPortfolio((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const requestWithdrawal = useCallback<GradlyContextValue["requestWithdrawal"]>(
    async (amount, bankAccount) => {
      const res = await sendJSON<{ withdrawal: Withdrawal }>("/api/withdrawals", "POST", {
        amount,
        bankAccount,
      });
      if (!res.ok || !res.data?.withdrawal) {
        return { ok: false, error: res.error ?? "Gagal mengajukan penarikan." };
      }
      const w = res.data.withdrawal;
      setWithdrawals((prev) => [w, ...prev]);
      return { ok: true };
    },
    [],
  );

  const verifyPayment = useCallback<GradlyContextValue["verifyPayment"]>(
    async (bookingId) => {
      const res = await sendJSON<{ booking: Booking }>(
        `/api/bookings/${bookingId}/payment/verify`,
        "POST",
      );
      if (!res.ok) return { ok: false, error: res.error };
      if (session) await loadScoped(session);
      return { ok: true };
    },
    [session, loadScoped],
  );

  const processWithdrawal = useCallback<GradlyContextValue["processWithdrawal"]>(
    async (id, status) => {
      const res = await sendJSON<{ withdrawal: Withdrawal }>(`/api/withdrawals/${id}`, "PATCH", {
        status,
      });
      if (!res.ok) return { ok: false, error: res.error };
      if (session) await loadScoped(session);
      return { ok: true };
    },
    [session, loadScoped],
  );

  const setDraft = useCallback<GradlyContextValue["setDraft"]>((patch) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback(() => setDraftState(emptyDraftState), []);

  const userById = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users],
  );

  const packageById = useCallback(
    (id: string) => packages.find((p) => p.id === id),
    [packages],
  );

  const value = useMemo<GradlyContextValue>(
    () => ({
      hydrated,
      session,
      users,
      packages,
      bookings,
      subsidyApplications,
      notifications,
      portfolio,
      highlights,
      testimonials,
      ledger,
      withdrawals,
      stats,
      draft,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      savePackage,
      deletePackage,
      createBooking,
      setBookingStatus,
      attachPayment,
      submitSubsidy,
      reviewSubsidy,
      markNotificationRead,
      markAllRead,
      addPortfolio,
      removePortfolio,
      requestWithdrawal,
      verifyPayment,
      processWithdrawal,
      setDraft,
      resetDraft,
      userById,
      packageById,
    }),
    [
      hydrated,
      session,
      users,
      packages,
      bookings,
      subsidyApplications,
      notifications,
      portfolio,
      highlights,
      testimonials,
      ledger,
      withdrawals,
      stats,
      draft,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      savePackage,
      deletePackage,
      createBooking,
      setBookingStatus,
      attachPayment,
      submitSubsidy,
      reviewSubsidy,
      markNotificationRead,
      markAllRead,
      addPortfolio,
      removePortfolio,
      requestWithdrawal,
      verifyPayment,
      processWithdrawal,
      setDraft,
      resetDraft,
      userById,
      packageById,
    ],
  );

  return <GradlyContext.Provider value={value}>{children}</GradlyContext.Provider>;
}

export function useGradly(): GradlyContextValue {
  const ctx = useContext(GradlyContext);
  if (!ctx) throw new Error("useGradly must be used within GradlyProvider");
  return ctx;
}
