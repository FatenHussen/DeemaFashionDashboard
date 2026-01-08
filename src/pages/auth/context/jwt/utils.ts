import { paths } from 'src/routes/paths';

import { axiosInstance } from 'src/api';

import { JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export function jwtDecode(token: string) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken: string) {
  if (!accessToken) {
    return false;
  }

  // Laravel Sanctum tokens are not JWT tokens - they're plain strings
  // So we just check if the token exists and has a reasonable length
  // The server will validate the token on each request
  if (accessToken.length < 10) {
    return false;
  }

  // Try to decode as JWT if it looks like one (has dots)
  // Otherwise, assume it's a Sanctum token and just validate it exists
  if (accessToken.includes('.')) {
    try {
      const decoded = jwtDecode(accessToken);

      if (!decoded || !('exp' in decoded)) {
        return false;
      }

      const currentTime = Date.now() / 1000;

      return decoded.exp > currentTime;
    } catch (error) {
      // If it looks like JWT but can't decode, it's invalid
      return false;
    }
  }

  // For Sanctum tokens (no dots), just check if it exists
  // The server will validate it
  return true;
}

// ----------------------------------------------------------------------

export function tokenExpired(exp: number) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  setTimeout(() => {
    try {
      alert('Token expired!');
      sessionStorage.removeItem(JWT_STORAGE_KEY);
      window.location.href = paths.auth.jwt.signIn;
    } catch (error) {
      console.error('Error during token expiration:', error);
      throw error;
    }
  }, timeLeft);
}

// ----------------------------------------------------------------------

export async function setSession(accessToken: string | null) {
  try {
    if (accessToken) {
      sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);

      axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // Try to decode token for expiration check
      // Note: Laravel Sanctum tokens might not have exp, so we'll handle that gracefully
      try {
        const decodedToken = jwtDecode(accessToken);

        if (decodedToken && 'exp' in decodedToken) {
          tokenExpired(decodedToken.exp);
        }
      } catch (decodeError) {
        // If token doesn't have exp or can't be decoded, that's okay for Sanctum tokens
        // We'll rely on the server to validate the token
        console.log(
          'Token does not have expiration or cannot be decoded (this is normal for Sanctum tokens)'
        );
      }
    } else {
      // Clear session storage
      sessionStorage.removeItem(JWT_STORAGE_KEY);
      sessionStorage.removeItem('user_data');

      // Remove Authorization header from axios instance
      if (axiosInstance.defaults.headers.common.Authorization) {
        delete axiosInstance.defaults.headers.common.Authorization;
      }

      // Ensure it's completely removed
      axiosInstance.defaults.headers.common = {
        ...axiosInstance.defaults.headers.common,
        Authorization: undefined,
      };
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}
