/**
 * These polyfills are required because some library is depending on these existing, even though this is run as
 * a browser side application and not node.
 */

(window || {}).process = {
  env: {
    NODE_ENV: 'production',
  },
};