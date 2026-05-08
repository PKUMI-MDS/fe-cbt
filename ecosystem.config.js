module.exports = {
  apps: [
    {
      name: "fe-cbt",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3009",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3009",
      },
    },
  ],
};
