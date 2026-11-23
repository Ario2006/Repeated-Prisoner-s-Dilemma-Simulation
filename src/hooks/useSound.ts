import { useEffect, useState } from 'react';
import { sound } from '../audio/sound';

export function useSoundEnabled() {
  const [on, setOn] = useState(sound.enabled);
  useEffect(() => sound.subscribe(setOn), []);
  return [on, (v: boolean) => sound.setEnabled(v)] as const;
}
