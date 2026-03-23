import { BookingStatus, SessionType } from '../enums';

export interface Booking {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  sessionType: SessionType;
  preferredDate: string;
  alternateDate?: string;
  location?: string;
  message?: string;
  status: BookingStatus;
  adminNotes?: string;
  quotedPrice?: number;
  confirmedDate?: string;
  createdAt: string;
  updatedAt: string;
}
