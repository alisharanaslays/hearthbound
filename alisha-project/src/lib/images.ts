const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function fileToJpeg(file: File) {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Use a JPG, PNG, WEBP, or GIF image.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("That file is larger than 8 MB. Choose a smaller image.");
  }

  const bitmap = await createImageBitmap(file);
  const max = 1000;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("This browser could not prepare that image.");
  }
  context.fillStyle = "#fffdf8";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const url = canvas.toDataURL("image/jpeg", 0.82);
  if (url.length > 1_200_000) {
    throw new Error("That image is still too heavy to store in this browser. Try a simpler picture.");
  }
  return url;
}
