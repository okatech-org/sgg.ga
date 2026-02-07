/**
 * SGG Digital — Composant Upload Avatar
 */

import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploadProps {
  avatarUrl?: string;
  fullName: string;
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

const FALLBACK_SIZES = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export function AvatarUpload({ avatarUrl, fullName, onUpload, disabled, isLoading, size = 'lg' }: AvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(avatarUrl);

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2 Mo');
      return;
    }

    // Prévisualisation locale
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    await onUpload(file);
  };

  return (
    <div className="relative inline-block">
      <Avatar className={SIZES[size]}>
        <AvatarImage src={preview} alt={fullName} />
        <AvatarFallback className={`bg-government-navy text-white ${FALLBACK_SIZES[size]}`}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {!disabled && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
            onClick={() => fileRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}
