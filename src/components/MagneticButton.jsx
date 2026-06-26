import { useRef, useCallback } from 'react';
import gsap from 'gsap';

/**
 * MagneticButton - 磁吸按钮包装组件
 * 鼠标靠近时按钮会被"吸"向光标方向，离开时弹回原位
 */
export default function MagneticButton({ children, className, style, strength = 0.35, ease = 'power3.out', duration = 0.4, ...props }) {
  const btnRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    gsap.to(btn, {
      x: deltaX,
      y: deltaY,
      duration,
      ease,
      overwrite: 'auto',
    });
  }, [strength, ease, duration]);

  const handleMouseLeave = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    });
  }, []);

  return (
    <div
      ref={btnRef}
      className={className}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
}
