export type AttendanceWithLocation = {
  id: string;
  uid: string;
  userName?: string;

  companyId: string;

  date: string;
  status: string;

  checkInAt?: Date; 
  checkOutAt?: Date;

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

export type AttendanceDoc = {
  uid: string;
  companyId: string;

  date: string;
  status: string;

  checkInAt?: { toDate: () => Date };
  checkOutAt?: { toDate: () => Date };

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