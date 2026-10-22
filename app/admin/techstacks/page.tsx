"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Loading from "@/app/_components/Loading";
import { SquarePen, Delete } from "lucide-react";
import Image from "next/image";
import Header from "@/app/admin/_components/Header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";
import { TechStackType } from "@/lib/type";

const ManageTechstacks = () => {
  const { toast, showToast } = useToast();
  const [Techstacks, setTechstacks] = useState<TechStackType[]>([]);
  const [filteredTechstacks, setFilteredTechstacks] = useState<TechStackType[]>(
    []
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRevalidating, setRevalidating] = useState(false);

  // handle search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/techstacks");
        if (!response.ok) throw new Error("Gagal memuat tools dan teknologi");
        const data = await response.json();
        setTechstacks(data.data);
        setFilteredTechstacks(data.data);
      } catch {
        showToast("Gagal memuat data alat dan teknologi.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = useCallback(
    (keyword: string) => {
      const filtered = Techstacks.filter((techstack) =>
        techstack.name.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredTechstacks(filtered);
    },
    [Techstacks]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchKeyword);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchKeyword, handleSearch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const response = await fetch("/api/techstacks");
      if (!response.ok) throw new Error();
      const data = await response.json();
      setTechstacks(data.data);
      setFilteredTechstacks(data.data);
    } catch {
      showToast("Gagal memuat ulang data alat dan teknologi.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus alat dan teknologi ini?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/techstacks?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();
      await handleRefresh();
      showToast("Alat dan teknologi berhasil dihapus.", "success");
    } catch {
      showToast("Gagal menghapus alat dan teknologi.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevalidate = async () => {
    try {
      setRevalidating(true);
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}`,
        },
        body: JSON.stringify({
          paths: ["/"],
          tags: ["techstacks"],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        showToast("Data alat dan teknologi berhasil diperbarui.", "success");
      } else {
        throw new Error();
      }
    } catch {
      showToast("Gagal memperbarui data alat dan teknologi.", "error");
    } finally {
      setRevalidating(false);
    }
  };
  
  return (
    <div className="mx-auto sm:px-4 max-w-6xl min-h-screen">
      <Header
        dynamicText="Tools & Technologies"
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        ref={searchInputRef}
        isRevalidating={isRevalidating}
        isRefreshing={isRefreshing}
        handleRevalidate={handleRevalidate}
        newLink="/admin/techstacks/add"
      />

      {isLoading ? (
        <div className="text-center py-20 my-20">
          <div className="text-center py-10">
            <div className="flex items-center justify-center ">
              <Loading />
            </div>
          </div>
        </div>
      ) : filteredTechstacks.length === 0 ? (
        <div className="text-center py-20 ">
          <div className="py-10">
            <p className="text-gray-500 py-20 dark:text-white">
              {searchKeyword
                ? "Tidak ada tools yang cocok."
                : "Belum ada tools."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredTechstacks.map((techstack) => (
            <Card key={techstack.id} className="h-full flex flex-col">
              {techstack.image && typeof techstack.image === "string" && (
                <Image
                  src={techstack.image}
                  alt={techstack.name}
                  width={100}
                  height={50}
                  className="rounded-lg p-2 mx-auto"
                />
              )}

              <CardHeader>
                <CardTitle>{techstack.name}</CardTitle>
              </CardHeader>

              <CardFooter className="flex justify-center gap-2">
                <Button
                  variant="ghost2"
                  className="flex items-center gap-2 hover:cursor-pointer text-red-500"
                  onClick={() => handleDelete(techstack.id)}>
                  <Delete size={16} />
                  Hapus
                </Button>

                <Link href={`/admin/techstacks/edit/${techstack.id}`}>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300 hover:cursor-pointer">
                    <SquarePen size={16} />
                    Edit
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ManageTechstacks;
