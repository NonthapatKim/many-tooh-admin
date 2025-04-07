import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

// API
import apiClient from "../api/apiClient";

// Icons
import { IoMdClose } from "react-icons/io";

// Toast
import { toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Type
import { AddModalProps } from "../types/props"
import { ProductCategoriesAddDataType } from "../types/product";

// Zod
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const addProductCateSchema = z.object({
    product_category_name: z
        .string()
        .min(1, { message: "กรุณากรอกชื่อประเภทของผลิตภัณฑ์" }),
})

const AddProductCategoryModal = ({ setAddModal, refreshData }: AddModalProps) => {

    const [addProductCateData] = useState<ProductCategoriesAddDataType>({
        product_category_name: ""
    })

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: addProductCateData,
        resolver: zodResolver(addProductCateSchema),
    });

    const onSubmit = handleSubmit(async (data: ProductCategoriesAddDataType) => {
        try {
            const response = await apiClient.post("/categories/add", data);

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
        } catch(error) {
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
                        <h1 className="font-semibold text-2xl">เพิ่มประเภทของผลิตภัณฑ์</h1>
                        <IoMdClose
                            className="text-2xl cursor-pointer text-black/50"
                            onClick={() => setAddModal(false)}
                        />
                    </div>

                    <div className="add-form">
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

export default AddProductCategoryModal;