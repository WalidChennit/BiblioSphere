import { Role } from '@prisma/client';

export type NotificationCreateInput = {
  type: string;
  title: string;
  message: string;
  href?: string | null;
  dedupeKey: string;
};

export type NotificationRecipient =
  | { kind: 'user'; userId: number }
  | { kind: 'role'; role: Role };
