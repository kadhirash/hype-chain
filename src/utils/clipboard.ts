import { toast } from '@/src/components/Toast';

/**
 * Copy text to clipboard with error handling and fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
      return true;
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        toast.success('Copied to clipboard!');
        return true;
      } else {
        throw new Error('Copy command failed');
      }
    } catch (err) {
      document.body.removeChild(textArea);
      throw err;
    }
  } catch (err) {
    toast.error('Failed to copy. Please copy manually.');
    return false;
  }
}

