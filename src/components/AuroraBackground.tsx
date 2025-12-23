import { memo } from "react";

const AuroraBackground = memo(() => {
  return (
    <div className="aurora-bg noise-overlay">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
    </div>
  );
});

AuroraBackground.displayName = "AuroraBackground";

export default AuroraBackground;
