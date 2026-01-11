// ----------------------------------------------------------------------

export const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  VENDOR: '/vendor',
  SHOP: '/shop',
  PROFILE: '/profile',
  ROLE: '/role',
  DRIVER: '/driver',
  PRODUCTS: '/products',
  LOCATIONS: '/locations',
  CITY: '/locations/city',
  AREA: '/locations/area',
  CATEGORIES: '/categories',
  CATEGORY_ATTRIBUTES: '/categories/attributes',
  CATEGORY_DETAILS: '/categories/details',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.ADMIN,
    vendor: ROOTS.VENDOR,
    shop: ROOTS.SHOP,
    profile: ROOTS.PROFILE,
    role: ROOTS.ROLE,
    driver: ROOTS.DRIVER,
    products: ROOTS.PRODUCTS,
    locations: ROOTS.LOCATIONS,
    city: ROOTS.CITY,
    area: ROOTS.AREA,
    categories: ROOTS.CATEGORIES,
    categoryAttributes: ROOTS.CATEGORY_ATTRIBUTES,
    categoryDetails: ROOTS.CATEGORY_DETAILS,
    // two: `${ROOTS.DASHBOARD}/two`,
    // three: `${ROOTS.DASHBOARD}/three`,
    // group: {
    //   root: `${ROOTS.DASHBOARD}/group`,
    //   five: `${ROOTS.DASHBOARD}/group/five`,
    //   six: `${ROOTS.DASHBOARD}/group/six`,
    // },
  },
};
