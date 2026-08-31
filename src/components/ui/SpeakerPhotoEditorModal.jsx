import React, { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../common/Button';

const CROPPED_PHOTO_SIZE = 800;

const clampOffset = (value) => Math.max(-100, Math.min(100, value));
const clampCropPercent = (value) => Math.max(50, Math.min(100, value));

const createCroppedPhotoFile = (
  file,
  cropPercent,
  offsetX,
  offsetY,
  rotation,
  flipHorizontal,
  flipVertical
) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const sourceObjectUrl = URL.createObjectURL(file);
    image.onload = () => {
      try {
        const sourceWidth = image.naturalWidth;
        const sourceHeight = image.naturalHeight;
        const normalizedRotation = ((rotation % 360) + 360) % 360;
        const isSideways = normalizedRotation === 90 || normalizedRotation === 270;
        const transformedWidth = isSideways ? sourceHeight : sourceWidth;
        const transformedHeight = isSideways ? sourceWidth : sourceHeight;
        const transformedCanvas = document.createElement('canvas');
        transformedCanvas.width = transformedWidth;
        transformedCanvas.height = transformedHeight;

        const transformedCtx = transformedCanvas.getContext('2d');
        if (!transformedCtx) {
          reject(new Error('Canvas is not supported by this browser.'));
          return;
        }

        transformedCtx.translate(transformedWidth / 2, transformedHeight / 2);
        transformedCtx.rotate((normalizedRotation * Math.PI) / 180);
        transformedCtx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
        transformedCtx.drawImage(
          image,
          -sourceWidth / 2,
          -sourceHeight / 2,
          sourceWidth,
          sourceHeight
        );

        const minDimension = Math.min(transformedWidth, transformedHeight);
        const cropSize = Math.max(
          1,
          Math.round(minDimension * (clampCropPercent(cropPercent) / 100))
        );
        const centerX = transformedWidth / 2;
        const centerY = transformedHeight / 2;
        const maxShiftX = Math.max(0, (transformedWidth - cropSize) / 2);
        const maxShiftY = Math.max(0, (transformedHeight - cropSize) / 2);

        const cropX = Math.max(
          0,
          Math.min(
            transformedWidth - cropSize,
            centerX - cropSize / 2 + (clampOffset(offsetX) / 100) * maxShiftX
          )
        );
        const cropY = Math.max(
          0,
          Math.min(
            transformedHeight - cropSize,
            centerY - cropSize / 2 + (clampOffset(offsetY) / 100) * maxShiftY
          )
        );

        const canvas = document.createElement('canvas');
        canvas.width = CROPPED_PHOTO_SIZE;
        canvas.height = CROPPED_PHOTO_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas is not supported by this browser.'));
          return;
        }

        ctx.drawImage(
          transformedCanvas,
          cropX,
          cropY,
          cropSize,
          cropSize,
          0,
          0,
          CROPPED_PHOTO_SIZE,
          CROPPED_PHOTO_SIZE
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Unable to process image.'));
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          resolve(new File([blob], `${baseName}-cropped.jpg`, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.92);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(sourceObjectUrl);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceObjectUrl);
      reject(new Error('Unable to load selected image.'));
    };
    image.src = sourceObjectUrl;
  });

const SpeakerPhotoEditorModal = ({
  isOpen,
  sourceFile,
  onCancel,
  onApply,
  onError,
  title = 'Adjust speaker photo',
  description = 'Crop, rotate, or flip the image before saving.',
  previewAlt = 'Photo crop preview',
  applyLabel = 'Use Photo'
}) => {
  const [cropPercent, setCropPercent] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const previewContainerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const sourceUrl = useMemo(
    () => (sourceFile ? URL.createObjectURL(sourceFile) : ''),
    [sourceFile]
  );

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  useEffect(() => {
    if (!isOpen) return;
    setCropPercent(100);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setIsDragging(false);
  }, [isOpen, sourceFile]);

  const handleMouseDown = (event) => {
    event.preventDefault();
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX,
      offsetY
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return undefined;

    const onMove = (event) => {
      if (!previewContainerRef.current) return;
      const rect = previewContainerRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const deltaX = event.clientX - dragStartRef.current.x;
      const deltaY = event.clientY - dragStartRef.current.y;
      const nextX = dragStartRef.current.offsetX + (deltaX / rect.width) * 100;
      const nextY = dragStartRef.current.offsetY + (deltaY / rect.height) * 100;
      setOffsetX(clampOffset(nextX));
      setOffsetY(clampOffset(nextY));
    };

    const onUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  const handleApply = async () => {
    if (!sourceFile) return;
    try {
      const croppedFile = await createCroppedPhotoFile(
        sourceFile,
        cropPercent,
        offsetX,
        offsetY,
        rotation,
        flipHorizontal,
        flipVertical
      );
      onApply?.(croppedFile);
    } catch (error) {
      onError?.(error);
    }
  };

  if (!isOpen || !sourceFile) return null;
  const previewCropScale = 100 / cropPercent;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/60">
      <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto p-6">
        <h4 className="text-lg font-semibold text-[#02949D]">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>

        <div
          ref={previewContainerRef}
          className="mt-4 mx-auto w-[320px] h-[320px] rounded-xl overflow-hidden bg-gray-100 relative cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          {sourceUrl && (
            <img
              src={sourceUrl}
              alt={previewAlt}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: `translate(${offsetX}%, ${offsetY}%) rotate(${rotation}deg) scale(${flipHorizontal ? -previewCropScale : previewCropScale}, ${flipVertical ? -previewCropScale : previewCropScale})`,
                transformOrigin: 'center center'
              }}
            />
          )}
          <div className="absolute inset-0 border-2 border-white/90 rounded-xl pointer-events-none shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.08)]" />
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Crop size ({cropPercent}%)
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="1"
              value={cropPercent}
              onChange={(e) => setCropPercent(clampCropPercent(Number(e.target.value)))}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRotation((prev) => (prev + 270) % 360)}
            >
              Rotate Left
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
            >
              Rotate Right
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFlipHorizontal((prev) => !prev)}
            >
              Flip H
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFlipVertical((prev) => !prev)}
            >
              Flip V
            </Button>
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Horizontal position ({Math.round(offsetX)}%)
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={offsetX}
            onChange={(e) => setOffsetX(clampOffset(Number(e.target.value)))}
            className="w-full"
          />
          <label className="block text-sm font-medium text-gray-700">
            Vertical position ({Math.round(offsetY)}%)
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={offsetY}
            onChange={(e) => setOffsetY(clampOffset(Number(e.target.value)))}
            className="w-full"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 sticky bottom-0 bg-white pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleApply}>
            {applyLabel}
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SpeakerPhotoEditorModal;
