"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Loading from "@/app/_components/Loading";
import StatusDropdown from "../_components/StatusDropdown";
import { SquarePen, Delete } from "lucide-react";
import Image from "next/image";
import Header from "@/app/admin/_components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";
import { CertificatesType } from "@/lib/type";

const ManageCertificates = () => {
  const { toast, showToast } = useToast();
  const [Certificates, setCertificates] = useState<CertificatesType[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<
    CertificatesType[]
  >([]);
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
        const response = await fetch("/api/certificates");
        if (!response.ok) throw new Error("Gagal memuat data sertifikat");
        const data = await response.json();
        setCertificates(data.data);
        setFilteredCertificates(data.data);
      } catch {
        showToast("Gagal memuat data sertifikat.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = useCallback(
    (keyword: string) => {
      const filtered = Certificates.filter((certificate) =>
        certificate.name.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredCertificates(filtered);
    },
    [Certificates]
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
      const response = await fetch("/api/certificates");
      if (!response.ok) throw new Error();
      const data = await response.json();
      setCertificates(data.data);
      setFilteredCertificates(data.data);
    } catch {
      showToast("Gagal memuat ulang data sertifikat.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus sertifikat ini?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/certificates?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();
      await handleRefresh();
      showToast("Sertifikat berhasil dihapus.", "success");
    } catch {
      showToast("Gagal menghapus sertifikat.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    certificateId: string,
    newStatus: "published" | "archived"
  ) => {
    try {
      const response = await fetch(
        `/api/certificates?statuschange=${certificateId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Gagal memperbarui status");
      }

      setCertificates((prevCertificates) =>
        prevCertificates.map((certificate) =>
          certificate.id === certificateId
            ? { ...certificate, status: newStatus }
            : certificate
        )
      );

      showToast(`Status sertifikat berhasil diubah menjadi ${newStatus === "published" ? "diterbitkan" : "diarsipkan"}.`, "success");
    } catch {
      showToast("Gagal memperbarui status sertifikat.", "error");
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
          tags: ["certificates"],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        showToast("Data sertifikat berhasil diperbarui.", "success");
      } else {
        throw new Error();
      }
    } catch {
      showToast("Gagal memperbarui data sertifikat.", "error");
    } finally {
      setRevalidating(false);
    }
  };

  return (
    <div className="mx-auto sm:px-4 max-w-6xl min-h-screen">
      <Header
        dynamicText="Certificates"
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        isRevalidating={isRevalidating}
        ref={searchInputRef}
        isRefreshing={isRefreshing}
        handleRevalidate={handleRevalidate}
        newLink="certificates/add"
      />

      {isLoading ? (
        <div className="text-center py-20 my-20">
          <div className="text-center py-10">
            <div className="flex items-center justify-center ">
              <Loading />
            </div>
          </div>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="text-center py-20 ">
          <p className="text-gray-500">
            {searchKeyword
              ? "Tidak ada sertifikat yang cocok."
              : "Tidak ada sertifikat ditemukan"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate.id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-center">
                  {certificate.desc}
                </CardTitle>
              </CardHeader>

              <Image
                src={certificate.photo}
                alt={certificate.name}
                width={500}
                height={300}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div className="flex items-center justify-start gap-3 pb-5">
                    <span className="text-sm text-gray-500">Status:</span>
                    <StatusDropdown
                      currentStatus={certificate.status}
                      onStatusChange={(newStatus) =>
                        handleStatusUpdate(certificate.id, newStatus)
                      }
                    />
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-500">Terakhir diperbarui:</p>
                    <p>
                      {new Date(certificate.updatedAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-center gap-2">
                <Button
                  variant="ghost2"
                  className="flex items-center gap-2 hover:cursor-pointer text-red-500"
                  onClick={() => handleDelete(certificate.id)}>
                  <Delete size={16} />
                  Hapus
                </Button>

                <Link href={`/admin/certificates/edit/${certificate.id}`}>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300">
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

export default ManageCertificates;
