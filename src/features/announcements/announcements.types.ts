export type Announcement = {
  id: string;
  title: string;
  message: string;
  createdByUid: string | null;
  createdByName: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type AnnouncementDoc = {
  title: string;
  message: string;
  createdByUid: string | null;
  createdByName: string | null;
  createdAt?: {
    toDate: () => Date;
  };
  updatedAt?: {
    toDate: () => Date;
  };
};

export type CreateAnnouncementParams = {
  title: string;
  message: string;
  createdByUid: string | null;
  createdByName: string | null;
};

export type UpdateAnnouncementParams = {
  title: string;
  message: string;
};
