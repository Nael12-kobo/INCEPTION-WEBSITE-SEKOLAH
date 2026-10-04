"use client";

import * as React from "react";

// Hero Section
export function HeroSection({
  schoolName = "SMK NARA",
  subtitle,
  ctaText = "Lihat Jurusan",
  secondaryCta = "Tanya NARA",
}: {
  schoolName: string;
  subtitle?: string;
  ctaText?: string;
  secondaryCta?: string;
}) {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-b from-primary/10 to-secondary/5 overflow-hidden">
      <div className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-30" />
      <div className="relative z-10 min-h-full flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="animate-scale-in mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
            Bangun Masa Depanmu Bersama {schoolName}
          </h1>
        </div>
        <p className="mt-6 text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl">
          {subtitle || "Temukan pendidikan kejuruan yang sesuai dengan minat, kemampuan, dan tujuan kariermu."}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          <button className="bg-primary text-white px-6 py-3 rounded-full font-medium text-lg transition-colors hover:bg-primary/90 dark:hover:bg-primary/70">
            {ctaText}
          </button>
          <button className="bg-white text-primary px-6 py-3 rounded-full font-medium text-lg border-2 border-primary/20 transition-colors hover:bg-primary/10 dark:hover:bg-primary/20">
            {secondaryCta}
          </button>
        </div>
      </div>
    </section>
  );
}

// Jurusan Card
export function JurusanCard({
  id,
  name,
  description,
}: {
  id: string;
  name: string;
  description: string;
}) {
  return (
    <div className="group hover:shadow-xl transition-shadow duration-300">
      <div className="h-24 w-full rounded-t-lg bg-primary/10 flex items-center justify-center">
        <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path className="stroke-width-2" strokeLinecap="round" strokeLinejoin="round" d="M3 8l7 7 7-7m0 0l-7 7 7 7M3 8l7-7-7-7" /></svg>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-foreground">{name}</h3>
        <p className="text-sm text-zinc-500 line-clamp-3">{description}</p>
      </div>
      <div className="p-2">
        <button
          className="w-full text-sm font-medium text-primary hover:underline"
          onClick={() => window.location.hash = `#${id}`}
        >
          Lihat More
        </button>
      </div>
    </div>
  );
}

// Facilities Card
export function FacilitiesCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group hover:shadow-xl transition-shadow duration-300">
      <div className="h-24 w-full rounded-t-lg bg-primary/10 flex items-center justify-center">
        <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path className="stroke-width-2" strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8m12 4h.01M7 7h10a2 2 0 012 2v2a2 2 0 01-2 2H7m5 3v2a2 2 0 01-2 2H10m7-4a2 2 0 012-2h2a2 2 0 012 2v-2a2 2 0 01-2-2h-2z" /></svg>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-zinc-500 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}

// Achievement Card
export function AchievementCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="group hover:shadow-xl transition-shadow duration-300 p-4">
      <div className="flex items-start justify-between">
        <div>
          <svg className="h-5 w-5 text-primary mb-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12 15.25a3.25 3.25 0 010-6.5 3.25 3.25 0 010 6.5zm.178-6.342A6.325 6.325 0 0112 2c-3.106 0-5.938.608-8.13 1.718.288.378.43 1.02.43 1.722 0 .188-.014.386-.022.595a13.154 13.154 0 006.938 2.031 13.134 13.134 0 01-2.042.818 13.188 13.188 0 00.676 2.345h.014a13.129 13.129 0 006.95-2.031 13.163 13.163 0 012.173-.808c.378-.378.525-.89.43-1.722A6.35 6.35 0 0112 2z" /></svg>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24"><path fill="currentColor" d="M12 15.25a3.25 3.25 0 010-6.5 3.25 3.25 0 010 6.5zm.178-6.342A6.325 6.325 0 0112 2c-3.106 0-5.938.608-8.13 1.718.288.378.43 1.02.43 1.722 0 .188-.014.386-.022.595a13.154 13.154 0 006.938 2.031 13.134 13.134 0 01-2.042.818 13.188 13.188 0 00.676 2.345h.014a13.129 13.129 0 006.95-2.031 13.163 13.163 0 012.173-.808c.378-.378.525-.89.43-1.722A6.35 6.35 0 0112 2z" /></svg>
        </div>
      </div>
    </div>
  );
}

// Activity Card
export function ActivityCard({
  title,
  time,
}: {
  title: string;
  time: string;
}) {
  return (
    <div className="group hover:shadow-sm transition-shadow duration-300 p-4 border-t-4 border-primary">
      <div className="flex items-start justify-between">
        <div>
          <svg className="h-5 w-5 text-primary mb-2" viewBox="0 0 24 24"><path fill="currentColor" d="M8 12l4-4m0 0l-4-4m4 4l4 4m-4-4l-4 4m6-6l6 6m-6-6l6-6" /></svg>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-xs text-zinc-500">{time}</p>
        </div>
      </div>
    </div>
  );
}

// Contact Card
export function ContactCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-zinc-200 bg-white hover:bg-primary/5 transition-colors">
      <svg className="h-5 w-5 text-primary mt-1 flex-shrink-0" viewBox="0 0 24 24"><path fill="currentColor" d="M3 8l7 7 7-7m-1.5-4.5l2.5 2.5M16 16l2.5 2.5M8 16l-2.5 2.5M16 8l2.5-2.5M8.5 13l2.5-2.5M13 8l2.5-2.5M8 8l-2.5-2.5M13 13l-2.5-2.5M3 3l3.5 3.5M9 9l3.5 3.5M3 9l3.5 3.5M9 3l3.5 3.5" /></svg>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-zinc-500">{value}</p>
      </div>
    </div>
  );
}

// Chatbot Toggle Button
export function ChatbotToggleButton() {
  return (
    <button
      className="w-full justify-start px-4 py-3 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12 5v14M5 12h14" /></svg>
      Tanya NARA
    </button>
  );
}

// Navbar Link
export function NavbarLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="relative inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/10 dark:hover:bg-primary/20"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M3 8l7 7 7-7m0 0l-7 7 7 7M3 8l7-7-7-7" /></svg>
      <span>{label}</span>
    </a>
  );
}

// Underline Link
export function UnderlineLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="relative text-zinc-600 dark:text-zinc-400 after:content-[''] after:absolute after:bottom-[-4] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-hover after:duration-300 hover:after:w-full"
    >
      {label}
    </a>
  );
}