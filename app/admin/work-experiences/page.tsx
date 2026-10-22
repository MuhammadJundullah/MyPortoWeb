"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Loading from "@/app/_components/Loading";
import { SquarePen, Delete, Briefcase } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "../_components/Header";
import { Toast } from "@/app/login/_components/Toast";

interface WorkExperience {
  experience_id: number;
  company_name: string;
  position: string;
  duration: string;
  type: string;
  created_at: string;
  updated_at: string;
}

const ManageWorkExperiences = () => {
  const { toast, showToast } = useToast();
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<
    WorkExperience[]
  >([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isRevalidating, setRevalidating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle search shortcut
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

  // Fetch work experiences
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/work-experiences");
        if (!response.ok) throw new Error("Gagal memuat data work experiences");
        const result = await response.json();

        if (result.success) {
          setExperiences(result.data);
          setFilteredExperiences(result.data);
        }
      } catch {
        setError("Gagal memuat data pengalaman kerja.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search logic
  const handleSearch = useCallback(
    (keyword: string) => {
      const filtered = experiences.filter(
        (exp) =>
          exp.company_name.toLowerCase().includes(keyword.toLowerCase()) ||
          exp.position.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredExperiences(filtered);
    },
    [experiences]
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword, handleSearch]);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const response = await fetch("/api/work-experiences");
      const result = await response.json();

      if (result.success) {
        setExperiences(result.data);
        setFilteredExperiences(result.data);
      }
    } catch {
      showToast("Gagal memuat ulang data pengalaman kerja.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Delete work experience
  const handleDelete = async (experienceId: number) => {
    if (
      !confirm(
        "Yakin ingin menghapus pengalaman kerja ini beserta seluruh uraian pekerjaannya?"
      )
    )
      return;

    try {
      const response = await fetch(
        `/api/work-experiences?experience_id=${experienceId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        await handleRefresh();
        showToast("Pengalaman kerja berhasil dihapus.", "success");
      } else {
        throw new Error();
      }
    } catch {
      showToast("Gagal menghapus pengalaman kerja.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-red-500 text-center p-4">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

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
          tags: ["work-experiences"],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Data pengalaman kerja berhasil diperbarui.", "success");
      } else {
        throw new Error();
      }
    } catch {
      showToast("Gagal memperbarui data pengalaman kerja.", "error");
    } finally {
      setRevalidating(false);
    }
  };

  return (
    <div className="mx-auto sm:px-4 max-w-6xl h-screen">
      <Header
        dynamicText="Work Experiences"
        searchKeyword={searchKeyword}
        ref={searchInputRef}
        setSearchKeyword={setSearchKeyword}
        isRevalidating={isRevalidating}
        isRefreshing={isRefreshing}
        handleRevalidate={handleRevalidate}
        newLink="/admin/work-experiences/add"
      />

       {isLoading ? (
        <div className="text-center py-20 my-20">
          <div className="text-center py-10">
            <div className="flex items-center justify-center ">
              <Loading />
            </div>
          </div>
        </div>
        ) : filteredExperiences.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">
            {searchKeyword
              ? "Tidak ada work experience yang cocok."
              : "Belum ada work experience. Tambahkan yang pertama!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredExperiences.map((exp) => (
            <Card key={exp.experience_id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2">{exp.position}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {exp.company_name}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-gray-500">Duration:</p>
                    <p className="font-medium">{exp.duration}</p>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-500">Type:</p>
                    <p className="font-medium">{exp.type}</p>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-500">Terakhir diperbarui:</p>
                    <p>
                      {new Date(exp.updated_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="ghost2"
                  className="flex items-center gap-2 hover:cursor-pointer text-red-500"
                  onClick={() => handleDelete(exp.experience_id)}>
                  <Delete size={16} />
                  Hapus
                </Button>

                <Link
                  href={`/admin/work-experiences/edit?id=${exp.experience_id}`}>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 hover:cursor-pointer border-gray-300">
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

export default ManageWorkExperiences;
