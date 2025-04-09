import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout } from "../redux/authSlice"; 
import Logo from "/many-tooh-logo.png";
import { RootState } from "../redux/store"; 

import apiClient from "../api/apiClient";
import axios from "axios";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
  
    try {
      const response = await apiClient.post("/users/login", { username, password });
  
      if (response.status === 200) {
        const authRes = await apiClient.get("/users/authenticate");
        if (authRes.status === 200) {
          dispatch(
            loginSuccess({
              role: authRes.data.role,
              userId: authRes.data.staff_id,
              username: authRes.data.username,
            })
          );
          navigate("/");
        } else {
          dispatch(logout());
        }
      } else {
        const errorMessage = response?.data?.errors?.incorrect || "Invalid login credentials";
        setError(errorMessage);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const errorMessage = error.response.data?.errors?.incorrect || "Invalid login credentials";
        setError(errorMessage);
      } else {
        console.error("Login failed:", error);
        setError("Network Error");
      }
    }
  };  

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <section className="min-h-screen bg-primary flex items-center justify-center">
      <div className="w-full bg-white rounded-lg shadow sm:max-w-md xl:p-0">
        <div className="flex justify-center mt-4">
          <img src={Logo} width={200} alt="logo" />
        </div>
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full text-dark bg-yellow hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center cursor-pointer"
            >
              Sign in
            </button>
          </form>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
