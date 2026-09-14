// TODO: cseréld valós címre, amint eldőlt (ld. "ezt majd még kitalálom").
export const SUPPORT_EMAIL = "dori@idopontneked.hu";

/** Ide mennek a belső, üzemeltetői értesítők (új szolgáltatói regisztráció,
 * kategória-kérés). Alapból ugyanaz, mint a támogatási cím, de az
 * `ADMIN_NOTIFICATION_EMAIL` env-változóval külön is állítható — pl. ha
 * Máté is kapni szeretné a regisztrációs értesítőket. Vesszővel elválasztva
 * több cím is megadható. */
export const ADMIN_NOTIFICATION_EMAIL: string[] = (
  process.env.ADMIN_NOTIFICATION_EMAIL || SUPPORT_EMAIL
)
  .split(",")
  .map((address) => address.trim())
  .filter(Boolean);
