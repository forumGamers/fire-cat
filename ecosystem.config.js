module.exports = {
  apps: [
    {
      name: "user-service-read",
      script: "./dist/main.js",
      instances: 1,
      autoRestart: true,
    },
  ],
};
