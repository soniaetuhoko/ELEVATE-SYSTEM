declare global {
  var tempUsers: Record<string, {
    name: string;
    otp: string;
    timestamp: number;
  }> | undefined;
}

export {};