const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '.next');

function deleteDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return true;
  }

  try {
    // Try the modern approach first (Node 14.14+)
    fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    return true;
  } catch (error) {
    // Fallback: try manual recursive deletion
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          deleteDirectory(fullPath);
        } else {
          // Retry file deletion with delays for locked files
          let deleted = false;
          for (let i = 0; i < 5; i++) {
            try {
              fs.unlinkSync(fullPath);
              deleted = true;
              break;
            } catch (e) {
              if (i < 4) {
                // Wait before retrying (files might be locked by OneDrive or other processes)
                const start = Date.now();
                while (Date.now() - start < 100) {}
              }
            }
          }
          if (!deleted) {
            throw new Error(`Could not delete ${fullPath}`);
          }
        }
      }
      
      fs.rmdirSync(dirPath);
      return true;
    } catch (fallbackError) {
      console.error('⚠ Error cleaning .next directory:', fallbackError.message);
      return false;
    }
  }
}

if (fs.existsSync(nextDir)) {
  if (deleteDirectory(nextDir)) {
    console.log('✓ Cleaned .next directory');
  } else {
    console.warn('⚠ Could not fully clean .next directory. You may need to manually delete it or restart your editor.');
    process.exit(0); // Don't fail - let Next.js try to handle it
  }
} else {
  console.log('✓ .next directory does not exist');
}

