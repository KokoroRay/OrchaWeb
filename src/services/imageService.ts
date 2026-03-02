/**
 * Cloudinary Image Upload Service
 * Xử lý upload ảnh trực tiếp lên Cloudinary
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'orcha-products';

export interface UploadResponse {
    url: string;
    secureUrl: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    resourceType: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

/**
 * Upload ảnh lên Cloudinary
 */
export async function uploadImage(
    file: File,
    onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> {
    if (!CLOUD_NAME) {
        throw new Error('Cloudinary cloud name chưa được cấu hình. Vui lòng thêm VITE_CLOUDINARY_CLOUD_NAME vào .env');
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
        throw new Error('File phải là ảnh (jpg, png, gif, webp)');
    }

    // Max 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error('Kích thước ảnh không được vượt quá 10MB');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'orcha-products');

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    onProgress({
                        loaded: e.loaded,
                        total: e.total,
                        percentage: Math.round((e.loaded / e.total) * 100),
                    });
                }
            });
        }

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve({
                        url: response.url,
                        secureUrl: response.secure_url,
                        publicId: response.public_id,
                        width: response.width,
                        height: response.height,
                        format: response.format,
                        resourceType: response.resource_type,
                    });
                } catch (error) {
                    reject(new Error('Lỗi khi xử lý phản hồi từ Cloudinary'));
                }
            } else {
                reject(new Error(`Upload thất bại: ${xhr.statusText}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Lỗi kết nối khi upload ảnh'));
        });

        xhr.addEventListener('abort', () => {
            reject(new Error('Upload đã bị hủy'));
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
        xhr.send(formData);
    });
}

/**
 * Upload nhiều ảnh cùng lúc
 */
export async function uploadMultipleImages(
    files: File[],
    onProgress?: (index: number, progress: UploadProgress) => void
): Promise<UploadResponse[]> {
    const results: UploadResponse[] = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadImage(file, (progress) => {
            if (onProgress) {
                onProgress(i, progress);
            }
        });
        results.push(result);
    }

    return results;
}

/**
 * Tạo URL thumbnail từ Cloudinary
 */
export function getCloudinaryThumbnail(url: string, width: number = 300, height: number = 300): string {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    // Insert transformation parameters
    return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
}

/**
 * Tối ưu hóa URL ảnh từ Cloudinary
 */
export function optimizeCloudinaryUrl(url: string): string {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    // Add auto quality and format
    return url.replace('/upload/', '/upload/q_auto,f_auto/');
}
