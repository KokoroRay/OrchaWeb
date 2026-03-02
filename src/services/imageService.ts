/**
 * Cloudinary Image Upload Service
 * Xử lý upload ảnh trực tiếp lên Cloudinary
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'orcha-products';

// Check if using placeholder values
const isPlaceholderCloudName = !CLOUD_NAME || CLOUD_NAME.includes('your-') || CLOUD_NAME === 'your-cloudinary-name';
const isPlaceholderPreset = !UPLOAD_PRESET || UPLOAD_PRESET.includes('your-') || UPLOAD_PRESET === 'your-upload-preset';

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
    // Check for Cloudinary configuration
    if (isPlaceholderCloudName) {
        throw new Error(
            'Cloudinary chưa được cấu hình đúng.\n\n' +
            'Vui lòng:\n' +
            '1. Đăng ký tài khoản miễn phí tại https://cloudinary.com\n' +
            '2. Lấy Cloud Name từ Dashboard\n' +
            '3. Tạo Upload Preset (Settings > Upload)\n' +
            '4. Cập nhật .env với các giá trị thực:\n' +
            '   VITE_CLOUDINARY_CLOUD_NAME=<your-actual-cloud-name>\n' +
            '   VITE_CLOUDINARY_UPLOAD_PRESET=<your-actual-preset>'
        );
    }

    if (!UPLOAD_PRESET || isPlaceholderPreset) {
        throw new Error(
            'Cloudinary upload preset chưa được cấu hình đúng.\n\n' +
            'Vui lòng tạo Upload Preset trong Cloudinary Dashboard:\n' +
            '1. Vào Settings > Upload\n' +
            '2. Tạo preset mới (ví dụ: orcha-products)\n' +
            '3. Cập nhật VITE_CLOUDINARY_UPLOAD_PRESET trong .env'
        );
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
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    reject(new Error(`Cloudinary lỗi: ${errorResponse.error?.message || xhr.statusText}`));
                } catch {
                    reject(new Error(`Upload thất bại: ${xhr.statusText}`));
                }
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Lỗi kết nối khi upload ảnh (kiểm tra mạng hoặc CORS)'));
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
