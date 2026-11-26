"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touch = useRef(0);
  const [index, setIndex] = useState(0);
  const step = (n: number) =>
    setIndex((i) => (i + n + images.length) % images.length);
  function close() {
    dialog.current?.close();
    opener.current?.focus();
  }
  if (!images.length)
    return (
      <div className="empty-media">
        <Maximize2 size={24} />
        <p>App screenshots have not been added yet.</p>
      </div>
    );
  return (
    <>
      <div className="screenshot-rail">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            aria-label={`Open screenshot ${i + 1}`}
            onClick={(e) => {
              opener.current = e.currentTarget;
              setIndex(i);
              dialog.current?.showModal();
            }}
          >
            <Image
              src={src}
              alt={`${name} screenshot ${i + 1}`}
              width={280}
              height={500}
              sizes="(max-width: 600px) 65vw, 250px"
            />
            <span>
              <Maximize2 size={15} /> Preview
            </span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="image-dialog"
        aria-label={`${name} screenshots`}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="lightbox-toolbar">
          <span>
            {index + 1} / {images.length}
          </span>
          <button onClick={close} aria-label="Close preview">
            <X />
          </button>
        </div>
        <div
          className="lightbox-stage"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(delta) > 45) step(delta < 0 ? 1 : -1);
          }}
        >
          <Image
            src={images[index]}
            alt={`${name} screenshot ${index + 1}`}
            fill
            sizes="95vw"
          />
          <button
            className="gallery-prev"
            onClick={() => step(-1)}
            aria-label="Previous screenshot"
          >
            <ChevronLeft />
          </button>
          <button
            className="gallery-next"
            onClick={() => step(1)}
            aria-label="Next screenshot"
          >
            <ChevronRight />
          </button>
        </div>
        {images.length > 1 && (
          <div
            className="gallery-thumbnails"
            role="group"
            aria-label="Choose screenshot"
          >
            {images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                aria-label={`Show screenshot ${i + 1}`}
                aria-current={index === i}
                onClick={() => setIndex(i)}
              >
                <Image src={src} alt="" width={35} height={42} />
              </button>
            ))}
          </div>
        )}
        <p className="gallery-hint">Swipe or use ← → · Escape to close</p>
      </dialog>
    </>
  );
}
