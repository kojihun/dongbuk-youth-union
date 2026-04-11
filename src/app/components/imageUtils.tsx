export async function compressImage(file: File, maxWidth = 1200): Promise<File> {
  return new Promise((resolve, reject) => {
    // 이미 압축하기 어려운 형식이거나 매우 작은 파일이면 그대로 반환
    if (!file.type.match(/image\/(jpeg|png|webp)/i) || file.size < 300 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // canvas 지원 안되면 원본
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // 0.8 품질의 WebP로 압축
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(file);
          return;
        }
        
        // 새로운 File 객체 생성
        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
          type: "image/webp",
          lastModified: Date.now(),
        });
        
        resolve(newFile);
      }, "image/webp", 0.8);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // 로드 실패 시 원본 반환
    };
    
    img.src = url;
  });
}
