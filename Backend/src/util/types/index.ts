export enum TypeParkingSpaceType {
  A = "A",
  B = "B",
}
export type ParkingInchargeType = {
  id?: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  age: string;
  blood_grp: string;
  mobile_no: string;
  emergency_mob_no?: string;
  email_id?: string;
  cunique_id: number;
  address: string;
  kyc_doc?: Record<string, any>;
  fitness_doc?: Record<string, any>;
};

export type ParkingAreaType = {
  id?: number;
  address: string;
  zip_code: string;
  station: string;
  landmark: string;
  two_wheeler_capacity: string;
  four_wheeler_capacity: string;
  total_parking_area?: string;
  agreement_doc?: Record<string, any>;
  type_parking_space: TypeParkingSpaceType;
};
