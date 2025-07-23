"use client"

import * as React from "react"
import { GaugeIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MobileRadioItem } from "@/components/MobileRadioItem"

interface BenchmarkFilterProps {
  availableDatasets: string[]
  selectedDataset: string
  onDatasetChange: (dataset: string) => void
}

export function BenchmarkFilter({
  availableDatasets,
  selectedDataset,
  onDatasetChange,
}: BenchmarkFilterProps) {
  return (
    <>
      {/* Desktop Version */}
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-foreground/80">
              <GaugeIcon size={16} />
              Benchmark
              <span className="tag-primary">
                {selectedDataset}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Select Dataset</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="p-2">
              <RadioGroup
                value={selectedDataset}
                onValueChange={onDatasetChange}
                className="gap-2"
              >
                {availableDatasets.map((dataset) => (
                  <div key={dataset} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={dataset}
                      id={dataset}
                      className="shrink-0"
                    />
                    <label
                      htmlFor={dataset}
                      className="flex items-center cursor-pointer flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span>{dataset}</span>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Version */}
      <div className="block sm:hidden space-y-1">
        {availableDatasets.map((dataset) => (
          <MobileRadioItem
            key={dataset}
            selected={selectedDataset === dataset}
            onSelect={() => onDatasetChange(dataset)}
          >
            {dataset}
          </MobileRadioItem>
        ))}
      </div>
    </>
  )
}
