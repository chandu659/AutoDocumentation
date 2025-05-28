import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

// Path to the credentials file
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// Scopes for Google Docs API
const SCOPES = ['https://www.googleapis.com/auth/documents'];

export async function GET() {
  try {
    // Read credentials file
    const credentialsContent = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    const credentials = JSON.parse(credentialsContent);
    
    // Set up OAuth2 client
    const { client_secret, client_id } = credentials.web || credentials.installed || {};
    
    if (!client_id || !client_secret) {
      return NextResponse.json(
        { error: 'Invalid credentials file format. Missing client_id or client_secret.' },
        { status: 500 }
      );
    }
    
    // Use a consistent redirect URI that matches what's registered in Google Cloud Console
    const redirectUri = 'http://localhost:3000/api/auth/callback';
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);
    
    // Generate the authorization URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', 
    });
    
    // Redirect the user to the Google OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error initiating Google OAuth:', error);
    return NextResponse.json(
      { error: `Failed to initiate Google OAuth: ${errorMessage}` },
      { status: 500 }
    );
  }
}
