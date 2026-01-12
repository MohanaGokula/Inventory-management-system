export function getFileName(fullPath) {
    // Split the path using '/' as the separator and get the last part
    const pathParts = fullPath.split('/');
    const filename = pathParts[pathParts.length - 1];
  
    return filename;
  }