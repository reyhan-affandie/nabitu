"use client";

import CustomInput from "@/components/Customs/CustomInput";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CustomPageTitle from "@/components/Customs/CustomPageTitle";
import CustomDatePicker from "@/components/Customs/CustomDatePicker";
import { useActionState, useEffect, useState } from "react";
import { defaultInvoiceState } from "@/constants/constants";
import { invoiceAction } from "@/actions/invoiceAction";
import { ErrorsHandling, ErrorsZod } from "@/components/Customs/ErrorsZod";
import { useParams, useRouter } from "next/navigation";
import { getOne } from "@/actions/actions";
import Loader from "@/components/common/Loader";
import { DefaultStateType } from "@/lib/types/defaultState.type";
import { toast } from "react-toastify";

const isValidMongoId = (id: string) => /^[a-f\d]{24}$/i.test(id);

const Upsert = () => {
  const { id } = useParams();
  const moduleName = "invoices";
  const router = useRouter();
  const [data, setData] = useState<DefaultStateType | null>(null);
  const [formState, formAction] = useActionState(invoiceAction, data || defaultInvoiceState);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    await getOne(moduleName, String(id)).then((res) => {
      if (res.error === false) {
        const defaultState = {
          data: {
            formMethod: "update",
            moduleName: moduleName,
            moduleId: res?.data?._id,
            invoiceName: res?.data?.invoiceName || "",
            invoiceNumber: res?.data?.invoiceNumber || `INV-${Date.now()}`,
            invoiceDueDate: new Date(parseInt(res?.data?.invoiceDueDate) || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
            invoiceAmount: parseInt(res?.data?.invoiceAmount) || 0,
            invoiceStatus: res?.data?.invoiceStatus || "Unpaid",
          },
          zodErrors: null,
          error: null,
          message: null,
        };
        console.log(defaultState);
        setData(defaultState);
        setLoading(false);
      } else {
        setLoading(false);
        router.push("/invoices/create");
      }
    });
  };

  useEffect(() => {
    if (id !== "create" && isValidMongoId(String(id))) {
      setLoading(true);
      fetchData();
    } else {
      router.push("/invoices/create");
    }
  }, [id]);

  useEffect(() => {
    if (formState?.error === false) {
      if (data?.data?.formMethod === "update") {
        toast.info("Invoice successfuly Updated", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        toast.success("Invoice successfuly Created", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }

      router.push("/invoices");
    }
  }, [formState]);

  return (
    <DefaultLayout>
      {loading ? (
        <Loader />
      ) : (
        <form action={formAction} className="mx-auto w-full">
          <CustomPageTitle pageName="Add Invoice" />

          <div className="grid-cols grid gap-8">
            <div className="col-span-5 xl:col-span-3">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">Invoice Form</h3>
                </div>
                <div className="p-7">
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="invoiceName">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <CustomInput type="text" id="invoiceName" placeHolder="Enter your invoice name" defaultValue={data?.data?.invoiceName} />
                      <ErrorsZod error={formState?.zodErrors?.invoiceName} />
                    </div>
                    <div className="w-full sm:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="invoiceNumber">
                        Number <span className="text-red-500">*</span>
                      </label>
                      <CustomInput
                        type="text"
                        id="invoiceNumber"
                        placeHolder="Enter your invoice number"
                        defaultValue={data?.data?.invoiceNumber || `INV-${Date.now()}`}
                      />
                      <ErrorsZod error={formState?.zodErrors?.invoiceNumber} />
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="invoiceDueDate">
                        Due Date <span className="text-red-500">*</span>
                      </label>
                      <CustomDatePicker id="invoiceDueDate" placeHolder="DD/MM/YYYY" defaultValue={data?.data?.invoiceDueDate} />
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
                        defaultValue={data?.data?.invoiceAmount}
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
                          { label: "Paid", value: "Paid" },
                          { label: "Unpaid", value: "Unpaid" },
                          { label: "Pending", value: "Pending" },
                        ]}
                        defaultValue={data?.data?.invoiceStatus}
                      />
                      <ErrorsZod error={formState?.zodErrors?.invoiceStatus} />
                    </div>
                    <input id="formMethod" name="formMethod" type="hidden" defaultValue={data?.data?.formMethod || "create"} />
                    <input id="moduleId" name="moduleId" type="hidden" defaultValue={data?.data?.moduleId} />
                    <input id="moduleName" name="moduleName" type="hidden" defaultValue={moduleName} />
                    <div className="w-full sm:w-1/2" />
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button className="flex justify-center rounded bg-primary px-16 py-2 font-medium text-gray hover:bg-opacity-90" type="submit">
                      {id === "create" ? "+ Add Invoice" : "+ Edit Invoice"}
                    </button>
                  </div>
                  <ErrorsHandling error={formState?.message} />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </DefaultLayout>
  );
};

export default Upsert;
