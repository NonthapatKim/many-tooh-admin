import SlideBar from "../components/slidebar";
import { PageProps } from "../types/props";

const DashboardPage = ({ urlParth }: PageProps) => {
  return (
    <div className="flex min-h-screen">
      <SlideBar urlParth={urlParth} />


      <div className="flex-1 overflow-y-auto h-screen">
        <p className="p-10">ไม่มีข้อมูล</p>
      </div>
    </div>
  )
}

export default DashboardPage;
