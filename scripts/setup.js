#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up SpendWise...\n");

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, "..", "node_modules");
if (fs.existsSync(nodeModulesPath)) {
  console.log("✅ Dependencies already installed\n");
} else {
  console.log("📦 Installing dependencies...\n");
  try {
    execSync("npm install", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    console.log("\n✅ Dependencies installed successfully!\n");
  } catch (error) {
    console.error("❌ Error installing dependencies:", error.message);
    process.exit(1);
  }
}

console.log("✨ Setup complete!\n");
console.log("📱 To start the app, run:");
console.log("   npm start\n");
console.log("💡 For more information, see SETUP.md\n");
