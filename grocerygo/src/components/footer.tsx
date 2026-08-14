"use client";

import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

function Footer() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white mt-20"
        >
            <div className="w-[90%] md:w-[80%] mx-auto py-10 grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-green-500/40">
                <div>
                    <h2 className="text-2xl font-bold mb-3">GroceryGo</h2>
                    <p className="text-sm text-green-100 leading-relaxed">
                        Your one-stop shop for fresh groceries and household essentials delivered in 10 minutes.
                    </p>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-3">Quick Links</h2>
                    <ul className="space-y-2 text-green-100 text-sm">
                        <li><Link href={"/"} className="hover:text-white transition">Home</Link></li>
                        <li><Link href={"/user/cart"} className="hover:text-white transition">Cart</Link></li>
                        <li><Link href={"/user/my-orders"} className="hover:text-white transition">My Orders</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-3">Contact Us</h3>

                    <ul className="text-gray-200 text-sm space-y-3">
                        <li className="flex items-center gap-2">
                            <MapPin size={16} className="text-green-200" /> Mumbai, India
                        </li>

                        <li className="flex items-center gap-2">
                            <Phone size={16} className="text-green-200" /> +91 0000000000
                        </li>

                        <li className="flex items-center gap-2">
                            <Mail size={16} className="text-green-200" /> support@grocerygo.in
                        </li>
                    </ul>

                    <div className="flex gap-4 mt-4">
                        <Link href="https://facebook.com" target="_blank" aria-label="Facebook">
                            <FaFacebook className="w-5 h-5 hover:text-white transition" />
                        </Link>

                        <Link href="https://instagram.com" target="_blank" aria-label="Instagram">
                            <FaInstagram className="w-5 h-5 hover:text-white transition" />
                        </Link>

                        <Link href="https://twitter.com" target="_blank" aria-label="Twitter">
                            <FaTwitter className="w-5 h-5 hover:text-white transition" />
                        </Link>
                    </div>
                </div>
            </div>
            <div className="text-center py-4 text-sm text-green-100 bg-green-800/40">
                © {new Date().getFullYear()} <span className="font-semibold">GroceryGo</span>. All rights reserved.
            </div>
        </motion.div>
    );
}

export default Footer;