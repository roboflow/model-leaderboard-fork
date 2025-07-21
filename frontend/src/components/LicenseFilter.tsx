"use client"

import * as React from "react"
import { FileTextIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { MobileCheckboxItem } from "@/components/MobileCheckboxItem"

interface LicenseFilterProps {
  availableLicenses: string[]
  selectedLicenses: Set<string>
  onLicenseToggle: (license: string) => void
  onClearAll: () => void
  onSelectAll: () => void
}

export function LicenseFilter({
  availableLicenses,
  selectedLicenses,
  onLicenseToggle,
  onClearAll,
  onSelectAll,
}: LicenseFilterProps) {
  const activeCount = selectedLicenses.size
  const totalCount = availableLicenses.length

  return (
    <>
      <div className="hidden sm:block">
        <DropdownMenu >
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileTextIcon size={16} />
              License
              {activeCount > 0 && activeCount < totalCount && (
                <div className="flex gap-1 flex-wrap">
                  {Array.from(selectedLicenses).map((license) => (
                    <span
                      key={license}
                      className="tag-primary"
                    >
                      {license}
                    </span>
                  ))}
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Filter by License</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* License options */}
            <div className="max-h-64 overflow-y-auto">
              {availableLicenses.map((license) => (
                  <DropdownMenuCheckboxItem
                    key={license}
                    checked={selectedLicenses.has(license)}
                    onCheckedChange={() => onLicenseToggle(license)}
                    onSelect={(e) => {
                      // prevent menu from closing on click
                      e.preventDefault()
                    }}
                    className="[&_svg]:text-primary-foreground"
                  >
                    {license}
                  </DropdownMenuCheckboxItem>
              ))}
            </div>

            {/* Reset Button */}
            <DropdownMenuSeparator />
            <div className="dropdown-footer">
              <Button
                variant="secondary"
                size="xs"
                onClick={onClearAll}
                disabled={activeCount === 0}
              >
                Reset
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="block sm:hidden space-y-1">
        {availableLicenses.map((license) => (
          <MobileCheckboxItem
          key={license}
          selected={selectedLicenses.has(license)}
          onSelect={() => onLicenseToggle(license)}
        >
          {license}
        </MobileCheckboxItem>
        ))}
      </div>
    </>
  )
}
