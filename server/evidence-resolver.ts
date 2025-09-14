import { createClient } from '@supabase/supabase-js';

interface EvidenceResolverOptions {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket: string;
  userId?: string;
}

export class EvidenceResolver {
  private supabase;
  private bucket: string;
  private userId?: string;

  constructor(options: EvidenceResolverOptions) {
    this.supabase = createClient(options.supabaseUrl, options.serviceRoleKey);
    this.bucket = options.bucket;
    this.userId = options.userId;
  }

  /**
   * Generate all possible path variations for a given evidence path
   */
  private generatePathVariations(originalPath: string): string[] {
    const paths = new Set<string>();
    
    // Add the original path
    paths.add(originalPath);
    
    // Remove various URL prefixes
    const cleanedPaths = [
      originalPath.replace("/storage/v1/object/", ""),
      originalPath.replace("/storage/v1/object/public/", ""),
      originalPath.replace("public/", ""),
      originalPath.replace(/^\/+/, ""), // Remove leading slashes
    ];
    
    cleanedPaths.forEach(path => paths.add(path));
    
    // Extract filename and path components
    const pathParts = originalPath.split('/').filter(part => part.length > 0);
    const filename = pathParts[pathParts.length - 1];
    
    if (filename) {
      paths.add(filename);
    }
    
    // Try different combinations with evidence prefix
    cleanedPaths.forEach(path => {
      if (!path.startsWith('evidence/')) {
        paths.add(`evidence/${path}`);
      }
      
      // Try without evidence prefix
      if (path.startsWith('evidence/')) {
        paths.add(path.replace('evidence/', ''));
      }
    });
    
    // Try last 2, 3, 4 path segments
    for (let i = 2; i <= Math.min(4, pathParts.length); i++) {
      const lastSegments = pathParts.slice(-i).join('/');
      paths.add(lastSegments);
      paths.add(`evidence/${lastSegments}`);
    }
    
    // If we have userId, try user-specific paths
    if (this.userId && filename) {
      // Try to reconstruct the standard path format
      const eventIdMatch = originalPath.match(/\/([a-f0-9-]{36})\//);
      if (eventIdMatch) {
        const eventId = eventIdMatch[1];
        paths.add(`evidence/${this.userId}/${eventId}/${filename}`);
      }
      
      // Try with any UUID-like segment as eventId
      const uuidPattern = /[a-f0-9-]{36}/g;
      const uuids = originalPath.match(uuidPattern) || [];
      uuids.forEach(uuid => {
        if (uuid !== this.userId) {
          paths.add(`evidence/${this.userId}/${uuid}/${filename}`);
        }
      });
    }
    
    return Array.from(paths).filter(path => path.length > 0);
  }

  /**
   * Try to download a file using multiple path variations
   */
  async resolveAndDownload(evidencePath: string): Promise<{
    data: Blob | null;
    error: any;
    resolvedPath?: string;
    attemptedPaths: string[];
  }> {
    const pathVariations = this.generatePathVariations(evidencePath);
    console.log(`🔍 Generated ${pathVariations.length} path variations for: ${evidencePath}`);
    console.log(`📋 Path variations:`, pathVariations);
    
    for (const path of pathVariations) {
      try {
        console.log(`🔄 Attempting path: ${path}`);
        
        // Verify user ownership if userId is provided
        if (this.userId && !path.includes(this.userId)) {
          console.log(`⚠️ Skipping path ${path} - doesn't contain userId ${this.userId}`);
          continue;
        }
        
        const { data, error } = await this.supabase.storage
          .from(this.bucket)
          .download(path);
        
        if (!error && data) {
          console.log(`✅ Successfully resolved path: ${path}`);
          return {
            data,
            error: null,
            resolvedPath: path,
            attemptedPaths: pathVariations,
          };
        } else if (error) {
          console.log(`❌ Path failed: ${path} - ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ Exception for path: ${path} - ${err}`);
      }
    }
    
    return {
      data: null,
      error: { message: 'File not found after trying all path variations' },
      attemptedPaths: pathVariations,
    };
  }
}
