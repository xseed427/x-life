import type { Shop } from './types';

export const shops: Shop[] = [
  // Pharmacies
  {
    id: 'ph-1',
    name: 'Wellness Pharmacy',
    category: 'Pharmacy',
    imageUrl: 'https://picsum.photos/seed/ph1/300/200',
    location: '123 Health St, Medville',
  },
  {
    id: 'ph-2',
    name: 'QuickCure Drugs',
    category: 'Pharmacy',
    imageUrl: 'https://picsum.photos/seed/ph2/300/200',
    location: '456 Remedy Ln, Healburg',
  },
  {
    id: 'ph-3',
    name: 'City Health Pharmacy',
    category: 'Pharmacy',
    imageUrl: 'https://picsum.photos/seed/ph3/300/200',
    location: '789 Wellness Ave, Townsville',
  },

  // Pet Care
  {
    id: 'pc-1',
    name: 'Paws & Claws Pet Store',
    category: 'Pet care',
    imageUrl: 'https://picsum.photos/seed/pc1/300/200',
    location: '101 Puppy Rd, Animalia',
  },
  {
    id: 'pc-2',
    name: 'Happy Tails Pet Supply',
    category: 'Pet care',
    imageUrl: 'https://picsum.photos/seed/pc2/300/200',
    location: '202 Kitten Ave, Furrville',
  },

  // Nursery
  {
    id: 'nu-1',
    name: 'Green Thumb Nursery',
    category: 'Nursery',
    imageUrl: 'https://picsum.photos/seed/nu1/300/200',
    location: '303 Leafy Ln, Garden City',
  },
  {
    id: 'nu-2',
    name: 'The Blooming Garden',
    category: 'Nursery',
    imageUrl: 'https://picsum.photos/seed/nu2/300/200',
    location: '404 Flowerbed Rd, Plantown',
  },

  // Aqua Life
  {
    id: 'aq-1',
    name: 'Ocean Wonders Aquarium',
    category: 'Aqua life',
    imageUrl: 'https://picsum.photos/seed/aq1/300/200',
    location: '505 Coral Cres, Fishburg',
  },
  {
    id: 'aq-2',
    name: "Fin & Friends",
    category: 'Aqua life',
    imageUrl: 'https://picsum.photos/seed/aq2/300/200',
    location: '606 Marine Dr, Seatown',
  },

  // Laboratory
  {
    id: 'la-1',
    name: 'Precision Diagnostics Lab',
    category: 'Laboratory',
    imageUrl: 'https://picsum.photos/seed/la1/300/200',
    location: '707 Test Tube Aly, Scienceton',
  },
  {
    id: 'la-2',
    name: 'Advanced Health Labs',
    category: 'Laboratory',
    imageUrl: 'https://picsum.photos/seed/la2/300/200',
    location: '808 Microscope Mews, Researchville',
  },
];
