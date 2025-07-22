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

import aggregateResults from "@/data/aggregate_results.json"
import { ParameterFilter } from "@/components/ParameterFilter"
import { DatasetFilter } from "@/components/DatasetFilter"
import { ArrowSquareOutIcon } from "@phosphor-icons/react"
import { Separator } from "@/components/ui/separator"
import { HeartIcon } from "@phosphor-icons/react"
import { MobileControls } from "@/components/MobileControls"
import { FilterDropdown } from "@/components/FilterDropdown"
import { CircuitryIcon, FileTextIcon, DatabaseIcon } from "@phosphor-icons/react"

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

interface Column {
  key: string
  label: string
  width: string
  sortable?: boolean
  group: 'Basic' | 'Core Metrics' | 'F1 Metrics' | 'Size-Specific' | 'Metadata'
  defaultVisible: boolean
  tooltip?: string // Add tooltip support
}

const allColumns: Column[] = [
  {
    key: "metadata.model",
    label: "Model",
    width: "w-24",
    group: 'Basic',
    defaultVisible: true,
    tooltip: "Name of the computer vision model"
  },
  {
    key: "metadata.param_count",
    label: "Parameters (M)",
    width: "w-10",
    group: 'Basic',
    defaultVisible: true,
    tooltip: "Total number of trainable parameters in millions"
  },
  {
    key: "map50_95",
    label: "mAP 50:95",
    width: "w-40",
    group: 'Core Metrics',
    defaultVisible: true,
    tooltip: "Mean Average Precision at IoU thresholds from 0.5 to 0.95 (primary COCO metric)"
  },
  {
    key: "map50",
    label: "mAP 50",
    width: "w-40",
    group: 'Core Metrics',
    defaultVisible: true,
    tooltip: "Mean Average Precision at IoU threshold of 0.5"
  },
  {
    key: "map75",
    label: "mAP 75",
    width: "w-40",
    group: 'Core Metrics',
    defaultVisible: false,
    tooltip: "Mean Average Precision at IoU threshold of 0.75 (stricter localization)"
  },
  {
    key: "small_objects.map50_95",
    label: "mAP 50:95 (Small)",
    width: "w-40",
    group: 'Size-Specific',
    defaultVisible: false,
    tooltip: "mAP 50:95 for small objects"
  },
  {
    key: "medium_objects.map50_95",
    label: "mAP 50:95 (Medium)",
    width: "w-40",
    group: 'Size-Specific',
    defaultVisible: false,
    tooltip: "mAP 50:95 for medium objects"
  },
  {
    key: "large_objects.map50_95",
    label: "mAP 50:95 (Large)",
    width: "w-40",
    group: 'Size-Specific',
    defaultVisible: false,
    tooltip: "mAP 50:95 for large objects"
  },
  {
    key: "f1_50",
    label: "F1 50",
    width: "w-40",
    group: 'F1 Metrics',
    defaultVisible: false,
    tooltip: "F1 score at IoU threshold of 0.5"
  },
  {
    key: "f1_75",
    label: "F1 75",
    width: "w-40",
    group: 'F1 Metrics',
    defaultVisible: false,
    tooltip: "F1 score at IoU threshold of 0.75"
  },
  {
    key: "f1_small_objects.f1_50",
    label: "F1 50 (Small)",
    width: "w-40",
    group: 'Size-Specific',
    defaultVisible: false,
    tooltip: "F1 score at IoU 0.5 for small objects"
  },
  {
    key: "f1_small_objects.f1_75",
    label: "F1 75 (Small)",
    width: "w-40",
    group: 'Size-Specific',
    defaultVisible: false,
    tooltip: "F1 score at IoU 0.75 for small objects"
  },
  {
    key: "f1_medium_objects.f1_50",
    label: "F1 50 (Medium)",
    width: "w-40",
    group: 'Size-Specific',
    defaultVisible: false,
    tooltip: "F1 score at IoU 0.5 for medium objects"
  },
  {
    key: "f1_medium_objects.f1_75",
    label: "F1 75 (Medium)",
    width: "w-28",
    group: 'Size-Specific',
    defaultVisible: false,
    tooltip: "F1 score at IoU 0.75 for medium objects"
  },
  {
    key: "f1_large_objects.f1_50",
    label: "F1 50 (Large)",
    width: "w-24",
    group: 'Size-Specific',
    defaultVisible: false,
    tooltip: "F1 score at IoU 0.5 for large objects"
  },
  {
    key: "f1_large_objects.f1_75",
    label: "F1 75 (Large)",
    width: "w-24",
    group: 'Size-Specific',
    defaultVisible: false,
    tooltip: "F1 score at IoU 0.75 for large objects"
  },
  {
    key: "paper",
    label: "Paper",
    width: "w-10",
    sortable: false,
    group: 'Metadata',
    defaultVisible: true,
    tooltip: "Link to research paper"
  },
  {
    key: "metadata.license",
    label: "License",
    width: "w-10",
    group: 'Metadata',
    defaultVisible: true,
    tooltip: "Software license (e.g., MIT, Apache-2.0, AGPL-3.0)"
  },
]

// Use the correct keys from allColumns for defaults
const getDefaultVisibleColumns = () => {
  return new Set(allColumns.filter(col => col.defaultVisible).map(col => col.key))
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatParameters(count: number): string {
  return `${(count / 1_000_000).toFixed(1)}M`
}

// Get searchable text for all fields in a result
function getSearchableText(result: ModelResult): string {
  const searchableFields = [
    result.metadata.model,
    result.metadata.license,
    formatParameters(result.metadata.param_count),
    formatPercentage(result.map50_95),
    formatPercentage(result.map50),
    formatPercentage(result.map75),
    formatPercentage(result.f1_50),
    formatPercentage(result.f1_75),
    formatPercentage(result.small_objects.map50_95),
    formatPercentage(result.small_objects.map50),
    formatPercentage(result.small_objects.map75),
    formatPercentage(result.medium_objects.map50_95),
    formatPercentage(result.medium_objects.map50),
    formatPercentage(result.medium_objects.map75),
    formatPercentage(result.large_objects.map50_95),
    formatPercentage(result.large_objects.map50),
    formatPercentage(result.large_objects.map75),
    formatPercentage(result.f1_small_objects.f1_50),
    formatPercentage(result.f1_small_objects.f1_75),
    formatPercentage(result.f1_medium_objects.f1_50),
    formatPercentage(result.f1_medium_objects.f1_75),
    formatPercentage(result.f1_large_objects.f1_50),
    formatPercentage(result.f1_large_objects.f1_75),
    result.map50_95.toFixed(3),
    result.map50.toFixed(3),
    result.map75.toFixed(3),
    result.f1_50.toFixed(3),
    result.f1_75.toFixed(3),
    result.metadata.param_count.toString(),
  ]

  return searchableFields.join(' ').toLowerCase()
}



export default function Home() {
  const [search, setSearch] = useState("")
  const [sortColumn, setSortColumn] = useState<string>("map50_95")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(getDefaultVisibleColumns())

  const [parameterRange, setParameterRange] = useState<[number, number]>([0, 100])
  const [selectedDataset, setSelectedDataset] = useState<string>("COCO 2017")

  // Column toggle handlers
  const handleToggleColumn = (columnKey: string) => {

    const newVisibleColumns = new Set(visibleColumns)
    if (newVisibleColumns.has(columnKey)) {
      newVisibleColumns.delete(columnKey)
    } else {
      newVisibleColumns.add(columnKey)
    }
    setVisibleColumns(newVisibleColumns)
  }

  const handleShowAllColumns = () => {
    setVisibleColumns(new Set(allColumns.map(col => col.key)))
  }

  const handleHideAllColumns = () => {
    setVisibleColumns(new Set(['metadata.model'])) // Keep at least model column
  }

  const handleResetToDefaults = () => {
    setVisibleColumns(getDefaultVisibleColumns())
  }

  // License filter handlers
  const handleLicenseToggle = (license: string) => {
    const newSelectedLicenses = new Set(selectedLicenses)
    if (newSelectedLicenses.has(license)) {
      newSelectedLicenses.delete(license)
    } else {
      newSelectedLicenses.add(license)
    }
    setSelectedLicenses(newSelectedLicenses)
  }

  const handleClearAllLicenses = () => {
    setSelectedLicenses(new Set())
  }

  const handleSelectAllLicenses = () => {
    setSelectedLicenses(new Set(availableLicenses))
  }

  // Architecture filter handlers
  const handleArchitectureToggle = (architecture: string) => {
    const newSelectedArchitectures = new Set(selectedArchitectures)
    if (newSelectedArchitectures.has(architecture)) {
      newSelectedArchitectures.delete(architecture)
    } else {
      newSelectedArchitectures.add(architecture)
    }
    setSelectedArchitectures(newSelectedArchitectures)
  }

  const handleClearAllArchitectures = () => {
    setSelectedArchitectures(new Set())
  }

  const handleSelectAllArchitectures = () => {
    setSelectedArchitectures(new Set(availableArchitectures))
  }

  // Pretrain datasets filter handlers
  const handlePretrainDatasetToggle = (dataset: string) => {
    const newSelectedDatasets = new Set(selectedPretrainDatasets)
    if (newSelectedDatasets.has(dataset)) {
      newSelectedDatasets.delete(dataset)
    } else {
      newSelectedDatasets.add(dataset)
    }
    setSelectedPretrainDatasets(newSelectedDatasets)
  }

  const handleClearAllPretrainDatasets = () => {
    setSelectedPretrainDatasets(new Set())
  }

  const handleSelectAllPretrainDatasets = () => {
    setSelectedPretrainDatasets(new Set(availablePretrainDatasets))
  }

  // Parameter filter handlers
  const handleParameterRangeChange = (range: [number, number]) => {
    setParameterRange(range)
  }

  const handleParameterReset = () => {
    setParameterRange([minParams, maxParams])
  }

  // Dataset filter handler
  const handleDatasetChange = (dataset: string) => {
    setSelectedDataset(dataset)
  }

  // Get only visible columns
  const columns = useMemo(() =>
    allColumns.filter(col => visibleColumns.has(col.key)),
    [visibleColumns]
  )

  // Extract unique licenses
  const availableLicenses = useMemo(() => {
    const licenses = new Set<string>()
    aggregateResults.forEach(result => {
      if (result.metadata.license) {
        licenses.add(result.metadata.license)
      }
    })
    return Array.from(licenses).sort()
  }, [])

  // Extract unique architectures
  const availableArchitectures = useMemo(() => {
    const architectures = new Set<string>()
    aggregateResults.forEach(result => {
      if (result.metadata.architecture) {
        architectures.add(result.metadata.architecture)
      }
    })
    return Array.from(architectures).sort()
  }, [])

  // Extract unique pretrain datasets
  const availablePretrainDatasets = useMemo(() => {
    const datasets = new Set<string>()
    aggregateResults.forEach(result => {
      if (result.metadata.pretrain_datasets) {
        result.metadata.pretrain_datasets.forEach(dataset => {
          datasets.add(dataset)
        })
      }
    })
    return Array.from(datasets).sort()
  }, [])

  const [selectedLicenses, setSelectedLicenses] = useState<Set<string>>(new Set())
  const [selectedArchitectures, setSelectedArchitectures] = useState<Set<string>>(new Set())
  const [selectedPretrainDatasets, setSelectedPretrainDatasets] = useState<Set<string>>(new Set())

  // Available datasets (currently only COCO 2017)
  const availableDatasets = useMemo(() => ["COCO 2017"], [])

  // Extract parameter range (in millions)
  const { minParams, maxParams } = useMemo(() => {
    const paramCounts = aggregateResults.map(result => result.metadata.param_count / 1_000_000)
    const min = Math.min(...paramCounts)
    const max = Math.max(...paramCounts)

    // Round to nice values
    const roundedMin = Math.floor(min)
    const roundedMax = Math.ceil(max)

    return {
      minParams: roundedMin,
      maxParams: roundedMax
    }
  }, [])

  // Initialize parameter range state
  useEffect(() => {
    setParameterRange([minParams, maxParams])
  }, [minParams, maxParams])

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
    if (selectedLicenses.size > 0) {
      filtered = filtered.filter(result =>
        selectedLicenses.has(result.metadata.license)
      )
    }

    // Apply architecture filter
    if (selectedArchitectures.size > 0) {
      filtered = filtered.filter(result =>
        selectedArchitectures.has(result.metadata.architecture)
      )
    }

    // Apply pretrain datasets filter
    if (selectedPretrainDatasets.size > 0) {
      filtered = filtered.filter(result => {
        // Check if any of the selected datasets is in the model's pretrain_datasets array
        return result.metadata.pretrain_datasets?.some(dataset =>
          selectedPretrainDatasets.has(dataset)
        )
      })
    }

    // Apply parameter range filter
    const [minParamsMillion, maxParamsMillion] = parameterRange
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
  }, [search, selectedLicenses, selectedArchitectures, selectedPretrainDatasets, parameterRange, sortColumn, sortDirection])

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
              <p className="text-sm text-foreground/60 max-w-lg">
                Compare computer vision models benchmarked on the COCO 2017 dataset using standardized mAP and F1 metrics. Filter by architecture, size, or license to find the best model for your use case.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="pb-12">
        <div className="container-base mx-auto">
          <div className="relative">
            <div className="flex flex-row gap-2 py-4 flex-wrap">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search models..."
                className="flex-1"
              />

              {/* Desktop Filters */}
              <div className="hidden sm:flex gap-2 flex-wrap">
                <FilterDropdown
                  icon={CircuitryIcon}
                  title="Architecture"
                  label="Filter by Architecture"
                  availableItems={availableArchitectures}
                  selectedItems={selectedArchitectures}
                  onItemToggle={handleArchitectureToggle}
                  onClearAll={handleClearAllArchitectures}
                  onSelectAll={handleSelectAllArchitectures}
                />

                <ParameterFilter
                  minParams={minParams}
                  maxParams={maxParams}
                  selectedRange={parameterRange}
                  onRangeChange={handleParameterRangeChange}
                  onReset={handleParameterReset}
                />

                <FilterDropdown
                  icon={DatabaseIcon}
                  title="Pretrained on"
                  label="Filter by Pretrained Datasets"
                  availableItems={availablePretrainDatasets}
                  selectedItems={selectedPretrainDatasets}
                  onItemToggle={handlePretrainDatasetToggle}
                  onClearAll={handleClearAllPretrainDatasets}
                  onSelectAll={handleSelectAllPretrainDatasets}
                />

                <FilterDropdown
                  icon={FileTextIcon}
                  title="License"
                  label="Filter by License"
                  availableItems={availableLicenses}
                  selectedItems={selectedLicenses}
                  onItemToggle={handleLicenseToggle}
                  onClearAll={handleClearAllLicenses}
                  onSelectAll={handleSelectAllLicenses}
                />

                <DatasetFilter
                  availableDatasets={availableDatasets}
                  selectedDataset={selectedDataset}
                  onDatasetChange={handleDatasetChange}
                />

                <Separator orientation="vertical" className="max-h-9" />

                <ColumnToggle
                  columns={allColumns.map(col => ({ key: col.key, label: col.label, group: col.group }))}
                  visibleColumns={visibleColumns}
                  onToggleColumn={handleToggleColumn}
                  onShowAll={handleShowAllColumns}
                  onHideAll={handleHideAllColumns}
                  onResetToDefaults={handleResetToDefaults}
                />
              </div>

              {/* Mobile Controls */}
              <MobileControls
                availableLicenses={availableLicenses}
                selectedLicenses={selectedLicenses}
                onLicenseToggle={handleLicenseToggle}
                onClearAllLicenses={handleClearAllLicenses}
                onSelectAllLicenses={handleSelectAllLicenses}
                availableArchitectures={availableArchitectures}
                selectedArchitectures={selectedArchitectures}
                onArchitectureToggle={handleArchitectureToggle}
                onClearAllArchitectures={handleClearAllArchitectures}
                onSelectAllArchitectures={handleSelectAllArchitectures}
                availablePretrainDatasets={availablePretrainDatasets}
                selectedPretrainDatasets={selectedPretrainDatasets}
                onPretrainDatasetToggle={handlePretrainDatasetToggle}
                onClearAllPretrainDatasets={handleClearAllPretrainDatasets}
                onSelectAllPretrainDatasets={handleSelectAllPretrainDatasets}
                minParams={minParams}
                maxParams={maxParams}
                parameterRange={parameterRange}
                onParameterRangeChange={handleParameterRangeChange}
                onParameterReset={handleParameterReset}
                availableDatasets={availableDatasets}
                selectedDataset={selectedDataset}
                onDatasetChange={handleDatasetChange}
                columns={allColumns.map(col => ({ key: col.key, label: col.label, group: col.group }))}
                visibleColumns={visibleColumns}
                onToggleColumn={handleToggleColumn}
                onShowAllColumns={handleShowAllColumns}
                onHideAllColumns={handleHideAllColumns}
                onResetToDefaults={handleResetToDefaults}
              />
            </div>

            {/* {search && (
              <div className="text-xs text-muted-foreground mb-4 bg-muted/50 p-3 rounded">
                <strong>Search tips:</strong> Try "yolo", "50%", "AGPL", "43M", "0.5", or any value you see in the table
              </div>
            )} */}

            <ScrollArea className="h-[625px] w-full max-w-[1504px] overflow-x-auto rounded-md border whitespace-nowrap">
              <Table className="min-w-max table-auto">
                <TableHeader>
                  <TableRow className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg px-0">
                    {columns.map((column) => (
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
                        className="px-4"
                      />
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                        {search ? (
                          <div>
                            <p>No models found matching "{search}"</p>
                            <Button
                              variant="link"
                              onClick={() => setSearch("")}
                              className="mt-2"
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
                        columns={columns}
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
                    Displaying <span className="font-medium text-foreground">{filteredAndSortedResults.length}</span> out of{" "}
                    <span className="font-medium text-foreground">{aggregateResults.length}</span> models
                  </div>

                  {/* Active Filters Indicator */}
                  {(search || selectedLicenses.size > 0 || selectedArchitectures.size > 0 || selectedPretrainDatasets.size > 0 || (parameterRange[0] !== minParams || parameterRange[1] !== maxParams)) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Filtered by:</span>
                      {search && <span className="bg-muted px-2 py-0.5 rounded">Search</span>}
                      {selectedLicenses.size > 0 && <span className="bg-muted px-2 py-0.5 rounded">License</span>}
                      {selectedArchitectures.size > 0 && <span className="bg-muted px-2 py-0.5 rounded">Architecture</span>}
                      {selectedPretrainDatasets.size > 0 && <span className="bg-muted px-2 py-0.5 rounded">Pretrain Datasets</span>}
                      {(parameterRange[0] !== minParams || parameterRange[1] !== maxParams) && <span className="bg-muted px-2 py-0.5 rounded">Parameters</span>}
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Made with <HeartIcon size={14} weight="fill" className="inline-block text-primary-foreground" /> by <Link href="https://roboflow.com" target="_blank" className="text-primary-foreground">Roboflow</Link></div>
              </div>
          </div>


        </div>
      </section>
    </>
  )
}
