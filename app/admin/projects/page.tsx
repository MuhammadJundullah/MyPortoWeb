"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Loading from "@/app/_components/Loading";
import StatusDropdown from "../_components/StatusDropdown";
import { SquarePen, Delete } from "lucide-react";
import Header from "@/app/admin/_components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
        console.log(data);
        setProjects(data.data);
        setFilteredProjects(data.data);
      } catch (err) {
        showToast(`${err}`, "success");
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
    const response = await fetch("/api/projects");
    const data = await response.json();
    setProjects(data.data);
    setIsLoading(false);
    setIsRefreshing(false);
  };

  // handle delete project
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus project ini?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIsLoading(false);
        handleRefresh();
        showToast("Project has been deleted successfully!", "success");
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Delete error:", err);
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

      showToast(`Project has been ${newStatus} successfully!`, "success");
    } catch (error) {
      showToast(` ${error}`, "success");
      handleRefresh();
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
      setRevalidating(false);

      const data = await res.json();
      if (data.success) {
        showToast("Static Project Data has been revalidating!", "success");
      }
    } catch (err) {
      alert("Failed to revalidate " + err);
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
                <CardDescription className="dark:text-white">
                  {project.tech || "Proyek"}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="space-y-4">
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

                  <div className="text-sm">
                    <p className="text-gray-500 dark:text-white">
                      Terakhir diperbarui:
                    </p>
                    <p>
                      {new Date(project.updatedAt).toLocaleDateString("id-ID", {
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
