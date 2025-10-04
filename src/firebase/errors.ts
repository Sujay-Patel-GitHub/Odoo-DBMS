export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  constructor(context: SecurityRuleContext) {
    const stringifiedContext = JSON.stringify(
      context,
      (key, value) => {
        if (key === 'token') {
          return '[REDACTED]';
        }
        return value;
      },
      2
    );

    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${stringifiedContext}`;

    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is to make the error message more readable in the console.
    if (typeof console !== 'undefined') {
      console.error(message);
    }
  }
}
