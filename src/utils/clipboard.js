import { toast } from 'react-toastify';

/**
 * Secure clipboard utility with fallback mechanisms
 * Handles NotAllowedError and provides alternative copy methods
 */
class ClipboardService {
  constructor() {
    this.hasClipboardAPI = 'clipboard' in navigator && 'writeText' in navigator.clipboard;
    this.hasExecCommand = document.queryCommandSupported && document.queryCommandSupported('copy');
  }

  /**
   * Check if clipboard operations are supported and permitted
   */
  async checkPermissions() {
    if (!this.hasClipboardAPI) {
      return { supported: false, reason: 'Clipboard API not supported' };
    }

    try {
      // Check if we have permission
      const permission = await navigator.permissions.query({ name: 'clipboard-write' });
      return { 
        supported: true, 
        permitted: permission.state === 'granted' || permission.state === 'prompt'
      };
    } catch (error) {
      // Some browsers don't support permissions.query for clipboard
      return { supported: true, permitted: true };
    }
  }

  /**
   * Primary method: Try modern Clipboard API
   */
  async tryClipboardAPI(text) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard-api' };
    } catch (error) {
      console.warn('Clipboard API failed:', error);
      
      if (error.name === 'NotAllowedError') {
        return { 
          success: false, 
          error: 'Clipboard access denied. Please allow clipboard permissions or try again.',
          fallback: true
        };
      }
      
      return { success: false, error: error.message, fallback: true };
    }
  }

  /**
   * Fallback method: Use deprecated execCommand
   */
  tryExecCommand(text) {
    try {
      // Create temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.setAttribute('readonly', '');
      
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        return { success: true, method: 'exec-command' };
      } else {
        return { success: false, error: 'execCommand failed' };
      }
    } catch (error) {
      console.warn('execCommand failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Last resort: Select text for manual copy
   */
  selectText(text) {
    try {
      // Create a temporary element with the text
      const div = document.createElement('div');
      div.textContent = text;
      div.style.position = 'fixed';
      div.style.left = '0';
      div.style.top = '0';
      div.style.padding = '10px';
      div.style.background = 'white';
      div.style.border = '2px solid #007bff';
      div.style.borderRadius = '4px';
      div.style.zIndex = '10000';
      div.style.userSelect = 'text';
      
      document.body.appendChild(div);
      
      // Select the text
      const range = document.createRange();
      range.selectNodeContents(div);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Remove after 5 seconds
      setTimeout(() => {
        if (document.body.contains(div)) {
          document.body.removeChild(div);
        }
      }, 5000);
      
      return { success: true, method: 'text-selection' };
    } catch (error) {
      console.error('Text selection failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Main copy method with comprehensive fallback chain
   */
  async copyToClipboard(text, options = {}) {
    const { showToast = true, toastPosition = 'top-right' } = options;
    
    if (!text || typeof text !== 'string') {
      const error = 'Invalid text provided for copying';
      if (showToast) {
        toast.error(error, { position: toastPosition });
      }
      return { success: false, error };
    }

    // Check permissions first
    const permissions = await this.checkPermissions();
    
    if (permissions.supported && permissions.permitted !== false) {
      // Try modern Clipboard API
      const clipboardResult = await this.tryClipboardAPI(text);
      
      if (clipboardResult.success) {
        if (showToast) {
          toast.success('Copied to clipboard!', { 
            position: toastPosition,
            autoClose: 2000
          });
        }
        return clipboardResult;
      }
      
      // If clipboard API failed but we should try fallbacks
      if (clipboardResult.fallback && this.hasExecCommand) {
        const execResult = this.tryExecCommand(text);
        
        if (execResult.success) {
          if (showToast) {
            toast.success('Copied to clipboard!', { 
              position: toastPosition,
              autoClose: 2000
            });
          }
          return execResult;
        }
      }
    }
    
    // All automatic methods failed, try text selection
    const selectionResult = this.selectText(text);
    
    if (selectionResult.success) {
      if (showToast) {
        toast.info('Text selected. Press Ctrl+C (Cmd+C on Mac) to copy.', {
          position: toastPosition,
          autoClose: 4000
        });
      }
      return selectionResult;
    }
    
    // Complete failure
    const errorMessage = 'Unable to copy to clipboard. Please copy the text manually.';
    if (showToast) {
      toast.error(errorMessage, { 
        position: toastPosition,
        autoClose: 4000
      });
    }
    
    console.error('All clipboard methods failed for text:', text);
    return { success: false, error: errorMessage };
  }

  /**
   * Copy link with additional formatting
   */
  async copyLink(url, options = {}) {
    const { includeProtocol = true } = options;
    
    let linkText = url;
    
    if (includeProtocol && !url.startsWith('http')) {
      linkText = `${window.location.protocol}//${window.location.host}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    
    return this.copyToClipboard(linkText, {
      ...options,
      showToast: true
    });
  }

  /**
   * Copy current page URL
   */
  async copyCurrentUrl(options = {}) {
    return this.copyToClipboard(window.location.href, options);
  }
}

// Export singleton instance
export const clipboardService = new ClipboardService();
export default clipboardService;