import { useState } from 'react';

export const useShareLink = (link: string) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    copied,
    handleCopyLink,
  };
};
