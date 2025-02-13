export interface InvoicesType {
  x?: boolean;
  no?: number;
  _id: string;
  moduleId?: string;
  parent?: string;
  invoiceName: string;
  invoiceNumber: string;
  invoiceDueDate: number | string;
  invoiceAmount: number;
  invoiceStatus: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface InvoicesListType {
  currentPage: number;
  data: InvoicesType | [];
  totalData: number;
  totalPages: number;
}
