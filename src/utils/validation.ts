/**
 * Validate Ethereum wallet address format
 * @param address Wallet address to validate
 * @returns true if valid format, false otherwise
 */
export function isValidWalletAddress(address: string): boolean {
  if (!address) return false;
  
  // Basic Ethereum address format: 0x followed by 40 hex characters
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address.trim());
}

/**
 * Get wallet address validation error message
 */
export function getWalletAddressError(address: string): string | null {
  if (!address) {
    return 'Wallet address is required';
  }
  
  const trimmed = address.trim();
  
  if (!trimmed.startsWith('0x')) {
    return 'Wallet address must start with 0x';
  }
  
  if (trimmed.length !== 42) {
    return 'Wallet address must be 42 characters (0x + 40 hex characters)';
  }
  
  if (!/^0x[a-fA-F0-9]+$/.test(trimmed)) {
    return 'Wallet address contains invalid characters (only 0-9, a-f, A-F allowed)';
  }
  
  return null;
}

