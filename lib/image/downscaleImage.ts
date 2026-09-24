const REENCODE_ABOVE_BYTES = 1.5 * 1024 * 1024;

/** Böngészőben, feltöltés előtt kicsinyíti a képet. A telefonos fotók
 * gyakran 5 MB fölöttiek, a Vercel viszont 4,5 MB fölötti kérést el sem
 * enged a szerverig — így a feltöltés hibaüzenet nélkül elbukna. Ha a
 * dekódolás nem sikerül (pl. HEIC nem-Safari böngészőben), az eredeti
 * fájlt adja vissza, és a szerveroldali ellenőrzés ad érthető hibát. */
export async function downscaleImage(file: File, maxDimension: number): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= REENCODE_ABOVE_BYTES) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    // PNG/WebP logóknál megmarad az átlátszóság (JPEG-nél fekete lenne).
    const targetType = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, targetType, 0.85));
    if (!blob) return file;

    const extension = blob.type === "image/jpeg" ? "jpg" : blob.type === "image/webp" ? "webp" : "png";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "kep";
    return new File([blob], `${baseName}.${extension}`, { type: blob.type });
  } catch {
    return file;
  }
}
