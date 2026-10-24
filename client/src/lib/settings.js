import { useEffect, useState } from 'react';
import { api } from '../api.js';

export const DEFAULT_SETTINGS = {
  academyName: 'Triumph Archery Academy',
  motto: 'Aim · Focus · Triumph',
  formTitle: 'Admission Form',
  footer:
    'CONTACT US · Phone: 9600019334 & 9094070501 · Location: Parvathi Nagar, Old Perungalathur',
  declarationText:
    'I hereby declare that the information provided above is true and accurate to the best of my knowledge. I agree to follow the Academy rules, safety protocols, and all policies of Triumph Archery Academy.'
};

let cache = null;

export async function getSettings(force = false) {
  if (cache && !force) return cache;
  cache = await api('/settings');
  return cache;
}

export function setSettings(next) {
  cache = next;
  return next;
}

export function useSettings() {
  const [settings, setSettings] = useState(cache || DEFAULT_SETTINGS);

  useEffect(() => {
    let alive = true;
    getSettings()
      .then((s) => alive && setSettings({ ...DEFAULT_SETTINGS, ...s }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}
