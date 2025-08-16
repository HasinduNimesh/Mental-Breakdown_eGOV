// Shared types can live here
export type DocumentKind = 'NIC_FRONT' | 'NIC_BACK' | 'PASSPORT' | 'OTHER';

export interface ProfileDocument {
  id: string;
  kind: DocumentKind;
  name: string;
  url: string;
  createdAt: string;
}
