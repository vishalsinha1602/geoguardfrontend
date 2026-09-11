import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../api/authApi";

const Signup = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await signup(formData);

            console.log("Signup Success");
            console.log(response.data);

            alert("Account Created Successfully");

            navigate("/login");

        } catch (error) {

            console.error(error);

            alert("Signup Failed");

        }

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">

            <div className="bg-white w-96 rounded-xl shadow-lg p-8">

                <h1 className="text-3xl font-bold text-center text-blue-600">
                    GeoSentinel
                </h1>

                <p className="text-center text-gray-500 mt-2">
                    Create Your Account
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-4"
                >

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3 outline-none"
                        required
                    />

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
                        Sign Up
                    </button>

                </form>

                <p className="text-center mt-6">

                    Already have an account?

                    <Link
                        to="/login"
                        className="text-blue-600 ml-2 font-semibold"
                    >
                        Login
                    </Link>

                </p>

            </div>

        </div>
    );
};

export default Signup;