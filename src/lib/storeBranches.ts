export interface StoreBranchInfo {
  id: 'BRANCH_1' | 'BRANCH_2';
  name: string;
  tagline?: string;
  addressLines: string[];
  fullAddress: string;
}

export const STORE_BRANCHES: StoreBranchInfo[] = [
  {
    id: 'BRANCH_1',
    name: 'Arasan Branch',
    tagline: 'Arasan steels',
    addressLines: [
      'Arasan steels,',
      '120 feet road,',
      'Near Old Royal Enfield Showroom,',
      'Karaikudi.',
    ],
    fullAddress: 'Arasan steels, 120 feet road, Near Old Royal Enfield Showroom, Karaikudi.',
  },
  {
    id: 'BRANCH_2',
    name: 'Ramraj Branch',
    tagline: 'New Karadi crackers',
    addressLines: [
      'New Karadi crackers,',
      'Opp to Ramraj cotton,',
      '100 feet Road,',
      'Karaikudi',
    ],
    fullAddress: 'New Karadi crackers, Opp to Ramraj cotton, 100 feet Road, Karaikudi',
  },
];

export const SHOP_PHONES = '+91 8072044403 / +91 9786848686 / +91 8682830542';
export const SHOP_WHATSAPP = '918072044403';
