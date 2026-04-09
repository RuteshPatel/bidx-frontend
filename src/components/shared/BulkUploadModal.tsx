import { useState } from 'react'
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface BulkUploadModalProps {
  open: boolean
  onClose: () => void
  onUpload: (file: File) => Promise<void>
  title: string
  templateUrl?: string
}

export default function BulkUploadModal({ open, onClose, onUpload, title, templateUrl }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.type !== 'text/csv' && !selected.name.endsWith('.csv') && !selected.name.endsWith('.xlsx')) {
        toast.error('Please upload a CSV or Excel file')
        return
      }
      setFile(selected)
      setStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file)
      setStatus('success')
      toast.success('File uploaded successfully')
      setTimeout(() => {
        onClose()
        setFile(null)
        setStatus('idle')
      }, 1500)
    } catch (err) {
      setStatus('error')
      toast.error('Upload failed. Please check the file format.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div
          className={`
            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all
            ${file ? 'border-brand-500/40 bg-brand-500/5' : 'border-stone-800 hover:border-stone-700 bg-stone-900/50'}
          `}
        >
          {file ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mb-3">
                <FileText className="text-brand-400" size={24} />
              </div>
              <p className="text-stone-100 font-medium text-sm mb-1">{file.name}</p>
              <p className="text-stone-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={() => setFile(null)}
                className="mt-4 text-xs text-stone-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                disabled={uploading}
              >
                <X size={12} /> Remove file
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center mb-3 group-hover:bg-stone-700 transition-colors">
                <Upload className="text-stone-400 group-hover:text-stone-200" size={24} />
              </div>
              <p className="text-stone-300 font-medium text-sm mb-1">Click to upload or drag and drop</p>
              <p className="text-stone-500 text-xs">CSV or Excel (max. 10MB)</p>
              <input type="file" className="hidden" onChange={handleFileChange} accept=".csv, .xlsx" />
            </label>
          )}
        </div>

        {templateUrl && (
          <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center">
                <FileText size={16} className="text-stone-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-200">Need a template?</p>
                <p className="text-[10px] text-stone-500">Download the sample file structure</p>
              </div>
            </div>
            <a
              href={templateUrl}
              download
              className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              Download
            </a>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1" disabled={uploading}>
            Cancel
          </Button>
          <Button
            loading={uploading}
            disabled={!file || status === 'success'}
            onClick={handleUpload}
            className="flex-1"
          >
            {status === 'success' ? (
              <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Success</span>
            ) : status === 'error' ? (
              <span className="flex items-center gap-2"><AlertCircle size={16} /> Try Again</span>
            ) : (
              'Upload & Import'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
