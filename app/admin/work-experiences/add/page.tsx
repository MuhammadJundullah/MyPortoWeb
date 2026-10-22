"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/app/login/_components/Toast";
import Loading from "@/app/_components/Loading";
import BackButton from "@/app/admin/_components/BackButton";
import TextInput from "@/app/admin/_components/TextInput";
import SelectInput from "@/app/admin/_components/SelectInput";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export default function AddWorkExperience() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        submitRef.current?.click();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [experience, setExperience] = useState({
    company_name: "",
    position: "",
    duration: "",
    type: "",
  });

  const [jobdesks, setJobdesks] = useState<string[]>([""]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setExperience((prev) => ({ ...prev, [name]: value }));
  };

  const handleJobdeskChange = (index: number, value: string) => {
    const updatedJobdesks = [...jobdesks];
    updatedJobdesks[index] = value;
    setJobdesks(updatedJobdesks);
  };

  const addJobdesk = () => {
    setJobdesks([...jobdesks, ""]);
  };

  const removeJobdesk = (index: number) => {
    if (jobdesks.length > 1) {
      const updatedJobdesks = jobdesks.filter((_, i) => i !== index);
      setJobdesks(updatedJobdesks);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi jobdesks
    const validJobdesks = jobdesks.filter((jd) => jd.trim() !== "");
    if (validJobdesks.length === 0) {
      showToast("Minimal harus ada satu uraian pekerjaan.", "error");
      return;
    }

    if (
      !window.confirm("Apakah Anda yakin ingin menambahkan pengalaman kerja?")
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        company_name: experience.company_name,
        position: experience.position,
        duration: experience.duration,
        type: experience.type,
        jobdesks: validJobdesks.map((desc) => ({ description: desc })),
      };

      const response = await fetch("/api/work-experiences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) throw new Error();

      showToast("Pengalaman kerja berhasil ditambahkan.", "success");

      // Redirect setelah 1.5 detik
      setTimeout(() => {
        router.push("/admin/work-experiences");
      }, 1500);
    } catch {
      setIsLoading(false);
      showToast("Gagal menambahkan pengalaman kerja.", "error");
    }
  };

  const typeOptions = [
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Contract", label: "Contract" },
    { value: "Freelance", label: "Freelance" },
    { value: "Internship", label: "Internship" },
  ];

  return (
    <div className="sm:mx-auto sm:w-6xl flex flex-col justify-center text-black">
      <div>
        <BackButton href="/admin/work-experiences" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-screen w-full">
          <Loading />
        </div>
      ) : (
        <form className="py-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-8">
            <TextInput
              id="company_name"
              label="Nama Perusahaan"
              type="text"
              name="company_name"
              value={experience.company_name}
              onChange={handleChange}
              placeholder="PT Teknologi Indonesia"
              required
            />

            <TextInput
              id="position"
              label="Posisi"
              type="text"
              name="position"
              value={experience.position}
              onChange={handleChange}
              placeholder="Senior Frontend Developer"
              required
            />

            <TextInput
              id="duration"
              label="Duration"
              type="text"
              name="duration"
              value={experience.duration}
              onChange={handleChange}
              placeholder="Jan 2023 - Present"
              required
            />

            <SelectInput
              id="type"
              label="Tipe Pekerjaan"
              name="type"
              value={experience.type}
              onChange={handleChange}
              options={typeOptions}
              placeholder="Pilih tipe pekerjaan"
              required
            />

            {/* Jobdesks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Job Descriptions
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addJobdesk}
                  className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Jobdesk
                </Button>
              </div>

              {jobdesks.map((jobdesk, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <TextInput
                      id={`jobdesk-${index}`}
                      label=""
                      type="text"
                      name={`jobdesk-${index}`}
                      value={jobdesk}
                      onChange={(e) =>
                        handleJobdeskChange(index, e.target.value)
                      }
                      placeholder={`Jobdesk ${index + 1}`}
                      required={index === 0}
                    />
                  </div>
                  {jobdesks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJobdesk(index)}
                      className="mt-6 text-red-500 hover:text-red-700 hover:bg-red-50">
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <SubmitButton
            ref={submitRef}
            label="Tambah Work Experience"
            onClick={handleSubmit}
          />
        </form>
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
