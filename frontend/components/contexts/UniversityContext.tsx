// contexts/UniversityContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface University {
  id: string;
  name: string;
  country: string;
  ranking: number;
  tuitionFee: string;
  programs: string[];
  matchReason?: string;
  programRelevance?: string;
  fitScore?: number;
  tradeoffs?: string;
}

interface UniversityContextType {
  discoveredUniversities: University[];
  shortlistedUniversities: University[];
  setDiscoveredUniversities: (universities: University[]) => void;
  setShortlistedUniversities: (universities: University[]) => void;
  addToShortlist: (university: University) => void;
  removeFromShortlist: (universityId: string) => void;
  isLoading: boolean;
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined);

export function UniversityProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [discoveredUniversities, setDiscoveredUniversitiesState] = useState<University[]>([]);
  const [shortlistedUniversities, setShortlistedUniversitiesState] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const discovered = localStorage.getItem(`universities_${userId}`);
        const shortlist = localStorage.getItem(`shortlist_${userId}`);

        if (discovered) {
          const parsedDiscovered = JSON.parse(discovered);
          setDiscoveredUniversitiesState(parsedDiscovered);
          console.log('✅ Loaded discovered universities:', parsedDiscovered.length);
        }

        if (shortlist) {
          const parsedShortlist = JSON.parse(shortlist);
          setShortlistedUniversitiesState(parsedShortlist);
          console.log('✅ Loaded shortlisted universities:', parsedShortlist.length);
        }
      } catch (error) {
        console.error('❌ Error loading university data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `universities_${userId}` || e.key === `shortlist_${userId}`) {
        console.log('📡 Storage changed, reloading data');
        loadData();
      }
    };

    // Listen for custom events (same-tab updates)
    const handleCustomUpdate = () => {
      console.log('🔄 Custom update event received');
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('universitiesUpdated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('universitiesUpdated', handleCustomUpdate);
    };
  }, [userId]);

  // Wrapper functions that sync with localStorage
  const setDiscoveredUniversities = (universities: University[]) => {
    setDiscoveredUniversitiesState(universities);
    localStorage.setItem(`universities_${userId}`, JSON.stringify(universities));
    console.log('💾 Saved discovered universities:', universities.length);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('universitiesUpdated', { 
      detail: { type: 'discovered', universities } 
    }));
  };

  const setShortlistedUniversities = (universities: University[]) => {
    setShortlistedUniversitiesState(universities);
    localStorage.setItem(`shortlist_${userId}`, JSON.stringify(universities));
    console.log('💾 Saved shortlisted universities:', universities.length);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('universitiesUpdated', { 
      detail: { type: 'shortlist', universities } 
    }));
  };

  const addToShortlist = (university: University) => {
    const updated = [...shortlistedUniversities, university];
    setShortlistedUniversities(updated);
  };

  const removeFromShortlist = (universityId: string) => {
    const updated = shortlistedUniversities.filter(u => u.id !== universityId);
    setShortlistedUniversities(updated);
  };

  return (
    <UniversityContext.Provider
      value={{
        discoveredUniversities,
        shortlistedUniversities,
        setDiscoveredUniversities,
        setShortlistedUniversities,
        addToShortlist,
        removeFromShortlist,
        isLoading,
      }}
    >
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversities() {
  const context = useContext(UniversityContext);
  if (context === undefined) {
    throw new Error('useUniversities must be used within a UniversityProvider');
  }
  return context;
}