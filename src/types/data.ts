export interface DataPoint {
  doba: string;
  rce_pln: number;
  udtczas: string;
  udtczas_oreb: string;
  business_date: string;
  source_datetime: string;
}

export interface DataStructure {
  value: DataPoint[];
}