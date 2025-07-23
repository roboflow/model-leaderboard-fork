"use client"

import { Table, TableBody, TableHeader, TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/SearchInput"
import { ColumnToggle } from "@/components/ColumnToggle"
import { SortableTableHeader } from "@/components/SortableTableHeader"
import { ModelTableRow } from "@/components/ModelTableRow"
import { useState, useMemo, useEffect } from "react"

import { useRangeFilter } from "@/hooks/useRangeFilter"
import { useUniqueValues } from "@/hooks/useUniqueValues"
import { useSetFilter } from "@/hooks/useSetFilter"
import { useColumnManager } from "@/hooks/useColumnManager"
import { DropdownFilterSlider } from "@/components/DropdownFilterSlider"
import { DropdownFilterRadio } from "@/components/DropdownFilterRadio"

import aggregateResults from "@/data/aggregate_results.json"
import { Separator } from "@/components/ui/separator"
import { MobileControls } from "@/components/MobileControls"
import { DropdownFilterCheckbox } from "@/components/DropdownFilterCheckbox"
import { CircuitryIcon, FileTextIcon, DatabaseIcon, CpuIcon, GaugeIcon, ArrowSquareOutIcon, HeartIcon } from "@phosphor-icons/react"
import { formatters } from "@/lib/formatters"
import { SkeletonTable } from "@/components/SkeletonTable"

type SortDirection = "asc" | "desc" | null

interface ModelResult {
  metadata: {
    model: string
    license: string
    architecture: string
    github_url: string
    paper_url: string
    param_count: number
    pretrain_datasets: string[]
    run_parameters: {
      // YOLO-style parameters
      imgsz?: number
      iou?: number
      max_det?: number
      conf?: number
      verbose?: boolean

      // DETR-style parameters
      resolution?: number
      num_queries?: number
      num_select?: number
      threshold?: number
    }
  }
  map50_95: number
  map50: number
  map75: number
  small_objects: {
    map50_95: number
    map50: number
    map75: number
  }
  medium_objects: {
    map50_95: number
    map50: number
    map75: number
  }
  large_objects: {
    map50_95: number
    map50: number
    map75: number
  }
  f1_50: number
  f1_75: number
  f1_small_objects: {
    f1_50: number
    f1_75: number
  }
  f1_medium_objects: {
    f1_50: number
    f1_75: number
  }
  f1_large_objects: {
    f1_50: number
    f1_75: number
  }
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function getSearchableText(result: ModelResult): string {
  const searchableFields = [
    result.metadata.model,
    result.metadata.license,
    formatters.parameters(result.metadata.param_count),
    formatters.percentage(result.map50_95),
    formatters.percentage(result.map50),
    formatters.percentage(result.map75),
    formatters.decimal(result.map50_95),
    formatters.decimal(result.map50),
    formatters.decimal(result.map75),
    formatters.percentage(result.f1_50),
    formatters.percentage(result.f1_75),
    formatters.percentage(result.small_objects.map50_95),
    formatters.percentage(result.small_objects.map50),
    formatters.percentage(result.small_objects.map75),
    formatters.percentage(result.medium_objects.map50_95),
    formatters.percentage(result.medium_objects.map50),
    formatters.percentage(result.medium_objects.map75),
    formatters.percentage(result.large_objects.map50_95),
    formatters.percentage(result.large_objects.map50),
    formatters.percentage(result.large_objects.map75),
    formatters.percentage(result.f1_small_objects.f1_50),
    formatters.percentage(result.f1_small_objects.f1_75),
    formatters.percentage(result.f1_medium_objects.f1_50),
    formatters.percentage(result.f1_medium_objects.f1_75),
    formatters.percentage(result.f1_large_objects.f1_50),
    formatters.percentage(result.f1_large_objects.f1_75),
    formatters.decimal(result.map50_95),
    formatters.decimal(result.map50),
    formatters.decimal(result.map75),
    formatters.decimal(result.f1_50),
    formatters.decimal(result.f1_75),
    result.metadata.param_count.toString(),
  ]

  return searchableFields.join(' ').toLowerCase()
}





export default function Home() {
  const [search, setSearch] = useState("")
  const [sortColumn, setSortColumn] = useState<string>("map50_95")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isLoading, setIsLoading] = useState(true)

  // Extract unique values using the generic hook
  const availableLicenses = useUniqueValues(
    aggregateResults, 
    (result) => result.metadata.license
  )

  const availableArchitectures = useUniqueValues(
    aggregateResults,
    (result) => result.metadata.architecture
  )

  const availablePretrainDatasets = useUniqueValues(
    aggregateResults,
    (result) => result.metadata.pretrain_datasets
  )

  // Available datasets (currently only COCO 2017)
  const availableDatasets = useMemo(() => ["COCO 2017"], [])

  // Dataset filter handler
  const [selectedDataset, setSelectedDataset] = useState("COCO 2017")
  const handleDatasetChange = (dataset: string) => {
    setSelectedDataset(dataset)
  }

  // Use generic set filter hooks
  const licenseFilter = useSetFilter(availableLicenses)
  const architectureFilter = useSetFilter(availableArchitectures)
  const pretrainDatasetFilter = useSetFilter(availablePretrainDatasets)

  // Extract parameter range (in millions)
  const { minParams, maxParams } = useMemo(() => {
    if (aggregateResults.length === 0) {
      return { minParams: 0, maxParams: 100 }
    }
    
    const paramCounts = aggregateResults.map(result => result.metadata.param_count / 1_000_000)
    return {
      minParams: Math.min(...paramCounts),
      maxParams: Math.max(...paramCounts)
    }
  }, [])

  // Initialize parameter filter (after minParams/maxParams are calculated)
  const parameterFilter = useRangeFilter(minParams, maxParams)

  // Use centralized column management
  const columnManager = useColumnManager()

  // Handle loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(key)
      setSortDirection("desc")
    }
  }

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = aggregateResults

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim()
      filtered = filtered.filter(result =>
        getSearchableText(result).includes(searchLower)
      )
    }

    // Apply license filter
    if (licenseFilter.selectedItems.size > 0) {
      filtered = filtered.filter(result =>
        licenseFilter.selectedItems.has(result.metadata.license)
      )
    }

    // Apply architecture filter
    if (architectureFilter.selectedItems.size > 0) {
      filtered = filtered.filter(result =>
        architectureFilter.selectedItems.has(result.metadata.architecture)
      )
    }

    // Apply pretrain datasets filter
    if (pretrainDatasetFilter.selectedItems.size > 0) {
      filtered = filtered.filter(result => {
        // Check if any of the selected datasets is in the model's pretrain_datasets array
        return result.metadata.pretrain_datasets?.some(dataset =>
          pretrainDatasetFilter.selectedItems.has(dataset)
        )
      })
    }

    // Apply parameter range filter
    const [minParamsMillion, maxParamsMillion] = parameterFilter.value
    filtered = filtered.filter(result => {
      const paramCountMillion = result.metadata.param_count / 1_000_000
      return paramCountMillion >= minParamsMillion && paramCountMillion <= maxParamsMillion
    })

    if (!sortColumn || !sortDirection) return filtered

    return [...filtered].sort((a, b) => {
      const aValue = getNestedValue(a, sortColumn)
      const bValue = getNestedValue(b, sortColumn)

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [search, licenseFilter.selectedItems, architectureFilter.selectedItems, pretrainDatasetFilter.selectedItems, parameterFilter.value, sortColumn, sortDirection])

  // Calculate value range for horizontal bars in sorted column
  const columnRange = useMemo(() => {
    if (!sortColumn || filteredAndSortedResults.length === 0) return null

    // Check if it's a numeric column (exclude non-numeric columns)
    const nonNumericColumns = ['metadata.model', 'metadata.license', 'paper']
    if (nonNumericColumns.includes(sortColumn)) return null

    const values = filteredAndSortedResults.map(result => getNestedValue(result, sortColumn))
    const numericValues = values.filter(v => typeof v === 'number')

    if (numericValues.length === 0) return null

    return {
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      column: sortColumn
    }
  }, [sortColumn, filteredAndSortedResults])

  

  return (
    <>
      <section className="pt-12">
        <div className="container-base mx-auto">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Badge variant="primary">
                <Link href="https://github.com/roboflow/supervision" target="_blank" className="flex items-center gap-1">
                  Powered by SuperVision <ArrowSquareOutIcon size={14} weight="thin" />
                </Link>
              </Badge>
              <h1 className="text-4xl"><span className="text-primary-foreground">Computer Vision</span><br />Model Leaderboard</h1>
              <p className="prose prose-sm max-w-lg">
                Compare computer vision models benchmarked on the COCO 2017 dataset using standardized mAP and F1 metrics. Filter by architecture, size, or license to find the best model for your use case.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="pb-12">
        <div className="container-base mx-auto">
          <div className="relative">
            <div className="flex flex-row gap-2 py-4 sm:flex-wrap">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search models..."
                className="flex-1"
              />

              {/* Desktop Filters */}
              <div className="hidden sm:flex gap-2 flex-wrap">
                <DropdownFilterCheckbox
                  icon={CircuitryIcon}
                  title="Architecture"
                  label="Filter by Architecture"
                  availableItems={availableArchitectures}
                  selectedItems={architectureFilter.selectedItems}
                  onItemToggle={architectureFilter.toggleItem}
                  onClearAll={architectureFilter.clearAll}
                  onSelectAll={architectureFilter.selectAll}
                />

                <DropdownFilterSlider
                  icon={CpuIcon}
                  title="Parameters"
                  label="Filter by Parameter Count"
                  formatter={formatters.parametersFromMillion}
                  step={0.1}
                  {...parameterFilter}
                />

                <DropdownFilterCheckbox
                  icon={DatabaseIcon}
                  title="Pretrained on"
                  label="Filter by Pretrained Datasets"
                  availableItems={availablePretrainDatasets}
                  selectedItems={pretrainDatasetFilter.selectedItems}
                  onItemToggle={pretrainDatasetFilter.toggleItem}
                  onClearAll={pretrainDatasetFilter.clearAll}
                  onSelectAll={pretrainDatasetFilter.selectAll}
                />

                <DropdownFilterCheckbox
                  icon={FileTextIcon}
                  title="License"
                  label="Filter by License"
                  availableItems={availableLicenses}
                  selectedItems={licenseFilter.selectedItems}
                  onItemToggle={licenseFilter.toggleItem}
                  onClearAll={licenseFilter.clearAll}
                  onSelectAll={licenseFilter.selectAll}
                />

                <DropdownFilterRadio
                  icon={GaugeIcon}
                  title="Benchmark"
                  label="Select Dataset"
                  availableItems={availableDatasets}
                  selectedItem={selectedDataset}
                  onItemChange={handleDatasetChange}
                />

                <Separator orientation="vertical" className="max-h-9" />

                <ColumnToggle
                  columns={columnManager.allColumns.map(col => ({ key: col.key, label: col.label, group: col.group }))}
                  visibleColumns={columnManager.visibleColumns}
                  onToggleColumn={columnManager.toggleColumn}
                  onShowAll={columnManager.showAllColumns}
                  onHideAll={columnManager.hideAllColumns}
                  onResetToDefaults={columnManager.resetToDefaults}
                />
              </div>

              {/* Mobile Controls */}
              <MobileControls
                availableLicenses={availableLicenses}
                selectedLicenses={licenseFilter.selectedItems}
                onLicenseToggle={licenseFilter.toggleItem}
                onClearAllLicenses={licenseFilter.clearAll}
                onSelectAllLicenses={licenseFilter.selectAll}
                availableArchitectures={availableArchitectures}
                selectedArchitectures={architectureFilter.selectedItems}
                onArchitectureToggle={architectureFilter.toggleItem}
                onClearAllArchitectures={architectureFilter.clearAll}
                onSelectAllArchitectures={architectureFilter.selectAll}
                availablePretrainDatasets={availablePretrainDatasets}
                selectedPretrainDatasets={pretrainDatasetFilter.selectedItems}
                onPretrainDatasetToggle={pretrainDatasetFilter.toggleItem}
                onClearAllPretrainDatasets={pretrainDatasetFilter.clearAll}
                onSelectAllPretrainDatasets={pretrainDatasetFilter.selectAll}
                parameterFilter={parameterFilter} 
                availableDatasets={availableDatasets}
                selectedDataset={selectedDataset}
                onDatasetChange={handleDatasetChange}
                columns={columnManager.allColumns.map(col => ({ key: col.key, label: col.label, group: col.group }))}
                visibleColumns={columnManager.visibleColumns}
                onToggleColumn={columnManager.toggleColumn}
                onShowAllColumns={columnManager.showAllColumns}
                onHideAllColumns={columnManager.hideAllColumns}
                onResetToDefaults={columnManager.resetToDefaults}
              />
            </div>

            <ScrollArea className="h-[625px] w-full max-w-[1504px] overflow-x-auto rounded-md border whitespace-nowrap">
              <Table className="min-w-max table-auto text-foreground/60">
                <TableHeader>
                  <TableRow className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg px-0">
                    {columnManager.filteredColumns.map((column) => (
                      <SortableTableHeader
                        key={column.key}
                        columnKey={column.key}
                        label={column.label}
                        width={column.width}
                        sortable={column.sortable}
                        tooltip={column.tooltip}
                        currentSortColumn={sortColumn}
                        currentSortDirection={sortDirection}
                        onSort={handleSort}
                        className="px-4 text-foreground/60"
                      />
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <SkeletonTable columns={columnManager.filteredColumns} />
                  ) : filteredAndSortedResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columnManager.filteredColumns.length} className="text-center py-8 text-muted-foreground">
                        {search ? (
                          <div>
                            <p>No models found matching "{search}"</p>
                            <Button
                              variant="link"
                              onClick={() => setSearch("")}
                              className="mt-2 text-primary-foreground"
                            >
                              Clear search
                            </Button>
                          </div>
                        ) : (
                          "No models to display"
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedResults.map((result) => (
                      <ModelTableRow
                        key={result.metadata.model}
                        result={result}
                        columns={columnManager.filteredColumns}
                        sortColumn={sortColumn}
                        columnRange={columnRange}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {/* Results Counter */}
              <div className="w-full mt-4 flex flex-wrap items-start gap-2 justify-between">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {isLoading ? (
                      <div className="h-4 bg-muted/50 animate-pulse rounded w-40"></div>
                    ) : (
                      <>
                        Displaying <span className="font-medium text-foreground">{filteredAndSortedResults.length}</span> out of{" "}
                        <span className="font-medium text-foreground">{aggregateResults.length}</span> models
                      </>
                    )}
                  </div>

                  {/* Active Filters Indicator */}
                  {!isLoading && (search || licenseFilter.selectedItems.size > 0 || architectureFilter.selectedItems.size > 0 || pretrainDatasetFilter.selectedItems.size > 0 || parameterFilter.isFiltered) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Filtered by:</span>
                      {search && <span className="bg-muted px-2 py-0.5 rounded">Search</span>}
                      {licenseFilter.selectedItems.size > 0 && <span className="bg-muted px-2 py-0.5 rounded">License</span>}
                      {architectureFilter.selectedItems.size > 0 && <span className="bg-muted px-2 py-0.5 rounded">Architecture</span>}
                      {pretrainDatasetFilter.selectedItems.size > 0 && <span className="bg-muted px-2 py-0.5 rounded">Pretrain Datasets</span>}
                      {parameterFilter.isFiltered && <span className="bg-muted px-2 py-0.5 rounded">Parameters</span>}
                    </div>
                  )}
                </div>
                <div className="prose prose-sm">Made with <HeartIcon size={14} weight="fill" className="inline-block text-primary-foreground" /> by <Link href="https://roboflow.com" target="_blank" className="link-primary">Roboflow</Link></div>
              </div>
          </div>


        </div>
      </section>
    </>
  )
}
