import { Dispatch, SetStateAction } from "react";

export type Dispatcher<S> = Dispatch<SetStateAction<S>>;

export interface ApiResultType {
  error: boolean;
  status: number;
  statusText: string;
  data: any;
}

export interface TableKeyType {
  key: string;
  label: string;
  sort: boolean;
}


export interface ApiPayload {
  [key: string]: string | number;
}