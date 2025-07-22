"use client"
import { useState } from "react"
import { RoboflowLogo } from "./RoboflowLogo"
import { ThemeToggle } from "./ThemeToggle"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import Link from "next/link"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ListIcon } from "@phosphor-icons/react"
import { Separator } from "@/components/ui/separator"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="py-4">
      <div className="container-base mx-auto flex justify-between items-center">
        <Link href="https://roboflow.com" className="flex items-center">
          <RoboflowLogo
            className="text-violet-700 dark:text-white h-8 w-auto"
            width={120}
            height={32}
          />
        </Link>

        <div className="hidden sm:flex items-center gap-2 ">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink className="hover:bg-transparent focus:bg-transparent" asChild>
                  <Link href="/">Leaderboard</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="hover:bg-transparent focus:bg-transparent" asChild>
                  <Link href="/methodology">Methodology</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="hover:bg-transparent focus:bg-transparent" asChild>
                  <Link href="/faq">FAQ</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem >
                <NavigationMenuLink className="hover:bg-transparent focus:bg-transparent" asChild>
                  <Link href="https://github.com/roboflow/model-leaderboard" target="_blank">
                    <SiGithub size={16} className="text-foreground" />
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <ThemeToggle />
        </div>
        <div className="sm:hidden">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger><ListIcon size={24} /></PopoverTrigger>
            <PopoverContent className="w-screen md:hidden rounded-none border-none bg-background/10 backdrop-blur-lg text-foreground h-screen px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col gap-0.25">
                <Link className="flex py-4 px-1.5" href="/" onClick={() => setIsOpen(false)}>Leaderboard</Link>
                <Separator />
                <Link className="flex py-4 px-1.5" href="/methodology" onClick={() => setIsOpen(false)}>Methodology</Link>
                <Separator />
                <Link className="flex py-4 px-1.5" href="/faq" onClick={() => setIsOpen(false)}>FAQ</Link>
                <Separator />
                <div className="flex justify-between items-center py-4 px-1.5">
                  <div className="text-sm text-muted-foreground">Appearance</div>
                  <ThemeToggle />
                </div>
                <Separator />
                <div className="flex justify-center items-center py-4 px-1.5">
                  <Link className="py-2 px-1.5" href="https://github.com/roboflow/model-leaderboard" target="_blank" onClick={() => setIsOpen(false)}>
                    <SiGithub size={24} className="text-foreground/60" />
                  </Link>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
