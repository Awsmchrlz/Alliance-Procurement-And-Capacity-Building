module.exports = {
  apps: [
    {
      // Application configuration
      name: 'alliance-procurement-app',
      script: './dist/index.js',
      cwd: '/var/www/alliance-procurement',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },

      // PM2 clustering options
      instances: 'max', // Use all available CPUs
      exec_mode: 'cluster',

      // Restart policy
      autorestart: true,
      watch: false, // Don't watch files in production
      max_memory_restart: '1G',
      restart_delay: 4000,

      // Logging
      log_file: '/var/log/alliance-app/combined.log',
      out_file: '/var/log/alliance-app/out.log',
      error_file: '/var/log/alliance-app/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Advanced PM2 features
      kill_timeout: 5000,
      listen_timeout: 8000,

      // Health monitoring
      min_uptime: '10s',
      max_restarts: 5,

      // Process management
      pid_file: '/var/run/alliance-app.pid',

      // Environment file
      env_file: '.env.production',

      // Post-deployment hooks
      post_update: ['npm install', 'npm run build'],

      // Graceful shutdown
      kill_retry_time: 100,

      // Source map support for better error reporting
      source_map_support: true,

      // Disable automatic restart on crash (for debugging)
      autorestart: true,

      // Advanced logging options
      log_type: 'json',

      // Monitoring and metrics
      pmx: true,

      // Instance variables (useful for load balancing)
      instance_var: 'INSTANCE_ID'
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu', // Change to your VPS username
      host: ['YOUR_VPS_IP'], // Change to your VPS IP
      ref: 'origin/main', // or your main branch
      repo: 'https://github.com/yourusername/your-repo.git', // Your repo URL
      path: '/var/www/alliance-procurement',

      // Pre-deployment
      'pre-deploy-local': '',

      // Post-deployment commands
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',

      // Pre-setup (run once)
      'pre-setup': 'sudo mkdir -p /var/www && sudo chown -R $USER:$USER /var/www',

      // Environment variables for deployment
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
