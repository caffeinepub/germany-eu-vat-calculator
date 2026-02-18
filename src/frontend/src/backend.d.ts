import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ZipFile {
    content: Uint8Array;
    filename: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface CsvFile {
    content: string;
    filename: string;
}
export interface CalculationResult {
    exchangeRateAdjustment: number;
    priceNetEuros: number;
    priceGrossEuros: number;
    vatRate: number;
    ifReverseChargeRequired: boolean;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface VatRateEntry {
    country: string;
    vatId?: bigint;
    percent: number;
    vatLabel: string;
}
export interface VatCalculation {
    vatIdNumber?: string;
    toCountry: string;
    priceGrossCents: bigint;
    vatRatePercent: number;
    category: ServiceProductCategory;
    fromCountry: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface PlanUsage {
    plan: PlanType;
    monthlyInvoices: bigint;
}
export interface MappedPlanUsage {
    plan: PlanType;
    invoicesThisMonth: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface InvoiceRecord {
    id: string;
    owner?: Principal;
    createdAt: Time;
    invoiceDate: string;
    vatLabel: string;
    invoiceNumber: string;
    currency: string;
    vatAmount: number;
    vatRate: number;
    htmlSource: string;
}
export interface ExcelFile {
    content: Uint8Array;
    filename: string;
}
export interface EventRecord {
    id: string;
    country: string;
    metadata: string;
    page: string;
    device: string;
    timestamp: Time;
    event_name: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface PdfFile {
    content: Uint8Array;
    filename: string;
}
export interface UserProfile {
    name: string;
}
export enum PlanType {
    pro = "pro",
    starter = "starter",
    free = "free",
    unsubscribed = "unsubscribed"
}
export enum ServiceProductCategory {
    consultingDevelopment = "consultingDevelopment",
    contentMediaDesign = "contentMediaDesign",
    others = "others",
    hardware = "hardware",
    hostingSupport = "hostingSupport"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addVatRate(id: bigint, rate: VatRateEntry): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculate(rate: VatCalculation): Promise<CalculationResult>;
    canICallApi(): Promise<string>;
    canSaveInvoice(): Promise<boolean>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    doesInvoiceNumberExist(invoiceNumber: string): Promise<boolean>;
    downloadInvoiceAsPdf(id: string): Promise<PdfFile>;
    downloadInvoicesAsZip(ids: Array<string>): Promise<ZipFile>;
    downloadMonthInvoicesAsZip(year: bigint, month: bigint): Promise<ZipFile>;
    exportInvoicesAsCsv(): Promise<CsvFile>;
    exportInvoicesAsExcel(): Promise<ExcelFile>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentPlan(): Promise<PlanType>;
    getCurrentPlanUsage(): Promise<PlanUsage>;
    getEvents(): Promise<Array<EventRecord>>;
    getEventsByName(eventName: string): Promise<Array<EventRecord>>;
    getInvoice(id: string): Promise<InvoiceRecord | null>;
    getLastCalculation(): Promise<VatCalculation | null>;
    getMappedPlanUsage(): Promise<MappedPlanUsage>;
    getSavedInvoiceNumbers(): Promise<Array<string>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUsage(fingerprint: string): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVatRates(): Promise<Array<VatRateEntry>>;
    incrementUsage(fingerprint: string): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listInvoices(): Promise<Array<InvoiceRecord>>;
    logEvent(event: EventRecord): Promise<void>;
    permissionCheck(): Promise<PlanType>;
    regressionTest(): Promise<boolean>;
    removeVatRate(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveInvoice(id: string, invoiceNumber: string, invoiceDate: string, htmlSource: string, vatAmount: number, vatRate: number, currency: string, vatLabel: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setUserPlan(user: Principal, plan: PlanType): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
