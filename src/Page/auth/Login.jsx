import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/authApi";


const Login = () => {





    const navigate = useNavigate();

    const [formData, setFormData] = useState({email: "",password: "",});

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

    };


   const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      console.log(formData);

        const response = await login(formData);

        console.log("Login Success");
        console.log(response.data);

        // Extract access token
        const accessToken = response.data.data.accessToken;

        // Save token
        localStorage.setItem("accessToken", accessToken);


        console.log("Saved Token:", localStorage.getItem("accessToken"));

        navigate("/dashboard");

    } catch (error) {

        console.error(error);

        alert("Invalid Email or Password");

    }

};

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">

            <div className="bg-white w-96 rounded-xl shadow-lg p-8">

                <h1 className="text-3xl font-bold text-center text-blue-600">
                    GeoGuard
                </h1>

                <p className="text-center text-gray-500 mt-2">
                    Real-Time GPS Tracking System
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-4"
                >

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3 outline-none"
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3 outline-none"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Login
                    </button>

                </form>

                <p className="text-center mt-6">

                    Don't have an account?

                    <Link
                        to="/signup"
                        className="text-blue-600 ml-2 font-semibold"
                    >
                        Sign Up
                    </Link>

                </p>

            </div>

        </div>
    );
};

export default Login;