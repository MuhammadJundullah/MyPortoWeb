import React, { forwardRef } from "react";
import { VscRefresh } from "react-icons/vsc";
import { FilePlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface HeaderProps {
  dynamicText: string;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  isRevalidating: boolean;
  isRefreshing: boolean;
  handleRevalidate: () => void;
  newLink: string;
}

const Header = forwardRef<HTMLInputElement, HeaderProps>(
  (
    {
      dynamicText,
      searchKeyword,
      setSearchKeyword,
      isRevalidating,
      isRefreshing,
      handleRevalidate,
      newLink,
    },
    ref
  ) => {
    return (
      <div>
        <div className="sm:my-10">
          <h1 className="text-3xl font-bold dark:text-white">
            Manage {dynamicText}
          </h1>
          <p className="text-gray-500 font-medium dark:text-gray-300">
            Kelola {dynamicText.toLowerCase()} kamu dengan rapi dan profesional
            dengan mengarsipkan {dynamicText.toLowerCase()} yang tidak relevan.
          </p>
        </div>
        <div className="sm:flex gap-3 items-center mb-10">
          <div className="flex items-center gap-2 my-10 sm:my-0">
            <Search className="text-gray-400 dark:text-white" />
            <Input
              type="text"
              ref={ref}
              placeholder={`⌘ + K / Ctrl + K to Search`}
              className="min-w-3xs border-gray-200 placeholder:text-gray-400 dark:placeholder:text-white dark:text-white placeholder:font-bold"
              aria-label="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <div className="border-b border-gray-300 lg:w-7xl sm:block md:block lg:block hidden" />
          <div className="flex items-center gap-4 p-2 bg-white dark:bg-gray-500 rounded-lg shadow-sm justify-around">
            <Link
              href={newLink}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-400 hover:text-gray-900 hover:cursor-pointer">
              <FilePlus />
              <span className="w-19">{dynamicText === "Tools & Technologies" ? "New Tool" : `New ${dynamicText.slice(0, -1)}`}</span>
            </Link>
            <button
              onClick={handleRevalidate}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-400 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer">
              <VscRefresh
                className={`w-5 h-5 ${isRevalidating ? "animate-spin" : ""}`}
              />
              <span>{isRevalidating ? "Revalidating..." : "Revalidate"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

Header.displayName = "Header";

export default Header;
