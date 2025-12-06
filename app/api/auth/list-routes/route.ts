import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

/**
 * Diagnostic endpoint to list all available auth routes
 * GET /api/auth/list-routes
 */
export async function GET() {
  try {
    const routesDir = join(process.cwd(), 'app', 'api', 'auth');
    const entries = await readdir(routesDir, { withFileTypes: true });
    
    const routes: string[] = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        routes.push(`/api/auth/${entry.name}`);
        
        // Check for nested routes
        try {
          const nestedDir = join(routesDir, entry.name);
          const nestedEntries = await readdir(nestedDir, { withFileTypes: true });
          
          for (const nested of nestedEntries) {
            if (nested.isDirectory()) {
              routes.push(`/api/auth/${entry.name}/${nested.name}`);
            }
          }
        } catch {
          // Ignore nested directory read errors
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Available auth routes',
      routes: routes.sort(),
      count: routes.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list routes',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

