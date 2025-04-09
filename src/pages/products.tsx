import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { PageProps } from "../types/props";

const NoImage = "/no-image.png";

// API
import apiClient from "../api/apiClient";

// Component
import AddProductModal from "../components/add-product";
import DebouncedInput from "../components/debouncedinput";
import SlideBar from "../components/slidebar";

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
import { BrandDataType } from "../types/brand";
import {
    ProductDataType,
    ProductCategoriesDataType,
    ProductTypeData,
    ProductEditDataType
} from "../types/product";


// Zod
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const updateProductSchema = z.object({
    brand_id: z
        .string()
        .min(1, { message: "กรุณาเลือกแบรนด์ของผลิตภัณฑ์" }),
    product_category_id: z
        .string()
        .min(1, { message: "กรุณาเลือกหมวดหมู่ของผลิตภัณฑ์" }),
    product_type_id: z
        .string()
        .min(1, { message: "กรุณาเลือกประเภทของหมวดหมู่ผลิตภัณฑ์" }),
    product_name: z
        .string()
        .min(1, { message: "กรุณากรอกชื่อของผลิตภัณฑ์" }),
    barcode: z
        .string()
        .min(1, { message: "กรุณากรอกเลขบาร์โค้ด (Barcode)" }),
    warning: z.string().nullable(),
    usage_description: z.string().nullable(),
    amount_fluoride: z.string().nullable(),
    properties: z.string().nullable(),
    active_ingredient: z.string().nullable(),
    dangerous_ingredient: z.string().nullable(),
    is_dangerous: z
        .string()
        .min(1, { message: "กรุณาเลือก" }),
    product_image: z.instanceof(File).nullable().refine((file) => {
        if (!file) return true;
        return file.size <= 5 * 1024 * 1024;
    }, { message: "ขนาดไฟล์ต้องไม่เกิน 5MB" }),
})
type ProductEditFormDataType = z.infer<typeof updateProductSchema>;

const columnHelper = createColumnHelper<ProductDataType>();

const ProductsPage = ({ urlParth }: PageProps) => {

    const [globalFilter, setGlobalFilter] = useState("");

    const [brandData, setBrandData] = useState<BrandDataType[]>([])
    const [productCategoriesData, setProductCategoriesData] = useState<ProductCategoriesDataType[]>([])
    const [productTypeData, setProductTypeData] = useState<ProductTypeData[]>([])
    const [productData, setProductData] = useState<ProductDataType[]>();

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".webp"],
        },
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setSelectedImage(acceptedFiles[0]);
            }
        },
    });

    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

    const [addModal, setAddModal] = useState<boolean>(false);

    const [deleteModal, setDeleteModal] = useState<{ name: string | null, product_id: string | null }>({
        name: null,
        product_id: null,
    });

    const openDeleteModal = (name: string | null, product_id: string | null) => {
        setDeleteModal({ name, product_id });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ name: null, product_id: null });
    };

    const fetchBrandData = useCallback(async () => {
        try {
            const response = await apiClient.get(`/brands`);
            setBrandData(response.data)
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchProductCategoriesData = useCallback(async () => {
        try {
            const response = await apiClient.get(`/categories`);
            setProductCategoriesData(response.data)
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchProductTypeData = useCallback(async () => {
        try {
            const response = await apiClient.get(`/types`);
            setProductTypeData(response.data)
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchProductData = useCallback(async () => {
        try {
            const response = await apiClient.get(`/products`);

            if (response?.data && Array.isArray(response.data)) {
                setProductData(response.data);
            } else {
                setProductData([])
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchBrandData();
        fetchProductCategoriesData();
        fetchProductTypeData();
        fetchProductData();
    }, [fetchBrandData, fetchProductCategoriesData, fetchProductData, fetchProductTypeData])

    const table = useReactTable({
        data: productData ?? [],
        columns: [
            columnHelper.accessor("product_image_url", {
                cell: (info) => (
                    <img
                        src={info?.getValue() ? info?.getValue() : NoImage}
                        alt="..."
                        className="w-40 h-40 object-cover"
                    />
                ),
                header: "รูปผลิตภัณฑ์",
            }),

            columnHelper.accessor("product_name", {
                cell: (info) => <span>{info.getValue()}</span>,
                header: "ชื่อผลิตภัณฑ์",
            }),

            columnHelper.accessor("product_category_name", {
                cell: (info) => <span>{info.getValue()}</span>,
                header: "หมวดหมู่",
            }),

            columnHelper.accessor("product_type_name", {
                cell: (info) => <span>{info.getValue()}</span>,
                header: "ประเภท",
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
        product_id: "",
        brand_id: "",
        product_category_id: "",
        product_type_id: "",
        product_image_url: null,
        product_name: "",
        barcode: "",
        warning: "",
        usage_description: "",
        amount_fluoride: "",
        properties: "",
        active_ingredient: "",
        dangerous_ingredient: "",
        is_dangerous: "",
        product_image: null,
    }

    const [editingValues, setEditingValues] = useState<ProductEditDataType>(defaultEditingValues)

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: editingValues,
        resolver: zodResolver(updateProductSchema),
    });

    const handleRowClick = (product: ProductDataType) => {
        setSelectedRowId(product.product_id);
        const newEditingValues = {
            product_id: product.product_id,
            brand_id: product.brand_id,
            product_category_id: product.product_category_id,
            product_type_id: product.product_type_id,
            product_image_url: product.product_image_url || "",
            product_name: product.product_name,
            barcode: product.barcode,
            warning: product.warning || "",
            usage_description: product.usage_description || "",
            amount_fluoride: product.amount_fluoride || "",
            properties: product.properties || "",
            active_ingredient: product.active_ingredient || "",
            dangerous_ingredient: product.dangerous_ingredient || "",
            is_dangerous: product.is_dangerous ? "true" : "false",
            product_image: null,
        };

        setEditingValues(newEditingValues);
        reset(newEditingValues);
    };

    const onSubmit = handleSubmit(async (data: ProductEditFormDataType) => {
        const updatedData = {
            ...data,
            product_image_url: editingValues.product_image_url,
        };

        try {
            const formData = new FormData();

            Object.entries(updatedData).forEach(([key, value]) => {
                if (key === "product_image" && value) {
                    formData.append(key, value as File);
                } else {
                    formData.append(key, value as string);
                }
            });

            // formData.forEach((value, key) => {
            //     console.log(`🔹 ${key}:`, value);
            // });

            const response = await apiClient.patch(`/products/${editingValues.product_id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

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

                setAddModal(false)
                fetchProductData()
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

    const handleDeleteProduct = async (product_id: string) => {
        try {
            const response = await apiClient.delete(`/products/${product_id}`);

            if (response.status === 200) {
                setProductData(prev => prev?.filter(prod => prod.product_id !== product_id));

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
            console.error("Error delete schedule:", error);
            toast.error('เกิดข้อผิดพลาดจากระบบ กรุณาลองใหม่อีกครั้ง', {
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
    }

    return (
        <>
            {addModal && (
                <AddProductModal
                    setAddModal={setAddModal}
                    refreshData={fetchProductData}
                />
            )}

            <div className="flex min-h-screen">
                {deleteModal.name == "modal-del" && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-5 relative w-[90%] max-w-lg">
                            <h2 className="text-xl font-LINESeedSansTH_Bd mb-4">ยืนยันที่จะลบผลิตภัณฑ์นี้ ?</h2>
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
                                    onClick={() => handleDeleteProduct(deleteModal.product_id || "")}
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
                        <h1 className="text-3xl font-semibold">ผลิตภัณฑ์</h1>
                        <button
                            className="bg-orange font-semibold text-white py-2 px-3 flex items-center gap-1 rounded-md cursor-pointer"
                            onClick={() => setAddModal(true)}
                        >
                            <IoIosAdd />
                            เพิ่มผลิตภัณฑ์
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
                                                const isSelected = selectedRowId === row.original.product_id;
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
                                        <h1 className="font-semibold text-xl">รายละเอียดผลิตภัณฑ์</h1>
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
                                                    แบรนด์ของผลิตภัณฑ์<span className="text-red-600">*</span>
                                                </label>
                                                <Controller
                                                    name="brand_id"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <select
                                                            {...field}
                                                            className={`border p-2 w-full rounded-md ${errors.brand_id ? "border-red-500" : "border-slate-400"}`}
                                                            onChange={(event) => {
                                                                field.onChange(event);
                                                            }}
                                                            value={field.value || ""}
                                                        >
                                                            <option value="">เลือกแบรนด์ของผลิตภัณฑ์</option>
                                                            {brandData.map((type) => (
                                                                <option key={type.brand_id} value={type.brand_id}>
                                                                    {type.brand_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                />
                                                {errors.brand_id && (
                                                    <div className="text-red-500 text-sm mt-2">
                                                        {errors.brand_id.message}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    หมวดหมู่ของผลิตภัณฑ์<span className="text-red-600">*</span>
                                                </label>
                                                <Controller
                                                    name="product_category_id"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <select
                                                            {...field}
                                                            className={`border p-2 w-full rounded-md ${errors.brand_id ? "border-red-500" : "border-slate-400"}`}
                                                            onChange={(event) => {
                                                                field.onChange(event);
                                                            }}
                                                            value={field.value || ""}
                                                        >
                                                            <option value="">หมวดหมู่ของผลิตภัณฑ์</option>
                                                            {productCategoriesData.map((type) => (
                                                                <option key={type.product_category_id} value={type.product_category_id}>
                                                                    {type.product_category_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                />
                                                {errors.product_category_id && (
                                                    <div className="text-red-500 text-sm mt-2">
                                                        {errors.product_category_id.message}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    ประเภทของหมวดหมู่ผลิตภัณฑ์<span className="text-red-600">*</span>
                                                </label>
                                                <Controller
                                                    name="product_type_id"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <select
                                                            {...field}
                                                            className={`border p-2 w-full rounded-md ${errors.brand_id ? "border-red-500" : "border-slate-400"}`}
                                                            onChange={(event) => {
                                                                field.onChange(event);
                                                            }}
                                                            value={field.value || ""}
                                                        >
                                                            <option value="">ประเภทของหมวดหมู่ผลิตภัณฑ์</option>
                                                            {productTypeData.map((type) => (
                                                                <option key={type.product_type_id} value={type.product_type_id}>
                                                                    {type.product_type_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                />
                                                {errors.product_type_id && (
                                                    <div className="text-red-500 text-sm mt-2">
                                                        {errors.product_type_id.message}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    ชื่อผลิตภัณฑ์<span className="text-red-600">*</span>
                                                </label>
                                                <Controller
                                                    name="product_name"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <textarea
                                                            {...field}
                                                            className={`border ${errors.product_name ? "border-red-500" : "border-slate-400"} p-2 w-full rounded-md`}
                                                            placeholder="ชื่อผลิตภัณฑ์"
                                                            rows={4}
                                                            value={field.value || ""}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                                {errors.product_name && (
                                                    <div className="text-red-500 text-sm mt-2">
                                                        {errors.product_name.message}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    รูปภาพผลิตภัณฑ์<span className="text-red-600">*</span>
                                                </label>

                                                <img
                                                    src={editingValues.product_image_url || NoImage}
                                                    className="w-48 h-48 mx-auto object-contain"
                                                    alt="product-image"
                                                />
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <Controller
                                                    name="product_image"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div
                                                            {...getRootProps()}
                                                            className="border-2 border-dashed border-gray-400 p-6 flex flex-col items-center justify-center cursor-pointer rounded-md hover:border-blue-500 transition"
                                                        >
                                                            <input
                                                                {...getInputProps()}
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    setSelectedImage(file || null);
                                                                    field.onChange(file);
                                                                }}
                                                            />

                                                            {selectedImage ? (
                                                                <img
                                                                    src={URL.createObjectURL(selectedImage)}
                                                                    alt="Preview"
                                                                    className="w-32 h-32 object-cover mt-3 rounded-md"
                                                                />
                                                            ) : (
                                                                <p className="text-gray-500 text-sm">ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือก</p>
                                                            )}
                                                        </div>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    เลขบาร์โค้ด (Barcode)<span className="text-red-600">*</span>
                                                </label>
                                                <Controller
                                                    name="barcode"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            className={`border p-2 w-full rounded-md ${errors.brand_id ? "border-red-500" : "border-slate-400"}`}
                                                            placeholder="เลขบาร์โค้ด (Barcode)"
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                                {errors.barcode && (
                                                    <div className="text-red-500 text-sm mt-2">
                                                        {errors.barcode.message}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    ข้อควรระวัง
                                                </label>
                                                <Controller
                                                    name="warning"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <textarea
                                                            {...field}
                                                            className="border border-slate-400 p-2 w-full rounded-md"
                                                            placeholder="ข้อควรระวัง"
                                                            rows={4}
                                                            value={field.value || ""}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    วิธีการใช้งาน
                                                </label>
                                                <Controller
                                                    name="usage_description"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <textarea
                                                            {...field}
                                                            className="border border-slate-400 p-2 w-full rounded-md"
                                                            placeholder="วิธีการใช้งาน"
                                                            rows={4}
                                                            value={field.value || ""}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    ปริมาณฟลูออไรด์
                                                </label>
                                                <Controller
                                                    name="amount_fluoride"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            className="border border-slate-400 p-2 w-full rounded-md"
                                                            placeholder="ปริมาณฟลูออไรด์"
                                                            value={field.value || ""}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    คุณสมบัติ
                                                </label>
                                                <Controller
                                                    name="properties"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <textarea
                                                            {...field}
                                                            className="border border-slate-400 p-2 w-full rounded-md"
                                                            placeholder="คุณสมบัติ"
                                                            rows={4}
                                                            value={field.value || ""}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    ส่วนประกอบ <span className="text-green-500 font-bold">ที่ไม่เป็นอันตราย</span>
                                                </label>
                                                <Controller
                                                    name="active_ingredient"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <textarea
                                                            {...field}
                                                            className="border border-slate-400 p-2 w-full rounded-md"
                                                            placeholder="ส่วนประกอบที่ไม่เป็นอันตราย"
                                                            rows={4}
                                                            value={field.value || ""}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    ส่วนประกอบ <span className="text-red-700 font-bold">ที่เป็นอันตราย</span>
                                                </label>
                                                <Controller
                                                    name="active_ingredient"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <textarea
                                                            {...field}
                                                            className="border border-slate-400 p-2 w-full rounded-md"
                                                            placeholder="ส่วนประกอบที่เป็นอันตราย"
                                                            rows={4}
                                                            value={field.value || ""}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="flex-1 mb-5">
                                                <label className="block mb-2">
                                                    ผลิตภัณฑ์นี้เป็นอันตรายไหม ?
                                                </label>
                                                <Controller
                                                    name="is_dangerous"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="flex items-center space-x-4">
                                                            <label className="flex items-center space-x-2">
                                                                <input
                                                                    type="radio"
                                                                    value="true"
                                                                    checked={field.value === "true"}
                                                                    onChange={(e) => field.onChange(e.target.value)}
                                                                    className="form-radio"
                                                                />
                                                                <span>ใช่</span>
                                                            </label>
                                                            <label className="flex items-center space-x-2">
                                                                <input
                                                                    type="radio"
                                                                    value="false"
                                                                    checked={field.value === "false"}
                                                                    onChange={(e) => field.onChange(e.target.value)}
                                                                    className="form-radio"
                                                                />
                                                                <span>ไม่</span>
                                                            </label>
                                                        </div>
                                                    )}
                                                />
                                                {errors.is_dangerous && (
                                                    <div className="text-red-500 text-sm mt-2">
                                                        {errors.is_dangerous.message}
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
                                                    onClick={() => openDeleteModal("modal-del", `${editingValues.product_id}`)}
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

export default ProductsPage;