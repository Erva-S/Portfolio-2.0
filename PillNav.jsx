'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './PillNav.css';

const THEMES = {
  dark: {
    '--pn-surface': 'rgba(38, 35, 46, 0.66)',
    '--pn-solid': '#26232e',
    '--pn-edge': 'rgba(255, 255, 255, 0.08)',
    '--pn-rim': 'rgba(255, 255, 255, 0.07)',
    '--pn-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--pn-text': 'rgba(244, 244, 245, 0.64)',
    '--pn-strong': '#f4f4f5',
    '--pn-pill': '#2a2219',
    '--pn-pill-ink': '#faf8f3',
    '--pn-pill-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 16px -6px rgba(0, 0, 0, 0.6)',
    '--pn-dot': '#d4a574',
    '--pn-ring': 'rgba(212, 165, 116, 0.55)',
    '--pn-row-hover': 'rgba(255, 255, 255, 0.06)'
  },
  light: {
    '--pn-surface': 'rgba(250, 248, 243, 0.88)',
    '--pn-solid': '#f5f1e8',
    '--pn-edge': 'rgba(42, 34, 25, 0.08)',
    '--pn-rim': 'rgba(255, 255, 255, 0.95)',
    '--pn-shadow': '0 16px 36px -18px rgba(42, 34, 25, 0.12), 0 4px 12px -4px rgba(42, 34, 25, 0.05)',
    '--pn-text': 'rgba(42, 34, 25, 0.65)',
    '--pn-strong': '#2a2219',
    '--pn-pill': '#2a2219',
    '--pn-pill-ink': '#faf8f3',
    '--pn-pill-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 12px -4px rgba(42, 34, 25, 0.35)',
    '--pn-dot': '#d4a574',
    '--pn-ring': 'rgba(212, 165, 116, 0.5)',
    '--pn-row-hover': 'rgba(42, 34, 25, 0.05)'
  }
};

const DEFAULT_ITEMS = [
  { label: 'Note', href: '#note' },
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Proof', href: '#proof' },
  { label: 'Build', href: '#work-with-me' },
  { label: 'Contact', href: '#contact' }
];

export const PillNav = ({
  items = DEFAULT_ITEMS,
  defaultActiveIndex = 0,
  onItemClick,
  theme = 'light',
  indicator = 'pill'
}) => {
  return null; // Reference React implementation
};

export default PillNav;
