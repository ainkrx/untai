"use client"

import Link from "next/link"
import { useState } from "react"
import { CaretDownIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function CategoryToggle({ names }: { names: readonly string[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="relative">
      {open && <div className="fixed inset-0 z-40 hidden md:block" onClick={() => setOpen(false)} />}
      <CollapsibleTrigger render={<Button size="lg" className="w-full" />}>
        Category
        <CaretDownIcon className="transition-transform group-data-panel-open/button:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 grid grid-cols-2 gap-1 md:absolute md:top-full md:z-50 md:w-64 md:rounded-lg md:bg-popover md:p-1 md:shadow-md md:ring-1 md:ring-foreground/10">
        {names.map((name) => (
          <Link
            key={name}
            href={`/search?category=${encodeURIComponent(name)}`}
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
          >
            {name}
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
