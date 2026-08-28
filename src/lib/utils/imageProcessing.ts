import imageCompression from 'browser-image-compression';

export async function processImageClientSide(file: File) {
  try {
    // Compress original
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1920,
      useWebWorker: false,
    });

    // Try to create a thumbnail
    const thumbnailFile = await imageCompression(file, {
      maxSizeMB: 0.15,
      maxWidthOrHeight: 320,
      useWebWorker: false,
    });

    // Convert to webp
    const webpFile = await convertToWebP(compressedFile);

    return {
      original: compressedFile,
      thumbnail: thumbnailFile,
      webp: webpFile,
    };
  } catch (err) {
    console.warn('Image client processing warning, returning original file:', err);
    return {
      original: file,
      thumbnail: file,
      webp: null,
    };
  }
}

export async function fileToDataURL(file: File): Promise<string> {
  // If SVG, read directly
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Compress all images to WebP/JPEG data URL with max dimension 800 to keep under 100KB
  if (file.type.startsWith('image/')) {
    try {
      const compressedDataUrl = await compressImageToDataURL(file, 800, 0.82);
      if (compressedDataUrl) return compressedDataUrl;
    } catch (e) {
      console.warn('Canvas compression failed, falling back to raw FileReader', e);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function compressImageToDataURL(file: File, maxDimension = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first for small size, fallback to jpeg/png
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function convertToWebP(file: File): Promise<File | null> {
  if (!file.type.startsWith('image/')) return null;
  if (file.type === 'image/webp') return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(null);
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: 'image/webp',
          });
          resolve(newFile);
        }, 'image/webp', 0.85);
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

