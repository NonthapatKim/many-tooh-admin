import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";

// API
import apiClient from "../api/apiClient";

// Component
import DebouncedInput from "../components/debouncedinput";
import SlideBar from "../components/slidebar";
import AddProductCategoryModal from "../components/add-product-category";

// Icons
import { IoIosAdd } from "react-icons/io";
import { SearchIcon } from "../icons/icons";
import { FaInbox } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdDelete } from "react-icons/md";

// Toast
import { toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Type
import { PageProps } from "../types/props";
import { ProductCategoriesDataType } from "../types/product";

// Zod
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const updateProductCategorySchema = z.object({
    product_category_name: z
        .string()
        .min(1, { message: "กรุณากรอกชื่อประเภท" }),
})
type ProductCategoryEditFormDataType = z.infer<typeof updateProductCategorySchema>;

const columnHelper = createColumnHelper<ProductCategoriesDataType>();

const ProductCategoriesPage = ({ urlParth }: PageProps) => {

    const [globalFilter, setGlobalFilter] = useState("");

    const [productCategoriesData, setProductCategoriesData] = useState<ProductCategoriesDataType[]>([])
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
    const [addModal, setAddModal] = useState<boolean>(false);

    const [deleteModal, setDeleteModal] = useState<{ name: string | null, product_category_id: string | null }>({
        name: null,
        product_category_id: null,
    });

    const openDeleteModal = (name: string | null, product_category_id: string | null) => {
        setDeleteModal({ name, product_category_id });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ name: null, product_category_id: null });
    };

    const fetchProductCategoriesData = useCallback(async () => {
        try {
            const response = await apiClient.get(`/categories`);
            setProductCategoriesData(response.data)
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchProductCategoriesData();
    }, [fetchProductCategoriesData])

    const table = useReactTable({
        data: productCategoriesData ?? [],
        columns: [
            columnHelper.accessor("product_category_name", {
                cell: (info) => <span>{info.getValue()}</span>,
                header: "ประเภทของผลิตภัณฑ์",
            }),
        ],
        state: {
            globalFilter,
        },
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const defaultEditingValues = {
        product_category_id: "",
        product_category_name: "",
    }

    const [editingValues, setEditingValues] = useState<ProductCategoriesDataType>(defaultEditingValues)

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: editingValues,
        resolver: zodResolver(updateProductCategorySchema),
    });

    const handleRowClick = (prod_cate: ProductCategoriesDataType) => {
        setSelectedRowId(prod_cate.product_category_id);
        const newEditingValues = {
            product_category_id: prod_cate.product_category_id,
            product_category_name: prod_cate.product_category_name
        }

        setEditingValues(newEditingValues);
        reset(newEditingValues)
    }

    const onSubmit = handleSubmit(async (data: ProductCategoryEditFormDataType) => {
        try {
            const response = await apiClient.put(`/categories/${editingValues.product_category_id}`, data);

            if (response.status === 200) {
                toast.success('อัพเดทข้อมูลสำเร็จ !', {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                  transition: Bounce,
                });
        
                fetchProductCategoriesData()
            }
        } catch (error) {
            console.error("Error status:", error);
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    })

    const handleDeleteProductCate = async (product_cate_id: string) => {
        try {
            const response = await apiClient.delete(`/categories/${product_cate_id}`);

            if (response.status === 200) {
                setProductCategoriesData(prev => prev?.filter(prod_cate => prod_cate.product_category_id !== product_cate_id));

                closeDeleteModal()
                setSelectedRowId(null)
                
                toast.success('ลบข้อมูลสำเร็จ !', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
            }
        } catch (error) {
            console.error("Error status:", error);
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    }

    return (
        <>
            {addModal && (
                <AddProductCategoryModal
                    setAddModal={setAddModal}
                    refreshData={fetchProductCategoriesData}
                />
            )}

            <div className="flex min-h-screen">
                {deleteModal.name == "modal-del" && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-5 relative w-[90%] max-w-lg">
                            <h2 className="text-xl font-LINESeedSansTH_Bd mb-4">ยืนยันที่จะลบประเภทนี้ ?</h2>
                            <p className="text-gray-700">
                                คุณยืนยันที่จะลบข้อมูลนี้ ?
                            </p>
                            <div className="flex items-center justify-end mt-4">
                                <button
                                    className="bg-gray-500 text-white px-4 py-2 mr-2 rounded hover:bg-gray-600 cursor-pointer"
                                    onClick={closeDeleteModal}
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
                                    onClick={() => handleDeleteProductCate(deleteModal.product_category_id || "")}
                                >
                                    ยืนยัน
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <SlideBar urlParth={urlParth} />


                <div className="flex-1">
                    <div className="flex justify-between items-center p-5">
                        <h1 className="text-3xl font-semibold">ประเภทของผลิตภัณฑ์</h1>
                        <button
                            className="bg-orange font-semibold text-white py-2 px-3 flex items-center gap-1 rounded-md cursor-pointer"
                            onClick={() => setAddModal(true)}
                        >
                            <IoIosAdd />
                            เพิ่มประเภท
                        </button>
                    </div>

                    <div className="grid grid-cols-2 h-screen">
                        <div className="detail-1 bg-white shadow-inner overflow-y-auto">
                            <div className="mt-5 max-w-6xl mx-auto text-white fill-gray-400">
                                <div className="flex justify-between mb-2 ps-4">
                                    <div className="w-full flex items-center gap-1">
                                        <SearchIcon />
                                        <DebouncedInput
                                            value={globalFilter ?? ""}
                                            onChange={(value: string | number) => setGlobalFilter(String(value))}
                                            className="p-2 w-44 bg-transparent outline-none border-b-2 focus:w-1/3 duration-300 text-black border-gray-500"
                                            placeholder="Search all columns..."
                                        />
                                    </div>
                                </div>

                                <table className="w-full text-left mt-2 rounded-md">
                                    <thead className="bg-gray-300 text-gray-500">
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map((header) => (
                                                    <th key={header.id} className="capitalize px-3.5 py-2 w-full">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody>
                                        {table.getRowModel().rows.length ? (
                                            table.getRowModel().rows.map((row, i) => {
                                                const isSelected = selectedRowId === row.original.product_category_id;
                                                return (
                                                    <tr
                                                        key={row.id}
                                                        className={`${isSelected ? "bg-[#b5b5b5]/50 text-black" : i % 2 === 0 ? "bg-white text-black" : "bg-gray-100 text-black"} cursor-pointer`}
                                                        onClick={(e) => {
                                                            const target = e.target as HTMLElement;
                                                            if (!target.closest(".switch-control")) {
                                                                handleRowClick(row.original);
                                                            }
                                                        }}
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <td key={cell.id} className="px-3.5 py-2">
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr className="text-center text-black h-32">
                                                <td colSpan={12}>No Record Found!</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                <div className="flex items-center justify-end mt-2 gap-2 text-black mb-20">
                                    <button
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        className="p-1 border border-gray-300 px-2 disabled:opacity-30"
                                    >
                                        {"<"}
                                    </button>
                                    <button
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="p-1 border border-gray-300 px-2 disabled:opacity-30"
                                    >
                                        {">"}
                                    </button>

                                    <span className="flex items-center gap-1">
                                        <div>Page</div>
                                        <strong>
                                            {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                        </strong>
                                    </span>

                                    <select
                                        value={table.getState().pagination.pageSize}
                                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                                        className="p-2 bg-transparent"
                                    >
                                        {[10, 20, 30, 50].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                Show {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {selectedRowId ? (
                            <div className="detail-2 flex flex-col bg-white pt-10 ps-5 pe-5 shadow-inner overflow-y-auto flex-grow pb-32">
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-5">
                                        <h1 className="font-semibold text-xl">รายละเอียดประเภทของผลิตภัณฑ์</h1>
                                        <IoMdClose
                                            className="text-2xl cursor-pointer"
                                            onClick={() => {
                                                setSelectedRowId(null)
                                                setEditingValues(defaultEditingValues)
                                            }}
                                        />
                                    </div>

                                    <div className="update-form">
                                        <form onSubmit={onSubmit}>
                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    ชื่อประเภท<span className="text-red-600">*</span>
                                                </label>
                                                <Controller
                                                    name="product_category_name"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            className={`border ${errors.product_category_name ? "border-red-500" : "border-slate-400"} p-2 w-full rounded-md`}
                                                            placeholder="ชื่อประเภท"
                                                            value={field.value || ""}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                                {errors.product_category_name && (
                                                    <div className="text-red-500 text-sm mt-2">
                                                        {errors.product_category_name.message}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 items-center mb-5">
                                                <button
                                                    type="submit"
                                                    className="bg-blue-600 text-white py-1 px-3 rounded-md cursor-pointer"
                                                >
                                                    อัพเดท
                                                </button>

                                                <button
                                                    type="button"
                                                    className="bg-red-200 text-red-700 py-1 px-3 flex items-center gap-1 rounded-md cursor-pointer"
                                                    onClick={() => openDeleteModal("modal-del", `${editingValues.product_category_id}`)}
                                                >
                                                    <MdDelete />
                                                    ลบข้อมูลนี้
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center items-center h-full text-gray-500 bg-gray-100 space-y-4 opacity-50">
                                <FaInbox className="text-7xl" />
                                <p className="text-sm">ไม่มีข้อมูลให้แสดง ณ ขณะนี้</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductCategoriesPage;