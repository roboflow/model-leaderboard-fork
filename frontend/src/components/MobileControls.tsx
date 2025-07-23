"use client"

import * as React from "react"
import { Settings, Filter } from "lucide-react"
import { FadersIcon, FileTextIcon, CircuitryIcon, DatabaseIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/useMobile"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { DropdownFilterSlider } from "@/components/DropdownFilterSlider"
import { ColumnToggle } from "@/components/ColumnToggle"
import { DropdownFilterCheckbox } from "@/components/DropdownFilterCheckbox"
import { DropdownFilterRadio } from "@/components/DropdownFilterRadio"

import { CpuIcon, GaugeIcon } from "@phosphor-icons/react"
import { useRangeFilter } from "@/hooks/useRangeFilter"

interface MobileControlsProps {
  // License filter props
  availableLicenses: string[]
  selectedLicenses: Set<string>
  onLicenseToggle: (license: string) => void
  onClearAllLicenses: () => void
  onSelectAllLicenses: () => void

  // Architecture filter props
  availableArchitectures: string[]
  selectedArchitectures: Set<string>
  onArchitectureToggle: (architecture: string) => void
  onClearAllArchitectures: () => void
  onSelectAllArchitectures: () => void

  // Pretrain datasets filter props
  availablePretrainDatasets: string[]
  selectedPretrainDatasets: Set<string>
  onPretrainDatasetToggle: (dataset: string) => void
  onClearAllPretrainDatasets: () => void
  onSelectAllPretrainDatasets: () => void

  // Parameter filter props
  parameterFilter: ReturnType<typeof useRangeFilter>

  // Dataset filter props
  availableDatasets: string[]
  selectedDataset: string
  onDatasetChange: (dataset: string) => void

  // Column toggle props
  columns: { key: string; label: string; group: string }[]
  visibleColumns: Set<string>
  onToggleColumn: (columnKey: string) => void
  onShowAllColumns: () => void
  onHideAllColumns: () => void
  onResetToDefaults: () => void
}

export function MobileControls({
  availableLicenses,
  selectedLicenses,
  onLicenseToggle,
  onClearAllLicenses,
  onSelectAllLicenses,
  availableArchitectures,
  selectedArchitectures,
  onArchitectureToggle,
  onClearAllArchitectures,
  onSelectAllArchitectures,
  availablePretrainDatasets,
  selectedPretrainDatasets,
  onPretrainDatasetToggle,
  onClearAllPretrainDatasets,
  onSelectAllPretrainDatasets,
  parameterFilter,
  availableDatasets,
  selectedDataset,
  onDatasetChange,
  columns,
  visibleColumns,
  onToggleColumn,
  onShowAllColumns,
  onHideAllColumns,
  onResetToDefaults,
}: MobileControlsProps) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="sm:hidden">
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="inline-flex items-center gap-2 sm:hidden">
          <FadersIcon size={16} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] sm:hidden">
        <DrawerHeader>
          <DrawerTitle>Filters & Column Settings</DrawerTitle>
          <DrawerDescription>
            Customize your view with filters and column visibility options.
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4">
          <div className="space-y-6">
            {/* Filters Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <h3 className="font-semibold">Filters</h3>
              </div>

              <div className="space-y-6">

                  <div className="space-y-6">
                    <label className="text-sm font-medium mb-2 block">Architecture</label>
                    <DropdownFilterCheckbox
                    icon={CircuitryIcon}
                    title="Architecture"
                    label="Filter by Architecture"
                    availableItems={availableArchitectures}
                    selectedItems={selectedArchitectures}
                    onItemToggle={onArchitectureToggle}
                    onClearAll={onClearAllArchitectures}
                    onSelectAll={onSelectAllArchitectures}
                  />

                  <Separator />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Parameters</label>
                    <DropdownFilterSlider
                      icon={CpuIcon}
                      title="Parameters"
                      label="Filter by Parameter Count"
                      formatter={(count) => `${count.toFixed(1)}M`}
                      step={0.1}
                      {...parameterFilter}
                    />
                  </div>
                  <Separator />


                  <div>
                    <label className="text-sm font-medium mb-2 block">Pretrained On</label>
                    <DropdownFilterCheckbox
                      icon={DatabaseIcon}
                      title="Pretrained Datasets"
                      label="Filter by Pretrained Datasets"
                      availableItems={availablePretrainDatasets}
                      selectedItems={selectedPretrainDatasets}
                      onItemToggle={onPretrainDatasetToggle}
                      onClearAll={onClearAllPretrainDatasets}
                      onSelectAll={onSelectAllPretrainDatasets}
                    />
                  </div>
                </div>
                <Separator />

              <div>
                  <label className="text-sm font-medium mb-2 block">License</label>
                  <DropdownFilterCheckbox
                    icon={FileTextIcon}
                    title="License"
                    label="Filter by License"
                    availableItems={availableLicenses}
                    selectedItems={selectedLicenses}
                    onItemToggle={onLicenseToggle}
                    onClearAll={onClearAllLicenses}
                    onSelectAll={onSelectAllLicenses}
                  />
                </div>

                <Separator />
                <div>
                  <label className="text-sm font-medium mb-2 block">Benchmark</label>
                  <DropdownFilterRadio
                    icon={GaugeIcon}
                    title="Benchmark"  
                    label="Select Dataset"
                    availableItems={availableDatasets}
                    selectedItem={selectedDataset}
                    onItemChange={onDatasetChange}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Column Toggle Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <h3 className="font-semibold">Columns</h3>
              </div>

              <ColumnToggle
                columns={columns}
                visibleColumns={visibleColumns}
                onToggleColumn={onToggleColumn}
                onShowAll={onShowAllColumns}
                onHideAll={onHideAllColumns}
                onResetToDefaults={onResetToDefaults}
              />
            </div>

            {/* Close Button */}
            <div className="pt-4">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Done
                </Button>
              </DrawerClose>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
    </div>
  )
}
