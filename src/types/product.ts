export interface ProductDataType {
    product_id: string;
    brand_id: string;
    product_category_id: string;
    product_type_id: string;
    brand_name: string;
    product_category_name: string;
    product_type_name: string;
    product_image_url?: string;
    product_name: string;
    barcode: string;
    warning?: string;
    usage_description?: string;
    amount_fluoride?: string;
    properties?: string;
    active_ingredient?: string;
    dangerous_ingredient?: string;
    is_dangerous: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ProductCategoriesDataType {
    product_category_id: string;
    product_category_name: string;
}

export interface ProductCategoriesAddDataType {
    product_category_name: string;
}

export interface ProductTypeData {
    product_type_id: string;
    product_type_name: string;
}

export interface ProductTypeAddData {
    product_type_name: string;
}

export interface ProductAddDataType {
    brand_id: string;
    product_category_id: string;
    product_type_id: string;
    product_name: string;
    barcode: string;
    warning: string | null;
    usage_description: string | null;
    amount_fluoride: string | null;
    properties: string | null;
    active_ingredient: string | null;
    dangerous_ingredient: string | null;
    is_dangerous: string;
    product_image: File | null;
}

export interface ProductEditDataType {
    product_id: string;
    brand_id: string;
    product_category_id: string;
    product_type_id: string;
    product_image_url: string | null;
    product_name: string;
    barcode: string;
    warning: string | null;
    usage_description: string | null;
    amount_fluoride: string | null;
    properties: string | null;
    active_ingredient: string | null;
    dangerous_ingredient: string | null;
    is_dangerous: string;
    product_image: File | null;
}