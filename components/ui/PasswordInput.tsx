"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  /** A `<label htmlFor>`-ral egyező id. Ha nincs megadva, generálunk egyet. */
  id?: string;
  name: string;
  /** Az oldal saját input-osztálya — a szem-gomb helyét jobb oldali paddinggal magunk adjuk hozzá. */
  className?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  defaultValue?: string;
};

/** Jelszó mező "szem" ikonos megjelenítés-kapcsolóval — a felhasználó
 * vissza tudja nézni, mit gépelt be (regisztráció, bejelentkezés, új
 * jelszó + megerősítés). A mező alapból rejtett marad; a kapcsoló csak a
 * böngészőben, kliens-oldalon vált `type="text"`-re, a beküldött érték és
 * a `name` változatlan, így a meglévő server actionök érintetlenek. */
export function PasswordInput({ id, className = "", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const label = visible ? "Jelszó elrejtése" : "Jelszó megjelenítése";

  return (
    <div className="relative">
      <input
        {...props}
        id={inputId}
        type={visible ? "text" : "password"}
        className={`${className} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        aria-pressed={visible}
        title={label}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-2xl text-ink-soft transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light"
      >
        {visible ? (
          <EyeOff className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        ) : (
          <Eye className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        )}
      </button>
    </div>
  );
}
