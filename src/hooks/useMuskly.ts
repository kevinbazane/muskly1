import { useCallback, useEffect, useState } from "react";
import {
  DAY_KEY_PREFIX,
  PROFILE_KEY,
  emptyDay,
  todayKey,
  type DayLog,
  type Profile,
} from "@/lib/muskly";

export function useProfile() {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) setProfileState(JSON.parse(raw) as Profile);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const setProfile = useCallback((p: Profile | null) => {
    setProfileState(p);
    try {
      if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
      else localStorage.removeItem(PROFILE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { profile, setProfile, loaded };
}

export function useDayLog(date = todayKey()) {
  const [day, setDayState] = useState<DayLog>(() => emptyDay(date));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DAY_KEY_PREFIX + date);
      if (raw) setDayState({ ...emptyDay(date), ...(JSON.parse(raw) as DayLog) });
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [date]);

  const update = useCallback(
    (patch: Partial<DayLog>) => {
      setDayState((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(DAY_KEY_PREFIX + date, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [date],
  );

  return { day, update, loaded };
}
