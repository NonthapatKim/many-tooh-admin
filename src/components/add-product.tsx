import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDropzone } from "react-dropzone";

// API
import apiClient from "../api/apiClient";

// Icons
import { IoMdClose } from "react-icons/io";

// Toast
import { toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Type
import { AddModalProps } from "../types/props";
import { BrandDataType } from "../types/brand";
import {
    ProductCategoriesDataType,
    ProductTypeData,
    ProductAddDataType
} from "../types/product";

// Zod
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const addProductSchema = z.object({
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
        return file.size <= 10 * 1024 * 1024;
    }, { message: "ขนาดไฟล์ต้องไม่เกิน 10MB" }),
})

const AddProductModal = ({ setAddModal, refreshData }: AddModalProps) => {

    const dangerousWords = ["SLS", "Sodium lauryl sulphate", "Sodium Lauryl Sulfate", "Paraben", "Propyl paraben", "Sodium Benzoate", "Ethyl paraben", "Methyl paraben"];

    const [brandData, setBrandData] = useState<BrandDataType[]>([])
    const [productCategoriesData, setProductCategoriesData] = useState<ProductCategoriesDataType[]>([])
    const [productTypeData, setProductTypeData] = useState<ProductTypeData[]>([])

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

    const [addProductData] = useState<ProductAddDataType>({
        brand_id: "",
        product_category_id: "",
        product_type_id: "",
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
    })

    const { control, handleSubmit, getValues, setValue, formState: { errors } } = useForm({
        defaultValues: addProductData,
        resolver: zodResolver(addProductSchema),
    });

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

    useEffect(() => {
        fetchBrandData();
        fetchProductCategoriesData();
        fetchProductTypeData();
    }, [fetchBrandData, fetchProductCategoriesData, fetchProductTypeData])

    const onSubmit = handleSubmit(async (data: ProductAddDataType) => {
        try {
            const formData = new FormData();

            Object.entries(data).forEach(([key, value]) => {
                if (key === "product_image" && value) {
                    formData.append(key, value as File);
                } else {
                    formData.append(key, value as string);
                }
            });

            const response = await apiClient.post("/products/add", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                toast.success('เพิ่มข้อมูลสำเร็จ !', {
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
                refreshData()
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
            <div className="flex flex-col overflow-y-auto flex-grow bg-white shadow-lg pt-10 ps-5 pe-5 pb-5 relative w-[90%] h-full max-w-xl">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-5">
                        <h1 className="font-semibold text-2xl">เพิ่มผลิตภัณฑ์</h1>
                        <IoMdClose
                            className="text-2xl cursor-pointer text-black/50"
                            onClick={() => setAddModal(false)}
                        />
                    </div>

                    <div className="add-form">
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
                                                const input = e.target.value;

                                                // แปลงข้อความให้ clean ก่อน (รองรับ comma, newline)
                                                const rawItems = input
                                                    .split(/,|\n/)
                                                    .map((i) => i.trim())
                                                    .filter(Boolean); // ตัด empty string ออก

                                                const currentDanger = getValues("dangerous_ingredient") || "";
                                                const currentDangerList = currentDanger
                                                    .split(/,|\n/)
                                                    .map((i) => i.trim())
                                                    .filter(Boolean);

                                                const newDanger: string[] = [];

                                                rawItems.forEach((inputItem) => {
                                                    const match = dangerousWords.find((word) =>
                                                        inputItem.toLowerCase().includes(word.toLowerCase())
                                                    );
                                                    if (match && !currentDangerList.includes(match)) {
                                                        newDanger.push(match);
                                                    }
                                                });

                                                const safe = rawItems.filter((item) => {
                                                    return !dangerousWords.some((word) =>
                                                        item.toLowerCase().includes(word.toLowerCase())
                                                    );
                                                });

                                                setValue("active_ingredient", safe.join(", "));
                                                setValue(
                                                    "dangerous_ingredient",
                                                    [...currentDangerList, ...newDanger].join(", ")
                                                );
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
                                    name="dangerous_ingredient"
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

                            <button type="submit" className="bg-blue-600 text-white py-1 px-3 mt-5 rounded-md cursor-pointer">
                                บันทึกข้อมูล
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddProductModal;
