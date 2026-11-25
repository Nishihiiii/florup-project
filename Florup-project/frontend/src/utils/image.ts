export interface LeafFeatures {
  yellowRatio: number;
  brownRatio: number;
  whiteRatio: number;
  greenRatio: number;
}

export function compressImage(file: File, maxSize = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width >= height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas недоступен'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось обработать изображение'));
    };
    img.src = url;
  });
}

export function extractLeafFeatures(file: File): Promise<LeafFeatures> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const size = 48;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ yellowRatio: 0.2, brownRatio: 0.2, whiteRatio: 0.1, greenRatio: 0.5 });
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);

      let yellow = 0;
      let brown = 0;
      let white = 0;
      let green = 0;
      const total = size * size;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r > 205 && g > 205 && b > 205) white++;
        else if (r > 155 && g > 130 && b < 110 && r >= g * 0.9) yellow++;
        else if (r > 70 && r < 170 && g > 40 && g < 120 && b < 85 && r > g) brown++;
        else if (g > r + 10 && g > b + 10) green++;
      }

      resolve({
        yellowRatio: Number((yellow / total).toFixed(3)),
        brownRatio: Number((brown / total).toFixed(3)),
        whiteRatio: Number((white / total).toFixed(3)),
        greenRatio: Number((green / total).toFixed(3)),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ yellowRatio: 0.2, brownRatio: 0.2, whiteRatio: 0.1, greenRatio: 0.5 });
    };
    img.src = url;
  });
}