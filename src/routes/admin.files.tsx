import { createFileRoute } from "@tanstack/react-router";
import { Upload, Copy, Trash2, FileText, FileImage, FileArchive, Loader2, X, UploadCloud, RefreshCw, Check } from "lucide-react";
import { PageHeader, Card, Btn, ConfirmModal } from "@/components/admin/ui";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, API_BASE_URL } from "@/lib/api";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/files")({ component: Files });

function Files() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: files, isLoading, error } = useQuery({
    queryKey: ["admin-files"],
    queryFn: api.admin.getFiles,
  });

  console.log("[Files] Data:", files);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-files"] });
      toast.success("File deleted");
      setDeleteId(null);
    },
    onError: (err: Error) => {
      toast.error(`Delete failed: ${err.message}`);
      setDeleteId(null);
    }
  });

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.admin.uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-files"] });
      toast.success("File uploaded successfully");
      setIsUploadOpen(false);
    },
    onError: (err: Error) => toast.error(`Upload failed: ${err.message}`)
  });

  const replaceMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => api.admin.replaceFile(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-files"] });
      toast.success("File replaced successfully");
    },
    onError: (err: Error) => toast.error(`Replace failed: ${err.message}`)
  });

  const handleFile = (file: File) => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const getIcon = (mime: string) => {
    if (mime?.startsWith("image/")) return FileImage;
    if (mime?.includes("zip") || mime?.includes("archive") || mime?.includes("octet-stream")) return FileArchive;
    return FileText;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Files" subtitle="CDN-powered file manager."
        action={<Btn onClick={() => setIsUploadOpen(true)}><Upload size={14} /> Upload</Btn>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files?.map((f: any) => {
          const Icon = getIcon(f.mime_type);
          const baseUrl = API_BASE_URL.replace("/api/v1", "");
          const downloadUrl = `${baseUrl}/uploads/${f.filename}`;

          return (
            <Card key={f.id} className="group hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary border border-primary/10 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500">
                  <Icon size={24} />
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <div className="truncate font-bold tracking-tight text-foreground/90">{f.filename}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{formatSize(f.file_size)}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-tighter">{f.mime_type?.split('/')[1] || "file"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.04] p-2 px-3 h-10">
                   <span className="flex-1 truncate font-mono text-[10px] text-muted-foreground/60 select-all cursor-text">{downloadUrl}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                <Btn variant="primary" className="justify-center h-10 px-0" onClick={() => window.open(downloadUrl, '_blank')} title="Download File">
                  <Upload size={14} className="rotate-180" />
                </Btn>
                <Btn variant="outline" className="justify-center h-10 px-0" onClick={() => {
                   const copyToClipboard = (text: string) => {
                     if (navigator.clipboard && window.isSecureContext) {
                       navigator.clipboard.writeText(text).then(() => toast.success("Link copied"));
                     } else {
                       const textArea = document.createElement("textarea");
                       textArea.value = text;
                       document.body.appendChild(textArea);
                       textArea.select();
                       try {
                         document.execCommand('copy');
                         toast.success("Link copied");
                       } catch (err) {
                         toast.error("Failed to copy link");
                       }
                       document.body.removeChild(textArea);
                     }
                   };
                   copyToClipboard(downloadUrl);
                }} title="Copy Link">
                  <Copy size={14} />
                </Btn>
                <Btn variant="outline" className="justify-center h-10 px-0" onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) replaceMutation.mutate({ id: f.id, file });
                  };
                  input.click();
                }} disabled={replaceMutation.isPending} title="Update File">
                  {replaceMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                </Btn>
                <Btn variant="ghost" className="justify-center h-10 px-0 text-red-500/70 hover:bg-red-500/10 hover:text-red-500" onClick={() => setDeleteId(f.id)} disabled={deleteMutation.isPending}>
                  <Trash2 size={14} />
                </Btn>
              </div>
            </Card>
          );
        })}
        {files?.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No files uploaded yet.
          </div>
        )}
      </div>

      <FileUploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUpload={handleFile}
        loading={uploadMutation.isPending}
      />

      <ConfirmModal 
        isOpen={deleteId !== null} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone and the link will stop working."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function FileUploadModal({ isOpen, onClose, onUpload, loading }: { isOpen: boolean; onClose: () => void; onUpload: (file: File) => void; loading: boolean }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-md rounded-2xl p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Upload File</h3>
              <button onClick={onClose} className="rounded-lg p-2 hover:bg-card"><X size={16} /></button>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border/60 hover:border-primary/40 hover:bg-card/30"}`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <UploadCloud size={32} className={loading ? "animate-bounce" : ""} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">Drag and drop file here</p>
                <p className="mt-1 text-xs text-muted-foreground">Or click to browse from your computer</p>
              </div>
              <input type="file" ref={inputRef} className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
              <Btn className="mt-6" onClick={() => inputRef.current?.click()} disabled={loading}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Choose File"}
              </Btn>
            </div>
            
            <p className="mt-4 text-[10px] text-center text-muted-foreground">Maximum file size: 50MB. Supported formats: .zip, .exe, .dll, .txt, .png, .jpg</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CopyBtn({ value, label, minimal }: { value: string; label: string; minimal?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(String(value)).then(() => {
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (minimal) {
    return (
      <button onClick={copy} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-all">
        {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
      </button>
    );
  }

  return (
    <Btn variant="outline" className="flex-1 justify-center" onClick={copy}>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div key="check" className="flex items-center gap-1.5" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
            <Check size={12} className="text-primary" /> Copied
          </motion.div>
        ) : (
          <motion.div key="copy" className="flex items-center gap-1.5" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
            <Copy size={12} /> Copy ID
          </motion.div>
        )}
      </AnimatePresence>
    </Btn>
  );
}
