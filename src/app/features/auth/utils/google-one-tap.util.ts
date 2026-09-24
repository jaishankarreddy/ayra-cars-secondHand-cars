/**
 * Google One Tap prompt wrapper.
 * Raw `google.accounts.id.prompt()` fails SILENTLY when the origin is not
 * registered (HTTP 403 on gsi/status), so users see "nothing happens".
 * The moment listener below converts those silent moments into readable errors.
 */

type MomentNotification = {
  isNotDisplayed?: () => boolean;
  getNotDisplayedReason?: () => string;
  isSkippedMoment?: () => boolean;
  getSkippedReason?: () => string;
  isDismissedMoment?: () => boolean;
  getDismissedReason?: () => string;
};

function reasonMessage(reason: string): string | null {
  switch (reason) {
    case 'unregistered_origin':
      return 'Google blocked sign-in for this site address (error 403). Add this exact origin (e.g. http://localhost:4200) under Authorized JavaScript origins in Google Cloud Console → Credentials.';
    case 'missing_client_id':
      return 'Google Client ID is missing. Add it in environment.ts (googleClientId).';
    case 'invalid_client':
      return 'Google Client ID is invalid. Check it in Google Cloud Console → Credentials.';
    case 'opt_out_or_no_session':
      return 'No active Google session in this browser. Sign in to a Google account first, then retry.';
    case 'browser_not_supported':
      return 'This browser blocks Google sign-in. Try Chrome or Edge.';
    case 'unknown_reason':
      return 'Google sign-in did not start (popup blocked or third-party cookies off). Allow popups/cookies and retry.';
    default:
      return null;
  }
}

/** Returns true when the GSI library is loaded, false when the button should show "not ready". */
export function googleReady(): boolean {
  const w = window as unknown as { google?: { accounts?: { id?: unknown } } };
  return !!w.google?.accounts?.id;
}

/** Opens the One Tap prompt; calls onError with a readable message when Google silently refuses. */
export function promptGoogleOneTap(onError: (message: string) => void): void {
  const w = window as unknown as {
    google?: { accounts?: { id?: { prompt: (cb?: (n: MomentNotification) => void) => void } } };
  };
  const prompt = w.google?.accounts?.id?.prompt;
  if (!prompt) {
    onError('Google sign-in is not ready. Please refresh the page and try again.');
    return;
  }
  try {
    prompt.call(w.google?.accounts?.id, (notification: MomentNotification) => {
      try {
        if (notification?.isNotDisplayed?.()) {
          const message = reasonMessage(notification.getNotDisplayedReason?.() || '');
          if (message) onError(message);
          return;
        }
        if (notification?.isSkippedMoment?.()) {
          const reason = notification.getSkippedReason?.() || '';
          // user_cancel / tap_outside are normal user actions — stay silent.
          if (reason && reason !== 'user_cancel' && reason !== 'tap_outside') {
            onError(reasonMessage(reason) || `Google sign-in was skipped (${reason}). Please try again.`);
          }
          return;
        }
        if (notification?.isDismissedMoment?.()) {
          const reason = notification.getDismissedReason?.() || '';
          if (reason === 'credential_returned') return; // success path — callback handles it
          if (reason && reason !== 'dismiss_button' && reason !== 'tap_outside' && reason !== 'cancel_called') {
            onError(reasonMessage(reason) || `Google sign-in was dismissed (${reason}). Please try again.`);
          }
        }
      } catch {
        // never break the page because of a diagnostics listener
      }
    });
  } catch {
    onError('Google sign-in failed to start. Please refresh and try again.');
  }
}
