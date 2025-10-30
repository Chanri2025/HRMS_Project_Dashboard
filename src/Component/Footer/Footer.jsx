// src/Component/Utils/Footer.jsx
import React from "react";
import {Link} from "react-router-dom";
import Logo from "@/assets/logo.svg";
import {FaEnvelope, FaPhoneAlt} from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-green-400 to-green-400 text-white py-4">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Logo & Tagline */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                        <img src={Logo} alt="Logo" className="w-28 sm:w-32 mx-auto md:mx-0"/>
                        <p className="text-gray-200 leading-snug text-sm">
                            Appynitty is a Tech-Driven Innovative Company that provides sustainable and robust
                            technological solutions for Solid Waste Management (SWM). Our technologies contribute
                            immensely toward environmental protection and make the cities cleaner, greener and
                            healthier.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center sm:text-left">
                        <h4 className="text-lg font-bold mb-2 uppercase border-b-2 border-white inline-block pb-1">
                            Quick Links
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm">
                            {[
                                {to: "/menu", label: "Dashboard"},
                                {to: "/work-entry", label: "Work Entries"},
                                {to: "/attendance", label: "Attendance"},
                                {to: "/projects/active", label: "Projects"},
                            ].map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-gray-200 hover:text-white transition-colors duration-200"
                                    >
                                        • {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="text-center sm:text-left">
                        <h4 className="text-lg font-bold mb-2 uppercase border-b-2 border-white inline-block pb-1">
                            Contact Us
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-200">
                            <li className="flex justify-center sm:justify-start items-center gap-1">
                                <FaEnvelope className="text-white"/> info@appynitty.com
                            </li>
                            <li className="flex justify-center sm:justify-start items-center gap-1">
                                <FaPhoneAlt className="text-white"/> +91 92091 00900
                            </li>
                            <li className="text-center sm:text-left">
                                1st Floor, K.B Chambers Plot No - 62, South Canal Gokulpeth, Dharampeth,Nagpur,
                                Maharashtra: 440010
                            </li>
                        </ul>
                    </div>

                    {/* Our Office */}
                    <div className="text-center sm:text-left">
                        <h4 className="text-lg font-bold mb-2 uppercase border-b-2 border-white inline-block pb-1">
                            Our Office
                        </h4>
                        <p className="mt-2 text-gray-200 text-sm leading-snug max-w-xs mx-auto sm:mx-0">
                            We’re located in the heart of Nagpur, ready to support you all week long.
                        </p>
                    </div>
                </div>

                <div className="mt-6 border-t border-white border-opacity-20 pt-4">
                    <div className="text-center text-gray-300 text-xs">
                        &copy; {new Date().getFullYear()}{" "}
                        <Link
                            to="https://www.appynitty.com/"
                            className="underline hover:text-white transition-colors duration-200"
                        >
                            Appynitty Communications Pvt. Ltd.
                        </Link>
                        . All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}