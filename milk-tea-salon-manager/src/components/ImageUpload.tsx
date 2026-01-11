import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
    currentImage?: string | string[];
    onUpload: (url: string | string[]) => void;
    type: 'avatar' | 'service' | 'portfolio';
    multiple?: boolean;
}

const ImageUpload = ({ currentImage, onUpload, type, multiple = false }: ImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Parse current images to array for consistent handling
    const images = Array.isArray(currentImage)
        ? currentImage
        : currentImage ? [currentImage] : [];

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        // Validate files
        const validFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 2 * 1024 * 1024) { // 2MB
                toast.error(`檔案 ${file.name} 超過 2MB 限制`);
                continue;
            }
            if (!file.type.startsWith('image/')) {
                toast.error(`檔案 ${file.name} 不是圖片格式`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        if (!multiple && validFiles.length > 1) {
            toast.error("此欄位僅支援單張圖片");
            // Take only the first one if multiple not allowed
            validFiles.splice(1);
        }

        setIsUploading(true);

        try {
            if (multiple) {
                // Portfolio upload (multiple files)
                const formData = new FormData();
                validFiles.forEach(file => formData.append('files', file));

                const response = await fetch('/api/upload/portfolio', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('上傳失敗');

                const data = await response.json();
                // Append new URLs to existing images
                onUpload([...images, ...data.urls]);
                toast.success("圖片上傳成功");
            } else {
                // Single file upload (avatar or service)
                const formData = new FormData();
                formData.append('file', validFiles[0]);

                const endpoint = type === 'avatar' ? '/api/upload/staff' : '/api/upload/service';

                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('上傳失敗');

                const data = await response.json();
                onUpload(data.url);
                toast.success("圖片上傳成功");
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("上傳失敗，請稍後再試");
        } finally {
            setIsUploading(false);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    const handleRemove = (indexToRemove: number) => {
        if (multiple) {
            const newImages = images.filter((_, index) => index !== indexToRemove);
            onUpload(newImages);
        } else {
            onUpload('');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    return (
        <div className="space-y-4">
            {/* Current Images Display */}
            {images.length > 0 && (
                <div className={cn("grid gap-4", multiple ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2")}>
                    {images.map((url, index) => (
                        <div key={index} className="relative group h-32 w-full rounded-xl overflow-hidden border border-border/50 bg-muted">
                            <img
                                src={url}
                                alt={`Uploaded ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
            {(!currentImage || multiple) && (
                <div
                    className={cn(
                        "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
                        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                        isUploading && "opacity-50 pointer-events-none"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        multiple={multiple}
                        onChange={(e) => handleFiles(e.target.files)}
                    />

                    <div className="flex flex-col items-center gap-2">
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                        ) : (
                            <div className="p-3 bg-muted rounded-full">
                                <Upload className="w-6 h-6 text-muted-foreground" />
                            </div>
                        )}
                        <div className="text-sm">
                            <span className="font-semibold text-primary">點擊上傳</span>
                            <span className="text-muted-foreground"> 或拖曳檔案至此</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            支援 JPG, PNG, WebP (上限 2MB)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
