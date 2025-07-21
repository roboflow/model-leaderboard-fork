"use client"

import { useEffect, useState } from "react"
import { CpuIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ParameterFilterProps {
  minParams: number
  maxParams: number
  selectedRange: [number, number]
  onRangeChange: (range: [number, number]) => void
  onReset: () => void
}

function formatParameters(count: number): string {
  return `${count.toFixed(1)}M`
}

export function ParameterFilter({
  minParams,
  maxParams,
  selectedRange,
  onRangeChange,
  onReset,
}: ParameterFilterProps) {
  const [localRange, setLocalRange] = useState<[number, number]>(selectedRange)
  const [hasUserChanged, setHasUserChanged] = useState(false)

  const isFiltered = hasUserChanged && (selectedRange[0] !== minParams || selectedRange[1] !== maxParams)

  // Update local range when prop changes
  useEffect(() => {
    setLocalRange(selectedRange)
  }, [selectedRange])

  const handleSliderChange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]]
    setLocalRange(newRange)
  }

  const handleSliderCommit = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]]
    setHasUserChanged(true)
    onRangeChange(newRange)
  }

  const handleReset = () => {
    setHasUserChanged(false)
    onReset()
  }

  return (
    <>
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <CpuIcon size={16} />
              Parameters
              {isFiltered && (
                <span className="tag-primary">
                  {formatParameters(selectedRange[0])} - {formatParameters(selectedRange[1])}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel className="text-sm">Filter by Parameter Count</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="p-2 space-y-3">
              {/* Range Display */}
              <div className="flex justify-between text-xs">
                <span className="text-primary-foreground">
                  {formatParameters(localRange[0])}
                </span>
                <span className="text-primary-foreground">
                  {formatParameters(localRange[1])}
                </span>
              </div>

              {/* Slider */}
              <div className="px-2">
                <Slider
                  value={localRange}
                  min={minParams}
                  max={maxParams}
                  step={0.1}
                  onValueChange={handleSliderChange}
                  onValueCommit={handleSliderCommit}
                  className="w-full"
                />
              </div>

              {/* Min/Max Labels */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatParameters(minParams)}</span>
                <span>{formatParameters(maxParams)}</span>
              </div>

            </div>

            {/* Reset Button */}
            <DropdownMenuSeparator />
            <div className="dropdown-footer">

              <Button
                variant="secondary"
                size="xs"
                onClick={handleReset}
                disabled={!isFiltered}
              >
                Reset
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="block sm:hidden">
        <div className="p-2 space-y-3">
              {/* Range Display */}
              <div className="flex justify-between text-xs">
                <span className="text-primary-foreground">
                  {formatParameters(localRange[0])}
                </span>
                <span className="text-primary-foreground">
                  {formatParameters(localRange[1])}
                </span>
              </div>

              {/* Slider */}
              <div className="px-2">
                <Slider
                  value={localRange}
                  min={minParams}
                  max={maxParams}
                  step={0.1}
                  onValueChange={handleSliderChange}
                  onValueCommit={handleSliderCommit}
                  className="w-full"
                />
              </div>

              {/* Min/Max Labels */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatParameters(minParams)}</span>
                <span>{formatParameters(maxParams)}</span>
              </div>

            </div>
      </div>
    </>
  )
}
