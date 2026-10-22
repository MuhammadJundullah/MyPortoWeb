"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Loading from "@/app/_components/Loading";
import StatusDropdown from "../_components/StatusDropdown";
import { SquarePen, Delete } from "lucide-react";
import Header from "@/app/admin/_components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";
import { ProjectsType } from "@/lib/type";

const ManageProjects = () => {
  const { toast, showToast } = useToast();
  const [projects, setProjects] = useState<ProjectsType[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectsType[]>([]);
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

  // handle fetch data projects with client side rendering
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error("Gagal memuat data proyek");
        const data = await response.json();
        setProjects(data.data);
        setFilteredProjects(data.data);
      } catch {
        showToast("Gagal memuat data proyek.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // logic search
  const handleSearch = useCallback(
    (keyword: string) => {
      const filtered = projects.filter((project) =>
        project.judul.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredProjects(filtered);
    },
    [projects]
  );

  // time to reload data after typing in search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchKeyword);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchKeyword, handleSearch]);

  // for refresh data without reload page
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error();
      const data = await response.json();
      setProjects(data.data);
      setFilteredProjects(data.data);
    } catch {
      showToast("Gagal memuat ulang data proyek.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // handle delete project
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus proyek ini?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();
      await handleRefresh();
      showToast("Proyek berhasil dihapus.", "success");
    } catch {
      showToast("Gagal menghapus proyek.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // handle update status only
  const handleStatusUpdate = async (
    id: string,
    newStatus: "published" | "archived"
  ) => {
    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui status");
      }

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === id ? { ...project, status: newStatus } : project
        )
      );

      showToast(`Status proyek berhasil diubah menjadi ${newStatus === "published" ? "diterbitkan" : "diarsipkan"}.`, "success");
    } catch {
      showToast("Gagal memperbarui status proyek.", "error");
      await handleRefresh();
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
          tags: ["projects"],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        showToast("Data proyek berhasil diperbarui.", "success");
      } else {
        throw new Error();
      }
    } catch {
      showToast("Gagal memperbarui data proyek.", "error");
    } finally {
      setRevalidating(false);
    }
  };

  return (
    <div className="mx-auto sm:px-4 max-w-6xl min-h-screen">
      <Header
        dynamicText="Projects"
        searchKeyword={searchKeyword}
        ref={searchInputRef}
        setSearchKeyword={setSearchKeyword}
        isRevalidating={isRevalidating}
        isRefreshing={isRefreshing}
        handleRevalidate={handleRevalidate}
        newLink="/admin/projects/add"
      />

      {isLoading ? (
        <div className="text-center py-20 my-20">
          <div className="text-center py-10">
            <div className="flex items-center justify-center ">
              <Loading />
            </div>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 my-20">
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-white">
              {searchKeyword
                ? "Tidak ada proyek yang cocok."
                : "Anda belum membuat proyek apapun."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="h-full flex flex-col dark:bg-gray-600 dark:text-white">
              <CardHeader>
                <CardTitle>{project.judul}</CardTitle>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="space-y-4">
                  {typeof project.photo === "string" && project.photo && (
                    <img src={project.photo} alt={project.judul} className="h-40 w-full rounded-md object-cover" />
                  )}
                  {project.desc && <p className="line-clamp-3 text-sm">{project.desc.replace(/<[^>]*>/g, " ")}</p>}
                  <div className="flex items-center justify-start gap-3 pb-5">
                    <span className="text-sm text-gray-500 dark:text-white">
                      Status:
                    </span>
                    <StatusDropdown
                      currentStatus={project.status}
                      onStatusChange={(newStatus) =>
                        handleStatusUpdate(project.id, newStatus)
                      }
                    />
                  </div>

                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="ghost2"
                  className="flex items-center gap-2 hover:cursor-pointer text-red-500"
                  onClick={() => handleDelete(project.id)}>
                  <Delete size={16} />
                  Hapus
                </Button>

                <Link href={`/admin/projects/edit/${project.id}`}>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 hover:cursor-pointer border-gray-300 ">
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

export default ManageProjects;
