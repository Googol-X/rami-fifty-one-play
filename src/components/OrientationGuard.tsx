import React from 'react';

interface OrientationGuardProps {
  children: React.ReactNode;
}

export const OrientationGuard: React.FC<OrientationGuardProps> = ({ children }) => {
  return (
    <>
      <div className="portrait-overlay">
        <div className="portrait-box">
          <div className="portrait-icon">📱↔️</div>
          <div className="portrait-msg">Veuillez pivoter l'appareil en mode paysage</div>
        </div>
      </div>
      {children}
    </>
  );
};
