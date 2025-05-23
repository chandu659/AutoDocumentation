import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/documents'];

// Path to the credentials file
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
// Path to the token file
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

/**
 * Creates a new Google Doc with the given title and content
 * @param {string} title The title of the document
 * @param {string} content The content to add to the document
 * @param {object} metadata Optional metadata to include in the document
 * @returns {Promise<string>} The URL of the created document
 */
export async function createGoogleDoc(title: string, content: string, metadata?: any): Promise<string> {
  try {
    // Check if token exists
    if (!fs.existsSync(TOKEN_PATH)) {
      throw new Error('No authentication token found. Please authenticate with Google first.');
    }

    // Read credentials file
    const credentialsContent = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    const credentials = JSON.parse(credentialsContent);
    
    // Set up OAuth2 client
    const { client_secret, client_id } = credentials.web || credentials.installed || {};
    
    if (!client_id || !client_secret) {
      throw new Error('Invalid credentials file format. Missing client_id or client_secret.');
    }
    
    // Read token
    const tokenContent = fs.readFileSync(TOKEN_PATH, 'utf8');
    const token = JSON.parse(tokenContent);
    
    // Set up OAuth2 client with token
    const redirectUri = 'http://localhost:3000/api/auth/callback';
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);
    oAuth2Client.setCredentials(token);
    
    // Create a new document using the Google Docs API
    console.log('Creating real Google Doc with title:', title);
    
    // Initialize the Docs API
    const docs = google.docs({ version: 'v1', auth: oAuth2Client });
    
    // Create a new document
    const createResponse = await docs.documents.create({
      requestBody: {
        title: title,
      },
    });
    
    if (!createResponse.data.documentId) {
      throw new Error('Failed to create Google Doc: No document ID returned');
    }
    
    const documentId = createResponse.data.documentId;
    console.log('Created document with ID:', documentId);
    
    // Prepare metadata text if provided
    let documentContent = content;
    
    if (metadata) {
      const metadataText = `Metadata:\n` +
        `Source: ${metadata.source || 'Unknown'}\n` +
        `Date: ${metadata.date || new Date().toLocaleString()}\n` +
        `Model: ${metadata.model || 'Unknown'}\n` +
        `Language: ${metadata.language || 'auto-detected'}\n\n` +
        `Transcription:\n\n`;
      
      documentContent = metadataText + content;
    }
    
    // Insert content into the document
    await docs.documents.batchUpdate({
      documentId: documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: documentContent,
            },
          },
        ],
      },
    });
    
    console.log('Content inserted into document');
    
    // Return the URL to the document
    const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    console.log('Document URL:', docUrl);
    
    return docUrl;
  } catch (error: any) {
    console.error('Error in createGoogleDoc:', error);
    throw new Error(`Failed to create Google Doc: ${error.message || 'Unknown error'}`);
  }
}
