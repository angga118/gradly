"use client";

import { useEffect, useState } from "react";
import { useGradly } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Avatar, Rating } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { Toggle } from "@/components/fotografer/toggle";

export default function ProfilFotografer() {
  const { session, updateProfile } = useGradly();

  const [name, setName] = useState(session?.name ?? "");
  const [phone, setPhone] = useState(session?.phone ?? "");
  const [city, setCity] = useState(session?.city ?? "");
  const [studio, setStudio] = useState(session?.studio ?? "");
  const [bio, setBio] = useState(session?.bio ?? "");
  const [tags, setTags] = useState<string[]>(session?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  const accepting = session?.acceptingBookings ?? true;

  function addTag() {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) {
      setTagInput("");
      return;
    }
    setTags((prev) => [...prev, value]);
    setTagInput("");
  }

  function save() {
    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      studio: studio.trim(),
      bio: bio.trim(),
      tags,
    });
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={session?.name ?? "Fotografer"} size={56} />
            <div className="min-w-0">
              <h2 className="truncate font-serif text-xl">{session?.name}</h2>
              <p className="truncate text-sm text-ink/55">{session?.email}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink/55">
                <Rating value={session?.rating ?? 0} />
                <span>{session?.sessions ?? 0} sesi</span>
                {session?.createdAt ? (
                  <span>Bergabung {formatDate(session.createdAt, { short: true })}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Ketersediaan"
          subtitle="Atur apakah kamu menerima booking baru"
        />
        <div className="mt-4">
          <Toggle
            checked={accepting}
            onChange={(next) => updateProfile({ acceptingBookings: next })}
            title={
              accepting ? "Menerima booking" : "Tidak menerima booking"
            }
            description={
              accepting
                ? "Profil dan paketmu tampil untuk klien."
                : "Profil dan paketmu disembunyikan dari klien."
            }
          />
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-sky-deep/50 bg-sky/40 p-4 text-sm text-ink/75">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink/70" />
          <p>
            Saat kamu memilih <strong>tidak menerima booking</strong>, halaman
            fotografer dan semua paketmu otomatis disembunyikan dari klien.
            Booking yang sudah dikonfirmasi tetap berjalan seperti biasa.
          </p>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Data diri"
          subtitle="Informasi ini tampil di halaman profil publikmu"
        />
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama lengkap" required htmlFor="pr-name">
              <Input
                id="pr-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
              />
            </Field>
            <Field label="Nomor telepon" htmlFor="pr-phone">
              <Input
                id="pr-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-3456-7890"
              />
            </Field>
            <Field label="Kota" htmlFor="pr-city">
              <Input
                id="pr-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="mis. Bandung"
              />
            </Field>
            <Field label="Nama studio" htmlFor="pr-studio">
              <Input
                id="pr-studio"
                value={studio}
                onChange={(e) => setStudio(e.target.value)}
                placeholder="mis. Kirana Studio"
              />
            </Field>
          </div>

          <Field label="Bio" htmlFor="pr-bio">
            <Textarea
              id="pr-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan gayamu, pengalaman, dan hal yang kamu sukai dari memotret."
            />
          </Field>

          <Field
            label="Spesialisasi"
            hint="Tekan Enter untuk menambah. Klik tanda silang untuk menghapus."
          >
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sage/60 px-3 py-1 text-xs font-medium text-ink"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={`Hapus ${tag}`}
                    onClick={() =>
                      setTags((prev) => prev.filter((t) => t !== tag))
                    }
                    className="text-ink/50 transition-colors hover:text-danger"
                  >
                    <Icon name="x" size={13} />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="mis. Wisuda, Potret, Outdoor"
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="shrink-0"
                onClick={addTag}
              >
                Tambah
              </Button>
            </div>
          </Field>

          <div className="flex flex-wrap items-center gap-3 border-t border-ink/8 pt-5">
            <Button size="sm" onClick={save}>
              Simpan perubahan
            </Button>
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-success">
                <Icon name="check" size={16} />
                Perubahan tersimpan
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
