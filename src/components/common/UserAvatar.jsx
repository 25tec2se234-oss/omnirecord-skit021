import React, { useState, useRef } from 'react';
import { Camera, Check } from 'lucide-react';

const PALETTES = [
  { bg: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)', text: '#FFFFFF', shadow: 'rgba(234, 88, 12, 0.25)' }, // Warm Orange
  { bg: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', text: '#FFFFFF', shadow: 'rgba(37, 99, 235, 0.25)' }, // Royal Blue
  { bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)', text: '#FFFFFF', shadow: 'rgba(5, 150, 105, 0.25)' }, // Emerald
  { bg: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', text: '#FFFFFF', shadow: 'rgba(124, 58, 237, 0.25)' }, // Purple
  { bg: 'linear-gradient(135deg, #DB2777 0%, #BE185D 100%)', text: '#FFFFFF', shadow: 'rgba(219, 39, 119, 0.25)' }, // Rose
  { bg: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)', text: '#FFFFFF', shadow: 'rgba(8, 145, 178, 0.25)' }, // Cyan
  { bg: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', text: '#FFFFFF', shadow: 'rgba(79, 70, 229, 0.25)' }, // Indigo
  { bg: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)', text: '#FFFFFF', shadow: 'rgba(217, 119, 6, 0.25)' }  // Amber
];

function getPaletteForName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

function getInitials(name = '') {
  if (!name || typeof name !== 'string') return 'ST';
  const clean = name.trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export const UserAvatar = ({
  name = 'Student',
  src = null,
  size = 56,
  showBadge = true,
  editable = false,
  onAvatarChange = null,
  className = '',
  style = {}
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);

  // Filter out the hardcoded generic Unsplash dummy photos so real users get authentic monograms
  const isGenericUnsplash =
    src &&
    typeof src === 'string' &&
    (src.includes('photo-1534528741775') || src.includes('unsplash.com/photo-'));

  const hasValidCustomPhoto = src && !isGenericUnsplash && !imgError;
  const initials = getInitials(name);
  const palette = getPaletteForName(name);

  const fontSize = Math.max(12, Math.floor(size * 0.38));
  const badgeSize = Math.max(16, Math.floor(size * 0.32));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (onAvatarChange && loadEvt.target?.result) {
          onAvatarChange(loadEvt.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`user-avatar-container ${className}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        userSelect: 'none',
        ...style
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar Circle */}
      {hasValidCustomPhoto ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid #FFFFFF',
            boxShadow: `0 4px 10px ${palette.shadow}`
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: palette.bg,
            color: palette.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize,
            letterSpacing: '-0.02em',
            border: '3px solid #FFFFFF',
            boxShadow: `0 4px 12px ${palette.shadow}`,
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
          title={name}
        >
          {initials}
        </div>
      )}

      {/* Verified Institutional Student Badge */}
      {showBadge && (
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: badgeSize,
            height: badgeSize,
            borderRadius: '50%',
            background: '#16A34A',
            border: '2px solid #FFFFFF',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}
          title="Verified Student Identity (SKIT Jaipur)"
        >
          <Check size={Math.floor(badgeSize * 0.6)} strokeWidth={3} />
        </div>
      )}

      {/* Optional Upload / Edit Photo Overlay */}
      {editable && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.45)',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              cursor: 'pointer',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
              backdropFilter: 'blur(2px)'
            }}
            title="Upload custom profile photo"
          >
            <Camera size={Math.floor(size * 0.3)} />
            {size >= 64 && (
              <span style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Edit
              </span>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default UserAvatar;
