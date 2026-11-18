import React from 'react';

interface SnowfallOverlayProps {
  enabled: boolean;
}

const FLAKE_COUNT = 28;

export const SnowfallOverlay: React.FC<SnowfallOverlayProps> = ({ enabled }) => {
  if (!enabled) return null;

  return (
    <div className="snowfall-overlay" aria-hidden="true">
      {Array.from({ length: FLAKE_COUNT }).map((_, index) => (
        <span key={index} className="snowflake-particle" />
      ))}
    </div>
  );
};
