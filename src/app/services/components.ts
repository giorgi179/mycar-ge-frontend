export interface CarImage {

  id:number;

  imageUrl:string;

}


export interface CarModels {

  id: number;

  city: string;

  carAge: string;

  carModel: string;

  carPrice: number;

  carType: string;

  fuelType: string;

  carImg: string;


  images: {
    id: number;
    imageUrl: string;
  }[];



  carDetals: {

    id?: number;

    manufacturer: string;

    mileage: string;

    engineVolume: string;

    cylinders: number;

    transmission: string;

    driveType: string;

    doors: string;

    airbags: number;

    steeringWheel: string;

    color: string;

    interiorColor: string;

    interiorMaterial: string;


    isExchangePossible: boolean;

    hasTechInspection: boolean;

    hasCatalyst: boolean;


    description: string;

    userPhone: string;

    vinCode: string;


  } | null;

}

export interface UserRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  reEnterPassword: string;
  userPhoto: File | null;
}

export interface Veryfi {
  email: string;
  verificationCode: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface UserToken {
  accessToken: string;
  refreshToken: string;
}


export interface PriceFilter {
  from: number | null;
  to: number | null;
}


export interface CarSearchParams {
  searchTerm?: string | null;

  manufacturer?: string | null;
  model?: string | null;
  location?: string | null;
  year?: string | null;

  price?: PriceFilter | null;

  fuel?: string | null;

  vinOnly?: boolean;
  priceNegotiableHidden?: boolean;

  transmission?: string | null;
  cylinders?: number | null;
  airbags?: number | null;

  steeringWheel?: string | null;
  driveType?: string | null;
  doors?: string | null;

  hasTechInspection?: boolean | null;
  hasCatalyst?: boolean | null;

  color?: string[];
  interiorMaterial?: string[];
  interiorColor?: string[];

  isExchangePossible?: boolean;
}