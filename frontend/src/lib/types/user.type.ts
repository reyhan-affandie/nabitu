export interface UserType {
  _id: string;
  name: string;
  email: string;
  photo: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface UserResponseType {
  data: UserType | null;
  error: boolean;
  status: number;
  statusText: string;
}
