import { useEffect, useRef, useState } from 'react';

export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fallback: always show after 800ms in case observer doesn't fire
    const timer = setTimeout(() => setShown(true), 800);
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return () => clearTimeout(timer);
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
            clearTimeout(timer);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 60px 0px' }
    );
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(timer); };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'in-view' : ''} ${className}`}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
