import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

// API
import apiClient from '../api/apiClient';

// Icon
import { TbLogout2 } from "react-icons/tb";

import Menu from "../json/menu.json"

interface SildebarProps {
    urlParth: string;
}

const SlideBar = ({ urlParth }: SildebarProps) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
          await apiClient.post('/users/logout');
          dispatch(logout()); 
          navigate('/login');
        } catch (error) {
          console.error("Logout failed:", error);
        }
    };

    return (
        <div className="w-72 bg-yellow shadow-inner min-h-screen pt-8 duration-300 flex flex-col justify-between">
            <div>
                <div className="flex gap-x-4 items-center ps-5">
                    <img
                        src="/many-tooh-logo.png"
                        className="w-10"
                    />
                    <h1 className="text-black origin-left font-medium text-xl duration-200">Many Tooh Admin</h1>
                </div>

                <ul className="pt-3 p-1">
                    {Menu.menu_main.map((menu) => (
                        <li
                            key={menu.id}
                            className={`flex flex-col rounded-md p-3 mt-2 cursor-pointer hover:bg-white/50 hover:text-white text-gray-300 gap-x-4 ${menu.to === urlParth && "bg-orange"}`}
                        >
                            <Link to={`/${menu.to}`}>
                                <span className={`font-bold text-base ${menu.to === urlParth ? "text-white" : "text-black"} origin-left duration-200`}>
                                    {menu.title}
                                </span>
                            </Link>
                        </li>
                    ))}

                    <li className="mt-10 flex flex-col rounded-md p-3 hover:bg-white/50 hover:text-black text-black gap-x-4">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-x-2 font-bold text-base origin-left duration-200 text-left cursor-pointer"
                        >
                            <TbLogout2 className="text-xl" />
                            ออกจากระบบ
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default SlideBar;