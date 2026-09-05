import { apiRoutes, axiosInstance } from 'src/api';

import { mergeAuthUser } from 'src/auth/post-login-redirect';

import { setSession } from './utils';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

/** **************************************
 * Login
 *************************************** */
export const signInWithPassword = async ({
  email,
  password,
}: SignInParams): Promise<{ user: any; token: string; responseData: any }> => {
  try {
    const params = { email, password };

    const res = await axiosInstance.post(apiRoutes.auth.signIn, params);

    // Handle the API response structure: { status, message, data: { user, token } }
    const responseData = res.data;

    if (!responseData.status || !responseData.data) {
      throw new Error(responseData.message || 'Login failed');
    }

    const { user, token } = responseData.data;

    if (!token) {
      throw new Error('Access token not found in response');
    }

    if (!user) {
      throw new Error('User data not found in response');
    }

    await setSession(token);

    let sessionUser = mergeAuthUser(user, responseData);
    try {
      const profileRes = await axiosInstance.get(apiRoutes.auth.profile);
      sessionUser = mergeAuthUser(sessionUser, profileRes.data);
    } catch {
      /* login payload is enough to enter the app; profile refresh happens on next load */
    }

    sessionStorage.setItem('user_data', JSON.stringify(sessionUser));

    return { user: sessionUser, token, responseData };
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

/** **************************************
 * Logout
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    // Try to call logout API, but don't fail if it errors
    // The important part is clearing the local session
    try {
      await axiosInstance.post(apiRoutes.auth.logout);
    } catch (apiError) {
      console.warn('Logout API call failed, but clearing local session anyway:', apiError);
    }

    // Always clear the session and token, even if API call fails
    await setSession(null);
  } catch (error) {
    console.error('Error during logout:', error);
    // Even if there's an error, try to clear the session
    await setSession(null);
    throw error;
  }
};
