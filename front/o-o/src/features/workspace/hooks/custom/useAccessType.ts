import { useState } from 'react';

export type AccessType = "private" | "public";

export const useAccessType = (initialAccessType: AccessType = "private") => {
  const [accessType, setAccessType] = useState<AccessType>(initialAccessType);

  return {
    accessType,
    setAccessType,
  };
};
