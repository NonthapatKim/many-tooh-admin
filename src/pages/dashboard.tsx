import { useCallback, useEffect, useState } from "react";

// API
import apiClient from "../api/apiClient";

// Component
import SlideBar from "../components/slidebar";

// Type
import { BrandDataType } from "../types/brand";
import {
  ProductDataType,
  ProductCategoriesDataType,
  ProductTypeData
} from "../types/product";
import { PageProps } from "../types/props";

const DashboardPage = ({ urlParth }: PageProps) => {
  const [brandData, setBrandData] = useState<BrandDataType[]>([])
  const [productCategoriesData, setProductCategoriesData] = useState<ProductCategoriesDataType[]>([])
  const [productTypeData, setProductTypeData] = useState<ProductTypeData[]>([])
  const [productData, setProductData] = useState<ProductDataType[]>();

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

  return (
    <div className="flex min-h-screen">
      <SlideBar urlParth={urlParth} />

      <div className="flex-1 overflow-y-auto h-screen p-10">
        <div className="flex gap-4">
          <div className="bg-white p-6 shadow-md rounded-2xl w-64 flex flex-row justify-between items-center">
            <div>
              <p className="text-lg font-semibold">แบรนด์</p>
              <p className="text-sm text-gray-500">จำนวนทั้งหมด</p>
            </div>
            <p className="text-2xl font-bold text-orange">{brandData.length}</p>
          </div>

          <div className="bg-white p-6 shadow-md rounded-2xl w-64 flex flex-row justify-between items-center">
            <div>
              <p className="text-lg font-semibold">ผลิตภัณฑ์</p>
              <p className="text-sm text-gray-500">จำนวนทั้งหมด</p>
            </div>
            <p className="text-2xl font-bold text-orange">{productData?.length}</p>
          </div>

          <div className="bg-white p-6 shadow-md rounded-2xl w-64 flex flex-row justify-between items-center">
            <div>
              <p className="text-lg font-semibold">ประเภท</p>
              <p className="text-sm text-gray-500">ของผลิตภัณฑ์</p>
            </div>
            <p className="text-2xl font-bold text-orange">{productCategoriesData.length}</p>
          </div>

          <div className="bg-white p-6 shadow-md rounded-2xl w-64 flex flex-row justify-between items-center">
            <div>
              <p className="text-lg font-semibold">ชนิด</p>
              <p className="text-sm text-gray-500">ของผลิตภัณฑ์</p>
            </div>
            <p className="text-2xl font-bold text-orange">{productTypeData.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
