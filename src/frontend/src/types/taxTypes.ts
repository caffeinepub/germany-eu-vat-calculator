export type Region =
  | "EU"
  | "UK"
  | "US"
  | "OTHER";

export type CustomerType =
  | "B2B"
  | "B2C";

export type ProductType =
  | "PHYSICAL_GOODS"
  | "DIGITAL_SERVICES"
  | "SAAS"
  | "EBOOK"
  | "OTHER";

export interface TaxInput {
  sellerCountry: string;
  buyerCountry: string;
  buyerState?: string;
  customerType: CustomerType;
  productType: ProductType;
  amount: number;
  hasValidVATID?: boolean;
}
