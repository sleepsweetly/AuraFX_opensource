'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { siteConfig, getDiscordInviteUrl } from '@/lib/config';

export default function NotFound() {
  const [isMounted, setIsMounted] = useState(false);
  const [discordUrl, setDiscordUrl] = useState(siteConfig.discordInviteUrl);

  useEffect(() => {
    setIsMounted(true);
    
    // Update Discord URL from GitHub
    getDiscordInviteUrl().then(url => {
      setDiscordUrl(url);
    });
    
    // Enhanced grid animation based on mouse movement
    const grid = document.querySelector('.grid-background');
    const onMouseMoveGrid = (e: MouseEvent) => {
      if (grid) {
        const mouseX = (e.clientX / window.innerWidth) * 100;
        const mouseY = (e.clientY / window.innerHeight) * 100;
        (grid as HTMLElement).style.backgroundPosition = `${mouseX * 0.5}px ${mouseY * 0.5}px`;
      }
    };
    document.addEventListener('mousemove', onMouseMoveGrid);

    // Interactive floating cubes
    const cubes = document.querySelectorAll('.floating-cube');
    const onMouseMoveCubes = (e: MouseEvent) => {
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      cubes.forEach((cube, index) => {
        const speed = (index + 1) * 0.3;
        const x = (mouseX * 30 - 15) * speed;
        const y = (mouseY * 30 - 15) * speed;
        (cube as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    document.addEventListener('mousemove', onMouseMoveCubes);

    // Add subtle parallax effect to the error code
    const errorCode = document.querySelector('.error-code');
    const onMouseMoveError = (e: MouseEvent) => {
      if (errorCode) {
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        (errorCode as HTMLElement).style.transform = `translate(${mouseX * 10}px, ${mouseY * 10}px) scale(${1 + Math.abs(mouseX) * 0.02})`;
      }
    };
    document.addEventListener('mousemove', onMouseMoveError);

    // Add hover effects to buttons
    const btns = document.querySelectorAll('.btn');
    const onMouseEnter = (e: Event) => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.02)';
    };
    const onMouseLeave = (e: Event) => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
    };
    btns.forEach(btn => {
      btn.addEventListener('mouseenter', onMouseEnter);
      btn.addEventListener('mouseleave', onMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', onMouseMoveGrid);
      document.removeEventListener('mousemove', onMouseMoveCubes);
      document.removeEventListener('mousemove', onMouseMoveError);
      btns.forEach(btn => {
        btn.removeEventListener('mouseenter', onMouseEnter);
        btn.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="not-found-page">
      <div className="grid-background"></div>
      <div className="floating-elements">
        <div className="floating-cube"></div>
        <div className="floating-cube"></div>
        <div className="floating-cube"></div>
        <div className="floating-cube"></div>
      </div>
      <div className="container">
        <div className="logo-container">
          <div className="logo-icon"></div>
          <div className="logo-text">AuraFX</div>
        </div>
        <div className="error-code">404</div>
        <h1 className="error-message">Page Not Found</h1>
        <p className="error-description">
          The page you&apos;re looking for doesn&apos;t exist. It might have been moved, deleted, or you entered the wrong URL. 
          Let&apos;s get you back on track.
        </p>
        <div className="button-container">
          <Link href="/" className="btn btn-primary">
            <span>← Back to Home</span>
          </Link>
          <Link href={discordUrl} className="btn btn-secondary" target="_blank" rel="noopener noreferrer" suppressHydrationWarning={true}>
            <span>Discord</span>
          </Link>
        </div>
      </div>
      <div className="contact-info">
        Need help? Contact <span className="discord-tag">yaslicadi</span> on Discord
      </div>
    </div>
  );
} 