import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Upload, X, RotateCcw, Check, ImageIcon, ZoomIn, ZoomOut } from 'lucide-react'

interface Props {
  value: string          // base64 or URL — current logo value
  onChange: (value: string) => void
}

const ASPECT_RATIOS: { label: string; value: number | undefined }[] = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:1', value: 3 },
]

const OUTPUT_SIZES = [
  { label: '128 px', value: 128 },
  { label: '256 px', value: 256 },
  { label: '512 px', value: 512 },
]

function centerAspectCrop(width: number, height: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, aspect, width, height),
    width,
    height
  )
}

function getCroppedCanvas(image: HTMLImageElement, crop: PixelCrop, outputSize: number): string {
  const canvas = document.createElement('canvas')
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  // Preserve crop aspect ratio in the output dimensions, bounded by outputSize
  const cropAspect = crop.width / crop.height
  const outW = cropAspect >= 1 ? outputSize : Math.round(outputSize * cropAspect)
  const outH = cropAspect < 1 ? outputSize : Math.round(outputSize / cropAspect)

  canvas.width = outW
  canvas.height = outH

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    outW,
    outH
  )
  return canvas.toDataURL('image/png')
}

export default function ImageCropUploader({ value, onChange }: Props) {
  const [phase, setPhase] = useState<'idle' | 'cropping' | 'done'>(value ? 'done' : 'idle')
  const [rawSrc, setRawSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [aspectKey, setAspectKey] = useState(1)
  const [outputSize, setOutputSize] = useState(256)
  const [outputDims, setOutputDims] = useState<{ w: number; h: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keep phase in sync with value if it changes externally (e.g. switching items to edit)
  useEffect(() => {
    if (value) {
      setPhase('done')
    } else {
      setPhase('idle')
    }
  }, [value])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setRawSrc(e.target?.result as string)
      setPhase('cropping')
      setCrop(undefined)
      setCompletedCrop(undefined)
    }
    reader.readAsDataURL(file)
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const aspect = ASPECT_RATIOS[aspectKey].value
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect))
    } else {
      setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 })
    }
  }, [aspectKey])

  const handleAspectChange = (idx: number) => {
    setAspectKey(idx)
    if (!imgRef.current) return
    const { width, height } = imgRef.current
    const aspect = ASPECT_RATIOS[idx].value
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect))
    } else {
      setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 })
    }
  }

  const handleApply = () => {
    if (!completedCrop || !imgRef.current) return
    const cropAspect = completedCrop.width / completedCrop.height
    const outW = cropAspect >= 1 ? outputSize : Math.round(outputSize * cropAspect)
    const outH = cropAspect < 1 ? outputSize : Math.round(outputSize / cropAspect)
    setOutputDims({ w: outW, h: outH })
    const dataUrl = getCroppedCanvas(imgRef.current, completedCrop, outputSize)
    onChange(dataUrl)
    setPhase('done')
  }

  const handleReCrop = () => {
    // Restore rawSrc from the current value if needed (e.g. editing an existing logo)
    if (!rawSrc && value) setRawSrc(value)
    setPhase('cropping')
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  const handleReset = () => {
    onChange('')
    setRawSrc('')
    setPhase('idle')
    setOutputDims(null)
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  // ── Drop zone ──────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        className={`
          relative flex flex-col items-center justify-center gap-3 w-full h-36 rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200
          ${dragging
            ? 'border-primary-500 bg-primary-500/10 scale-[1.01]'
            : 'border-stone-300 dark:border-stone-700 hover:border-primary-400 hover:bg-stone-50 dark:hover:bg-stone-800/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
        />
        <div className={`p-3 rounded-full transition-colors ${dragging ? 'bg-primary-500/20' : 'bg-stone-100 dark:bg-stone-800'}`}>
          <Upload className="w-5 h-5 text-primary-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
            {dragging ? 'Drop it here!' : 'Click or drag & drop logo'}
          </p>
          <p className="text-xs text-stone-400 mt-0.5">PNG, JPG, SVG, WEBP</p>
        </div>
      </div>
    )
  }

  // ── Cropper ────────────────────────────────────────────────────────────────
  if (phase === 'cropping') {
    return (
      <div className="rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden bg-stone-50 dark:bg-stone-900">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
          {/* Aspect ratio pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-stone-500 mr-1">Ratio</span>
            {ASPECT_RATIOS.map((r, i) => (
              <button
                key={r.label}
                type="button"
                onClick={() => handleAspectChange(i)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  aspectKey === i
                    ? 'bg-primary-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Output size */}
          <div className="flex items-center gap-1.5">
            <ZoomOut className="w-3.5 h-3.5 text-stone-400" />
            {OUTPUT_SIZES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setOutputSize(s.value)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  outputSize === s.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {s.label}
              </button>
            ))}
            <ZoomIn className="w-3.5 h-3.5 text-stone-400" />
          </div>
        </div>

        {/* Crop canvas */}
        <div className="flex items-center justify-center p-4 max-h-[340px] overflow-auto bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={ASPECT_RATIOS[aspectKey].value}
            minWidth={20}
            minHeight={20}
          >
            <img
              ref={imgRef}
              src={rawSrc}
              alt="crop preview"
              onLoad={onImageLoad}
              style={{ maxHeight: '300px', maxWidth: '100%', display: 'block' }}
            />
          </ReactCrop>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Start over
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!completedCrop}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Apply crop
          </button>
        </div>
      </div>
    )
  }

  // ── Done (preview) ─────────────────────────────────────────────────────────
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
      <div className="w-16 h-16 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 flex-shrink-0 bg-white dark:bg-stone-800 flex items-center justify-center">
        {value ? (
          <img src={value} alt="logo preview" className="w-full h-full object-contain" />
        ) : (
          <ImageIcon className="w-6 h-6 text-stone-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Logo ready</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {outputDims ? `${outputDims.w}×${outputDims.h} px PNG` : `~${outputSize} px PNG`}
          {' · '}Will upload with the form
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleReCrop}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-primary-200 dark:border-primary-800 transition-colors"
        >
          Re‑crop
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
