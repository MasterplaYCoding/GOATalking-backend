export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  email: string;
  passwordHash: string;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  twoFactorCode: string | null;
  twoFactorExpiry: Date | null;
}

export type UserVotes = {
  [pollId: string]: {
    [userId: string]: string;
  };
};