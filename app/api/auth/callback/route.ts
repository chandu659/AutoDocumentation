import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

// Path to the credentials file
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
// Path to store the token
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json(
      { error: 'No authorization code provided' },
      { status: 400 }
    );
  }
  
  try {
    // Read credentials file
    const credentialsContent = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    const credentials = JSON.parse(credentialsContent);
    
    // Set up OAuth2 client
    const { client_secret, client_id } = credentials.web || credentials.installed || {};
    
    if (!client_id || !client_secret) {
      throw new Error('Invalid credentials file format. Missing client_id or client_secret.');
    }
    
    // Use a consistent redirect URI that matches what's registered in Google Cloud Console
    const redirectUri = 'http://localhost:3000/api/auth/callback';
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);
    
    // Exchange the code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    // Store the tokens for future use
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('Token stored to:', TOKEN_PATH);
    
    // Redirect back to the main application
    return NextResponse.redirect(new URL('/', request.nextUrl.origin));
  } catch (error: any) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.json(
      { error: `Authentication failed: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
