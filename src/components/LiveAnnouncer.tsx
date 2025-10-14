import { useEffect, useRef } from 'react';

interface LiveAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export function LiveAnnouncer({ message, priority = 'polite' }: LiveAnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && announcerRef.current) {
      // Clear and re-announce to trigger screen readers
      announcerRef.current.textContent = '';
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}
