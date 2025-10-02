export interface PCSColumn {
  key: string
  label: string
  width: string
  sortable?: boolean
  group: 'Basic' | 'Core Metrics' | 'F1 Metrics' | 'Size-Specific' | 'Metadata'
  defaultVisible: boolean
  tooltip?: string
  benchmarks: string[] // Which benchmarks this column applies to
  formatter?: 'decimal' | 'percentage' | 'parameters' // Add formatter property
}

export const pcsColumns: PCSColumn[] = [
  {
    key: "metadata.model",
    label: "Model",
    width: "w-50",
    group: 'Basic',
    defaultVisible: true,
    sortable: true,
    benchmarks: ["lvis", "sa_co", "coco", "ade_847", "pc_59", "cityscapes"],
    tooltip: "Name of the computer vision model"
  },
  {
    key: "metadata.param_count",
    label: "Parameters (M)",
    width: "w-48",
    group: 'Basic',
    defaultVisible: true,
    sortable: true,
    benchmarks: ["lvis", "sa_co", "coco", "ade_847", "pc_59", "cityscapes"],
    tooltip: "Total number of trainable parameters in millions",
    formatter: 'parameters'
  },
  {
    key: "results.cgf",
    label: "CGF",
    width: "w-40",
    group: 'Core Metrics',
    defaultVisible: true,
    sortable: true,
    benchmarks: ["lvis"], // Only LVIS shows CGF
    tooltip: "Compositional Generalization Factor",
    formatter: 'decimal'
  },
  {
    key: "results.ap",
    label: "AP",
    width: "w-40",
    group: 'Core Metrics',
    defaultVisible: true,
    sortable: true,
    benchmarks: ["lvis", "coco"], // LVIS and COCO show AP
    tooltip: "Average Precision",
    formatter: 'decimal'
  },
  {
    key: "results.miou",
    label: "mIoU",
    width: "w-40",
    group: 'Core Metrics',
    defaultVisible: true,
    sortable: true,
    benchmarks: ["ade_847", "pc_59", "cityscapes"], // Semantic segmentation benchmarks
    tooltip: "Mean Intersection over Union",
    formatter: 'decimal'
  },
  {
    key: "results.ap_coco_o",
    label: "AP COCO-O",
    width: "w-40",
    group: 'Core Metrics',
    defaultVisible: true,
    sortable: true,
    benchmarks: ["coco"], // Only in COCO box detection
    tooltip: "Average Precision on COCO Original dataset",
    formatter: 'decimal'
  },
  {
    key: "results.gold",
    label: "Gold",
    width: "w-40",
    group: 'Size-Specific',
    defaultVisible: true,
    sortable: true,
    benchmarks: ["sa_co"], // Only SA-Co shows tier columns
    tooltip: "7 domains, 3 human annotations per image-NP pair",
    formatter: 'decimal'
  },
  {
    key: "results.silver",
    label: "Silver",
    width: "w-40",
    group: 'Size-Specific',
    defaultVisible: true,
    sortable: true,
    benchmarks: ["sa_co"], // Only SA-Co shows tier columns
    tooltip: "10 domains, 1 human annotation per image-NP pair",
    formatter: 'decimal'
  },
  {
    key: "results.bronze",
    label: "Bronze",
    width: "w-40",
    group: 'Size-Specific',
    defaultVisible: false,
    sortable: true,
    benchmarks: ["sa_co"], // Only SA-Co shows tier columns
    tooltip: "9 existing datasets with mask annotations",
    formatter: 'decimal'
  },
  {
    key: "results.bio",
    label: "Bio",
    width: "w-40",
    group: 'Size-Specific',
    defaultVisible: false,
    sortable: true,
    benchmarks: ["sa_co"], // Only SA-Co shows tier columns
    tooltip: "9 existing datasets with SAM 2 generated masks",
    formatter: 'decimal'
  },
  {
    key: "paper",
    label: "Paper",
    width: "w-10",
    sortable: false,
    group: 'Metadata',
    defaultVisible: true,
    benchmarks: ["lvis", "sa_co", "coco", "ade_847", "pc_59", "cityscapes"],
    tooltip: "Link to research paper"
  },
  {
    key: "metadata.license",
    label: "License",
    width: "w-10",
    group: 'Metadata',
    defaultVisible: true,
    sortable: true,
    benchmarks: ["lvis", "sa_co", "coco", "ade_847", "pc_59", "cityscapes"],
    tooltip: "Software license (e.g., MIT, Apache-2.0, AGPL-3.0)"
  }
]

/**
 * Get columns available for a specific benchmark
 */
export const getColumnsForBenchmark = (benchmarkKey: string): PCSColumn[] => {
  const benchmarkName = benchmarkKey.split('.')[1] || benchmarkKey
  return pcsColumns.filter(col => col.benchmarks.includes(benchmarkName))
}

/**
 * Get default visible columns for a specific benchmark
 */
export const getDefaultVisibleColumnsForBenchmark = (benchmarkKey: string): Set<string> => {
  const availableColumns = getColumnsForBenchmark(benchmarkKey)
  return new Set(availableColumns.filter(col => col.defaultVisible).map(col => col.key))
}

/**
 * Get all column keys for a specific benchmark
 */
export const getAllColumnKeysForBenchmark = (benchmarkKey: string): string[] => {
  return getColumnsForBenchmark(benchmarkKey).map(col => col.key)
}