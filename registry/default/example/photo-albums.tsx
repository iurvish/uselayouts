"use client"

import React, { useState, useId } from "react"
import { motion, LayoutGroup, AnimatePresence } from "motion/react"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface Photo {
  id: string
  src: string
}

interface Collection {
  id: string
  title: string
  subtitle: string
  photos: Photo[]
}

const COLLECTIONS: Collection[] = [
  {
    id: "c1",
    title: "Travel & Exploration",
    subtitle: "Private",
    photos: [
      {
        id: "p1-1",
        src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p1-2",
        src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p1-3",
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p1-4",
        src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p1-5",
        src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p1-6",
        src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "c2",
    title: "Industrial Design",
    subtitle: "Private",
    photos: [
      {
        id: "p2-1",
        src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p2-2",
        src: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p2-3",
        src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p2-4",
        src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p2-5",
        src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p2-6",
        src: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "c3",
    title: "Modern Architecture",
    subtitle: "Private",
    photos: [
      {
        id: "p3-1",
        src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p3-2",
        src: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p3-3",
        src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p3-4",
        src: "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        id: "p3-5",
        src: "https://plus.unsplash.com/premium_photo-1676657954811-9409c4830467?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        id: "p3-6",
        src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "c4",
    title: "Abstract Art",
    subtitle: "Public",
    photos: [
      {
        id: "p4-1",
        src: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p4-2",
        src: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p4-3",
        src: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p4-4",
        src: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "p4-5",
        src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
]

const transition = {
  type: "spring" as const,
  stiffness: 280,
  damping: 32,
  mass: 1,
}

export default function PhotoAlbums() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const layoutGroupId = useId()

  const selectedCollection = COLLECTIONS.find((c) => c.id === selectedId)

  return (
    <div className="min-h-[720px] overflow-x-hidden bg-[#fafafa] py-16 font-sans text-[#111111] selection:bg-black/5">
      <LayoutGroup id={layoutGroupId}>
        <motion.div className="flex min-h-screen flex-col">
          <main className="mx-auto w-full max-w-md flex-grow px-8 pb-32">
            <div className="grid grid-cols-2 gap-x-12 gap-y-24">
              {COLLECTIONS.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onClick={() => setSelectedId(collection.id)}
                  isExpanded={selectedId === collection.id}
                />
              ))}
            </div>
          </main>
        </motion.div>

        <AnimatePresence>
          {selectedId && selectedCollection && (
            <motion.div
              key="details-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto bg-[#fafafa] px-8 pt-24 pb-48"
              transition={{ duration: 0.25 }}
            >
              <div className="relative mx-auto max-w-md">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedId(null)}
                  className="mb-12 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-sm ring-1 ring-black/[0.03] transition-transform active:scale-95"
                >
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </motion.button>

                <div className="mb-6 px-1">
                  <motion.h2
                    layoutId={`title-${selectedId}`}
                    className="text-3xl leading-tight font-medium tracking-tight text-black"
                  >
                    {selectedCollection.title}
                  </motion.h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {selectedCollection.photos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      layoutId={`photo-${photo.id}`}
                      className="aspect-square overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04]"
                      transition={transition}
                    >
                      <img
                        src={photo.src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  )
}

const CollectionCard = ({
  collection,
  onClick,
  isExpanded,
}: {
  collection: Collection
  onClick: () => void
  isExpanded: boolean
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex cursor-pointer flex-col items-center outline-none select-none",
        isExpanded ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="relative mb-3 flex aspect-square w-full items-center justify-center">
        {/* The Stack (Increased image size to w-32) */}
        {collection.photos.slice(0, 3).map((photo, i) => {
          const rotations = [-14, 14, 0]
          const xOffsets = [-35, 35, 0]
          const yOffsets = [-2, -2, 0]
          const zIndexes = [10, 11, 20]

          return (
            <motion.div
              key={photo.id}
              layoutId={`photo-${photo.id}`}
              className="absolute h-34 w-34 overflow-hidden rounded-3xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
              // style={{
              //   zIndex: zIndexes[i],
              // }}
              animate={{
                rotate: rotations[i],
              }}
              whileHover={{
                scale: 1.05,
                y: yOffsets[i] - 5,
                transition: { duration: 0.2 },
              }}
              transition={transition}
            >
              <img
                src={photo.src}
                alt=""
                className="pointer-events-none h-full w-full object-cover select-none"
              />
            </motion.div>
          )
        })}
      </div>
      <div className="px-2 text-center">
        <motion.h3
          layoutId={`title-${collection.id}`}
          layout
          className="text-base font-medium tracking-tight text-black/80"
        >
          {collection.title}
        </motion.h3>
      </div>
    </div>
  )
}
