import * as admin from 'firebase-admin';

export class FirebaseProvider {
  private app: admin.app.App;

  constructor(config: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
    clientId: number;
  }) {
    const { projectId, clientEmail, privateKey, clientId } = config;

    const appName = `firebase-${clientId}`;

    let existingApp: admin.app.App | undefined;

    try {
      existingApp = admin.app(appName);
    } catch (e) {
      existingApp = undefined;
    }

    if (existingApp) {
      this.app = existingApp;
    } else {
      this.app = admin.initializeApp(
        {
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        },
        appName
      );
    }
  }

  async verifyIdToken(token: string) {
    return this.app.auth().verifyIdToken(token);
  }
}