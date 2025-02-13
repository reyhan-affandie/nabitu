"use client";

import { useCallback, useEffect, useState } from "react";
import { getOne, getSubList } from "@/actions/actions";
import { getAuthUser } from "@/actions/auth.actions";
import { InvoicesType } from "@/lib/types/invoices.type";
import { NOTFOUND_RESPONSE } from "@/constants/constants";
import Loader from "@/components/common/Loader";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Menu, Pencil, Trash } from "lucide-react";
import CustomPageTitle from "@/components/Customs/CustomPageTitle";
import CustomInput from "@/components/Customs/CustomInput";
import { useRouter } from "next/navigation";
import { toast, Bounce } from "react-toastify";
import { deleteService } from "@/api/services";
import * as Dialog from "@radix-ui/react-dialog";

const moduleName = "invoices";
export default function InvoicesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshTableData, setRefreshTableData] = useState(false);
  const [data, setData] = useState<InvoicesType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalData, setTotalData] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rowPerPage, setRowPerPage] = useState<number>(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("invoiceDueDate");
  const [sortOrder, setSortOrder] = useState(-1);
  const [trap, setTrap] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoicesType | null>(null);

  const fetchData = useCallback(async () => {
    try {
      await getAuthUser().then((res) => {
        if (res) {
          getSubList(moduleName, "parent", res?.data?._id, currentPage, rowPerPage, search, sortBy, sortOrder).then((resx) => {
            if (resx?.data?.totalData > 0) {
              const resData = [...resx?.data?.data];
              const resDataTable = [];
              for (const index in resData) {
                resDataTable.push({
                  x: false,
                  no: (currentPage - 1) * 10 + (parseInt(index) + 1),
                  _id: resData[index]._id,
                  invoiceName: resData[index].invoiceName,
                  invoiceNumber: resData[index].invoiceNumber,
                  invoiceDueDate: new Date(parseInt(resData[index].invoiceDueDate)).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }),
                  invoiceAmount: resData[index].invoiceAmount,
                  invoiceStatus: resData[index].invoiceStatus,
                });
              }
              setData(resDataTable);
              setCurrentPage(resx?.data?.currentPage);
              setTotalData(resx?.data?.totalData);
              setTotalPages(resx?.data?.totalPages);
              setLoading(false);
              setRefreshTableData(false);
            } else {
              setData([]);
              setTotalData(0);
              setTotalPages(1);
              setLoading(false);
              setRefreshTableData(false);
            }
          });
        } else {
          const err = NOTFOUND_RESPONSE;
          setData([]);
          setTotalData(0);
          setTotalPages(1);
          setLoading(false);
          setRefreshTableData(false);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }, [search, sortBy, sortOrder, currentPage, rowPerPage]);

  const reloadData = async () => {
    const currentSearch = Date.now();
    if (currentSearch < trap + 500) {
      return true;
    }
    setTrap(currentSearch);
    setRefreshTableData(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (refreshTableData === true) {
      fetchData();
    }
  }, [refreshTableData, search, sortBy, sortOrder, currentPage, rowPerPage]);

  useEffect(() => {
    if (loading === true && data?.length > 0) {
      setLoading(false);
    }
  }, [loading, data]);

  useEffect(() => {
    if (refreshTableData === true) {
      fetchData();
    }
  }, [refreshTableData, search, sortBy, sortOrder, currentPage, rowPerPage]);

  const openModal = (invoice: InvoicesType) => {
    setSelectedInvoice(invoice);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedInvoice(null);
  };

  const handleDelete = async () => {
    if (selectedInvoice) {
      await deleteService(moduleName, selectedInvoice._id);
      toast.error(`Invoice (${selectedInvoice.invoiceNumber}) successfully deleted`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
      setRefreshTableData(true);
      closeModal();
    }
  };
  return (
    <DefaultLayout>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between space-x-3">
            <div className="flex flex-1">
              <CustomPageTitle pageName="My Invoices" />
            </div>
            <div className="flex items-center justify-between space-x-3">
              <CustomInput
                type="text"
                id="search"
                placeHolder="Search"
                onChange={(e) => {
                  setSearch(e.target.value);
                  setRefreshTableData(true);
                }}
              />

              <CustomInput
                type="select"
                id="statusFilter"
                placeHolder="Filter Status"
                options={[
                  { label: "All Status", value: "" },
                  { label: "Paid", value: "Paid" },
                  { label: "Unpaid", value: "Unpaid" },
                  { label: "Pending", value: "Pending" },
                ]}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setRefreshTableData(true);
                }}
              />

              <button className="h-12 rounded bg-primary px-4 font-medium text-white hover:bg-opacity-90" onClick={() => router.push("/invoices/create")}>
                + Create Invoice
              </button>
            </div>
          </div>
          <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      <div
                        className={"flex cursor-pointer flex-row " + (sortBy === "invoiceName" ? "text-yellow-400" : "text-sky-400")}
                        onClick={() => {
                          setSortBy("invoiceName");
                          setSortOrder(sortOrder === 1 ? -1 : 1);
                          reloadData();
                        }}
                      >
                        <div>Invoice</div>
                        <div className="flex flex-1 pl-2">
                          {sortBy === "invoiceName" ? sortOrder === 1 ? <ArrowUp /> : <ArrowDown /> : <ArrowUpDown size={16} />}
                        </div>
                      </div>
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      <div
                        className={"flex cursor-pointer flex-row " + (sortBy === "invoiceDueDate" ? "text-yellow-400" : "text-sky-400")}
                        onClick={() => {
                          setSortBy("invoiceDueDate");
                          setSortOrder(sortOrder === 1 ? -1 : 1);
                          reloadData();
                        }}
                      >
                        <div>Due Date</div>
                        <div className="flex flex-1 pl-2">
                          {sortBy === "invoiceDueDate" ? sortOrder === 1 ? <ArrowUp /> : <ArrowDown /> : <ArrowUpDown size={16} />}
                        </div>
                      </div>
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      <div
                        className={"flex cursor-pointer flex-row " + (sortBy === "invoiceAmount" ? "text-yellow-400" : "text-sky-400")}
                        onClick={() => {
                          setSortBy("invoiceAmount");
                          setSortOrder(sortOrder === 1 ? -1 : 1);
                          reloadData();
                        }}
                      >
                        <div>Amount</div>
                        <div className="flex flex-1 pl-2">
                          {sortBy === "invoiceAmount" ? sortOrder === 1 ? <ArrowUp /> : <ArrowDown /> : <ArrowUpDown size={16} />}
                        </div>
                      </div>
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">Status</th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((invoice, key) => (
                    <tr key={key}>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">{invoice.invoiceName}</h5>
                        <p className="text-sm">{invoice.invoiceNumber}</p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">{invoice.invoiceDueDate}</p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">Rp {Intl.NumberFormat("id-ID").format(invoice.invoiceAmount)}</p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p
                          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                            invoice.invoiceStatus === "Paid"
                              ? "bg-success text-success"
                              : invoice.invoiceStatus === "Unpaid"
                                ? "bg-danger text-danger"
                                : "bg-warning text-warning"
                          }`}
                        >
                          {invoice.invoiceStatus}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex items-center space-x-2">
                          <Pencil className="cursor-pointer text-sky-400" onClick={() => router.push(`/invoices/${invoice._id}`)} />
                          <Trash className="cursor-pointer text-red-400" onClick={() => openModal(invoice)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-2 flex flex-1 items-center justify-between">
            <div className="rounded bg-gray-400 p-4 text-white">
              <span className="font-bold first-letter:uppercase">
                {totalData.toLocaleString()} data found<span className="max-lg:hidden"></span>
              </span>
            </div>
            <div className="flex flex-row">
              <button
                className={currentPage <= 1 ? "bg-gray-400 font-bold text-white" : "bg-primary font-bold text-white"}
                onClick={() => {
                  setCurrentPage(currentPage - 1);
                  reloadData();
                }}
                disabled={currentPage <= 1}
              >
                <ChevronLeft />
              </button>
              <CustomInput
                type="select"
                id="pagination"
                placeHolder={`Page ${currentPage}`}
                options={Array.from({ length: totalPages }, (_, i) => ({ label: `Page ${i + 1}`, value: i + 1 }))}
                onChange={(e) => {
                  setCurrentPage(Number(e.target.value));
                  reloadData();
                }}
              />
              <button
                className={currentPage >= totalPages ? "bg-gray-400 font-bold text-white" : "bg-primary font-bold text-white"}
                onClick={() => {
                  setCurrentPage(currentPage + 1);
                  reloadData();
                }}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
          <Dialog.Root open={modalIsOpen} onOpenChange={setModalIsOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
              <Dialog.Content className="fixed left-1/2 top-1/2 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
                <Dialog.Title className="text-lg font-semibold text-gray-900">Are you sure you want to delete this invoice?</Dialog.Title>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{selectedInvoice?.invoiceName}</span>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{selectedInvoice?.invoiceNumber}</span>
                </p>
                <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={handleDelete} className="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-all hover:bg-red-700">
                    Yes
                  </button>
                  <Dialog.Close asChild>
                    <button className="rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-800 transition-all hover:bg-gray-300">Cancel</button>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </>
      )}
    </DefaultLayout>
  );
}
