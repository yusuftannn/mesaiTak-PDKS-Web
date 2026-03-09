export type AttendanceWithLocation = {
  id: string;
  uid: string;
  userName?: string;

  date: string;
  status: string;

  checkInAt?: Date;
  checkOutAt?: Date;

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