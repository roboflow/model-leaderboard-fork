import type { Metadata } from 'next'
import PCSClient from '@/components/PCSClient'

export const metadata: Metadata = {
  title: 'Promptable Concept Segmentation (PCS) Model Leaderboard',
  description: 'Compare PCS models for pixel-level object identification using text, point, and image prompts. Benchmarked on LVIS, COCO, SA-Co, ADE-847, PC-59, and Cityscapes datasets.',
  openGraph: {
    title: 'Promptable Concept Segmentation (PCS) Model Leaderboard',
    description: 'Compare PCS models for pixel-level object identification using text, point, and image prompts. Benchmarked on LVIS, COCO, SA-Co, ADE-847, PC-59, and Cityscapes datasets.',
    url: 'https://roboflow.github.io/model-leaderboard/pcs',
  },
  twitter: {
    title: 'Promptable Concept Segmentation (PCS) Model Leaderboard',
    description: 'Compare PCS models for pixel-level object identification using text, point, and image prompts. Benchmarked on LVIS, COCO, SA-Co, ADE-847, PC-59, and Cityscapes datasets.',
  },
}

export default function PCSPage() {
  return <PCSClient />
}