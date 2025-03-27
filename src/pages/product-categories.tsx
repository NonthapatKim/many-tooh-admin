import { PageProps } from "../types/props";

import SlideBar from "../components/slidebar";

const ProductCategoriesPage = ({ urlParth }: PageProps) => {
    return (
        <div className="flex min-h-screen">
            <SlideBar urlParth={urlParth} />


            <div className="flex-1 overflow-y-auto h-screen">
                <p className="p-10">Product Category</p>
            </div>
        </div>
    )
}

export default ProductCategoriesPage;