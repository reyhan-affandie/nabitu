"use client";

import CustomInput from "@/components/Customs/CustomInput";
//import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CustomPageTitle from "@/components/Customs/CustomPageTitle";
import CustomDatePicker from "@/components/Customs/CustomDatePicker";
import { useActionState, useState } from "react";
import { defaultInvoiceState } from "@/constants/constants";
import { invoiceAction } from "@/actions/invoiceAction";
import { ErrorsHandling, ErrorsZod } from "@/components/Customs/ErrorsZod";

/*export const metadata: Metadata = {
  title: "Invoice Hub | Add Invoice",
  description: "Add new invoice",
};*/

const Add = () => {
  const [formState, formAction] = useActionState(invoiceAction, defaultInvoiceState);
  const [amount, setAmount] = useState("");

  const formatNumber = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue ? new Intl.NumberFormat("id-ID").format(parseInt(numericValue)) : "";
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = formatNumber(e.target.value); // Remove non-numeric characters and format number
    setAmount(numericValue);
  };

  return (
    <DefaultLayout>
      <form action={formAction} className="mx-auto w-full">
        <CustomPageTitle pageName="Add Invoice" />

        <div className="grid-cols grid gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">Invoice Form</h3>
              </div>
              <div className="p-7">
                <form action="#">
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="invoiceName">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <CustomInput type="text" id="invoiceName" placeHolder="Enter your invoice name" />
                      <ErrorsZod error={formState?.zodErrors?.invoiceName} />
                    </div>
                    <div className="w-full sm:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="invoiceNumber">
                        Number <span className="text-red-500">*</span>
                      </label>
                      <CustomInput type="text" id="invoiceNumber" placeHolder="Enter your invoice number" defaultValue={`INV-${Date.now()}`} />
                      <ErrorsZod error={formState?.zodErrors?.invoiceNumber} />
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="invoiceDueDate">
                        Due Date <span className="text-red-500">*</span>
                      </label>
                      <CustomDatePicker id="invoiceDueDate" placeHolder="DD/MM/YYYY" />
                      <ErrorsZod error={formState?.zodErrors?.invoiceDueDate} />
                    </div>
                    <div className="w-full sm:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="invoiceAmount">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <CustomInput
                        type="text"
                        id="invoiceAmount"
                        placeHolder="Enter your invoice amount"
                        prefix="Rp"
                        value={amount}
                        onChange={handleAmountChange}
                      />
                      <ErrorsZod error={formState?.zodErrors?.invoiceAmount} />
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="invoiceStatus">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <CustomInput
                        type="select"
                        id="invoiceStatus"
                        placeHolder="Choose the status"
                        options={[
                          { label: "Paid", value: "1" },
                          { label: "Unpaid", value: "2" },
                          { label: "Pending", value: "3" },
                        ]}
                      />
                      <ErrorsZod error={formState?.zodErrors?.invoiceStatus} />
                    </div>
                    <div className="w-full sm:w-1/2" />
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button className="flex justify-center rounded bg-primary px-16 py-2 font-medium text-gray hover:bg-opacity-90" type="submit">
                      + Add Invoice
                    </button>
                  </div>
                  <ErrorsHandling error={formState?.message || formState?.data} />
                </form>
              </div>
            </div>
          </div>
        </div>
      </form>
    </DefaultLayout>
  );
};

export default Add;
