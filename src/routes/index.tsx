// src/routes/index.tsx
export const routes = {
    home: '/',
    auth: '/auth',
    authCallback: '/auth/callback',
    game: '/game',
    settings: '/settings',
    achievements: '/game/achievements',
    leaderboard: '/game/leaderboard',
    tournaments: '/game/tournaments',
    stats: '/game/stats',
    profile: '/game/profile',
  } as const;
  
  // Type for route keys
  export type RouteKey = keyof typeof routes;
  
  // Helper function to generate route paths with parameters
  export const generatePath = (route: RouteKey, params?: Record<string, string>) => {
    let path: string = routes[route];
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, value);
      });
    }
    return path;
  };
  
  // Type-safe navigation helper
  export const getRoute = (route: RouteKey, params?: Record<string, string>) => {
    return generatePath(route, params);
  };
  
  // Game-specific route configuration
  export const gameRoutes = {
    main: routes.game,
    achievements: routes.achievements,
    leaderboard: routes.leaderboard,
    tournaments: routes.tournaments,
    stats: routes.stats,
    profile: routes.profile,
  } as const;