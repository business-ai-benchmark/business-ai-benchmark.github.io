#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "⚙️ Installing dependencies..."
npm install

echo "🏗️ Building static site..."
npm run build

echo "✅ Build complete!"
echo "The fully static site has been generated in the 'dist/' folder."
echo "You can now upload the contents of the 'dist/' directory to S3, Cloudflare Pages, GitHub Pages, or any other static hosting provider."
