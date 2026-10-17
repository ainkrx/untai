import Link from "next/link"
import { headers } from "next/headers"
import { CaretDownIcon, ListIcon, MagnifyingGlassIcon, UserIcon } from "@phosphor-icons/react/dist/ssr"

import { auth } from "@/lib/auth"
import { category } from "@/lib/schema/app"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

function SearchBar() {
  return (
    <form action="/search" className="flex w-full gap-2">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-secondary-foreground" />
        <Input
          name="q"
          type="search"
          placeholder="Search patterns"
          className="h-8 border-transparent bg-secondary pl-8 text-secondary-foreground placeholder:text-secondary-foreground/70"
        />
      </div>
      <Button type="submit" size="lg">
        <MagnifyingGlassIcon className="size-4" />
      </Button>
    </form>
  )
}

function CategoryList() {
  return (
    <Collapsible className="relative">
      <CollapsibleTrigger render={<Button size="lg" className="w-full" />}>
        Category
        <CaretDownIcon className="transition-transform group-data-panel-open/button:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 grid grid-cols-2 gap-1 md:absolute md:top-full md:z-50 md:w-64 md:rounded-lg md:bg-popover md:p-1 md:shadow-md md:ring-1 md:ring-foreground/10">
        {category.enumValues.map((name) => (
          <Link
            key={name}
            href={`/search?category=${encodeURIComponent(name)}`}
            className="rounded-md px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
          >
            {name}
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user ?? null

  return (
    <header className="border-b bg-card">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 md:grid md:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-2 md:justify-self-start">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="-ml-2" />}>
              <ListIcon className="size-5" />
              <span className="sr-only">Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="gap-3 p-4">
              <SheetTitle>untai</SheetTitle>
              <div className="flex flex-col gap-3 md:hidden">
                <SearchBar />
                <CategoryList />
              </div>
              <Link href="/about" className={buttonVariants({ size: "lg", className: "w-full" })}>
                About
              </Link>
              {user && (
                <Link href="/patterns/new" className={buttonVariants({ size: "lg", className: "w-full" })}>
                  Add Pattern
                </Link>
              )}
            </SheetContent>
          </Sheet>
          
          <Link href="/" className="text-base font-medium">
            untai
          </Link>
        </div>
        <div className="hidden w-3xl items-center gap-2 md:flex">
          <div className="flex-1">
            <SearchBar />
          </div>
          <CategoryList />
        </div>
        <div className="ml-auto md:justify-self-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              <Avatar>
                {user?.image && <AvatarImage src={user.image} alt="" />}
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <UserIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Profile</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {user ? (
                <>
                  <DropdownMenuItem render={<Link href="/my/patterns" />}>My patterns</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/my/reviews" />}>My reviews</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/settings" />}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem render={<Link href="/login" />}>Login</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/register" />}>Register</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  )
}
