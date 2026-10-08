"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Loading from "@/app/_components/Loading";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";
import { Textarea } from "@/components/ui/textarea";

import { VscRefresh } from "react-icons/vsc";
import { SquarePen, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input"; // Import komponen Input
import ProfileSettings from "./ProfileSettings";

interface About {
  id: string;
  about: string;
  what_i_do: string;
  role: string; // Tambahkan properti role
  createdAt: string;
  updatedAt: string;
}

const ManageAbout = () => {
  const { toast, showToast } = useToast();
  const [aboutData, setAboutData] = useState<About | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRevalidating, setRevalidating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAbout, setEditedAbout] = useState({
    about: "",
    what_i_do: "",
    role: "",
  });

  const fetchAboutData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/about");
      if (!response.ok) throw new Error("Gagal memuat data about");
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setAboutData(data.data[0]);
        setEditedAbout({
          about: data.data[0].about,
          what_i_do: data.data[0].what_i_do,
          role: data.data[0].role,
        });
      } else {
        setAboutData(null);
      }
    } catch (err) {
      showToast(`${err}`, "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAboutData();
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
          tags: ["about"],
        }),
      });
      setRevalidating(false);

      const data = await res.json();
      if (data.success) {
        showToast("Static About Data has been revalidated!", "success");
      }
    } catch (err) {
      showToast(`Failed to revalidate: ${err}`, "error");
    }
  };

  const handleUpdate = async () => {
    if (!aboutData) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/about?id=${aboutData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedAbout),
      });

      if (!response.ok) throw new Error("Failed to update data");

      const updated = await response.json();
      setAboutData(updated.data);
      setIsEditing(false);
      showToast("About has been updated successfully!", "success");
    } catch (err) {
      showToast(`Update error: ${err}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto sm:px-4 max-w-6xl">
      <ProfileSettings />
      <div className="sm:my-10">
        <h1 className="text-3xl dark:text-white font-bold">Manage About</h1>
        <p className="text-gray-500 dark:text-white font-medium">
          Kelola data diri kamu dengan rapi dan profesional.
        </p>
      </div>

      <div className="sm:flex gap-3 items-center mb-10">
        <div className="border-b border-gray-300 lg:w-7xl sm:block md:block lg:block hidden" />
        <div className="flex items-center gap-4 p-2 bg-white rounded-lg shadow-sm justify-around">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors rounded-md hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer">
            <VscRefresh
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            onClick={handleRevalidate}
            disabled={isRevalidating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors rounded-md hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer">
            <VscRefresh
              className={`w-5 h-5 ${isRevalidating ? "animate-spin" : ""}`}
            />
            <span>{isRevalidating ? "Revalidating..." : "Revalidate"}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 my-20">
          <Loading />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
          {aboutData && (
            <div>
              <h2 className="text-2xl font-bold mb-4">About Me</h2>
              {!isEditing ? (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold">Role:</h3>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                      {aboutData.role}
                    </p>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold">Tentang Saya:</h3>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                      {aboutData.about}
                    </p>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold">Yang Saya Kerjakan:</h3>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                      {aboutData.what_i_do}
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2">
                    <SquarePen size={16} /> Edit
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label htmlFor="role" className="font-semibold">
                      Role:
                    </label>
                    <Input
                      id="role"
                      value={editedAbout.role}
                      onChange={(e) =>
                        setEditedAbout({
                          ...editedAbout,
                          role: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="about-me" className="font-semibold">
                      Tentang Saya:
                    </label>
                    <Textarea
                      id="about-me"
                      value={editedAbout.about}
                      onChange={(e) =>
                        setEditedAbout({
                          ...editedAbout,
                          about: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="what-i-do" className="font-semibold">
                      Yang Saya Kerjakan:
                    </label>
                    <Textarea
                      id="what-i-do"
                      value={editedAbout.what_i_do}
                      onChange={(e) =>
                        setEditedAbout({
                          ...editedAbout,
                          what_i_do: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdate}
                      className="flex items-center gap-2">
                      <Save size={16} /> Simpan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 text-red-500">
                      <X size={16} /> Batal
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
          {!aboutData && !isLoading && (
            <p className="text-center text-gray-500">
              Belum ada data about. Silakan buat satu data baru.
            </p>
          )}
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ManageAbout;
