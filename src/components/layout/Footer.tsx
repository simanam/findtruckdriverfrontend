import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900/50 border-t border-slate-800 py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <img
                                src="/icons/FTD_LOGO.png"
                                alt="FindTruckDriver"
                                className="w-10 h-10"
                            />
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Trucking news, tips, and real-time driver tools. By truckers, for truckers.
                        </p>
                    </div>

                    {/* Blog */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Blog</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/category/industry-news" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Industry News
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/driver-lifestyle" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Driver Lifestyle
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/regulations" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Regulations
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/trucking-tips" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Trucking Tips
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/product-reviews" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Product Reviews
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Tools & Product */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Tools</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/map" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Driver Map
                                </Link>
                            </li>
                            <li>
                                <Link href="/join" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Join
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/feedback" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Feature Requests
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Contact */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="mailto:support@logixtecs.com"
                                    className="text-slate-400 hover:text-white text-sm transition-colors"
                                >
                                    support@logixtecs.com
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.logixtecs.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
                                >
                                    Logixtecs Solutions LLC
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-slate-500 text-sm">
                            &copy; {currentYear} FindTruckDriver. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 text-slate-500 text-sm">
                            <Link href="/feed.xml" className="hover:text-white transition-colors">
                                RSS Feed
                            </Link>
                            <span className="text-slate-700">|</span>
                            <span>A product of</span>
                            <a
                                href="https://www.logixtecs.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
                            >
                                Logixtecs Solutions LLC
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
