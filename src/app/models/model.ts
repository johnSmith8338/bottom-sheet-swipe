export interface Place {
    id: number;
    uid: string;
    name: string;
    city_id: number;
    address: string;
    longitude: number;
    latitude: number;
    image: string;
    media: {
        image: {
            big: string;
            small: string;
        };
    };
    metro: string[];
    options: string[];
    hall_cnt: number;
    phone_support: string;
    working_hours: string;
    concession_sales: boolean;
    sale_permission: boolean;
}