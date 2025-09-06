// src/pages/resourcespage/videos.ts
export interface Video {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
  description: string;
  youtubeId: string;
}

export const videos: Video[] = [
  {
    id: 1,
    title: "Peadiatric Seizure Recognition and Management",
    duration: "45 min",
    thumbnail: "https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Seizures",
    description: "Comprehensive guide to recognizing and managing peadiatric seizures in various settings.",
    youtubeId: "j5z10be-ApY",
  },
  {
    id: 2,
    title: "Neurological Examination in Children",
    duration: "30 min",
    thumbnail: "https://images.pexels.com/photos/4226122/pexels-photo-4226122.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Examination",
    description: "Step-by-step demonstration of peadiatric neurological examination techniques.",
    youtubeId: "PDeKrM4pkqM",
  },
  {
    id: 3,
    title: "Cerebral Palsy: Early Diagnosis and Intervention",
    duration: "50 min",
    thumbnail: "https://images.pexels.com/photos/7578808/pexels-photo-7578808.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Cerebral Palsy",
    description: "Strategies for early diagnosis and intervention in cerebral palsy cases.",
    youtubeId: "HLnFeiOVCVo",
  },
  {
    id: 4,
    title: "Neonatal Neurological Assessment",
    duration: "40 min",
    thumbnail: "https://images.pexels.com/photos/8460155/pexels-photo-8460155.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Neonatal",
    description: "Specialized neurological assessment techniques for newborn infants.",
    youtubeId: "0vrdkzOnGgo",
  },
  {
    id: 5,
    title: "Management of Childhood Headaches",
    duration: "38 min",
    thumbnail: "https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Headaches",
    description: "Approach to diagnosis and management of common childhood headaches.",
    youtubeId: "vNihRTd20Pc",
  },
  {
    id: 6,
    title: "Autism Spectrum Disorder: Early Signs",
    duration: "42 min",
    thumbnail: "https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "ASD",
    description: "Recognizing early signs of autism spectrum disorder in young children.",
    youtubeId: "DZXjJVrm1Jw",
  },
  {
    id: 7,
    title: "Neurocutaneous Syndromes in Children",
    duration: "55 min",
    thumbnail: "https://images.pexels.com/photos/5726709/pexels-photo-5726709.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Syndromes",
    description: "Identification and management of common neurocutaneous syndromes.",
    youtubeId: "nixcoQW5usI",
  },
];