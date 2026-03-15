import { Timestamp } from "firebase/firestore";

export type AttendanceWithLocation = {
  id: string;
  uid: string;
  userName?: string;

  date: string;
  status: string;

  checkInAt?: Timestamp;
  checkOutAt?: Timestamp;

  shiftStart?: string;
  shiftEnd?: string;

  checkInLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };

  checkOutLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
};
