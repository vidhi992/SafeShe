export interface StateRegion {
  state: string;
  districts: string[];
  lat: number;
  lng: number;
}

export const INDIA_STATES_AND_UTS: StateRegion[] = [
  // --- 28 STATES ---
  {
    state: 'Andhra Pradesh',
    districts: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kakinada', 'Anantapur', 'Nellore', 'Kurnool'],
    lat: 15.9129,
    lng: 79.7400,
  },
  {
    state: 'Arunachal Pradesh',
    districts: ['Itanagar', 'Tawang', 'Naharlagun', 'Pasighat', 'Ziro'],
    lat: 28.2180,
    lng: 94.7278,
  },
  {
    state: 'Assam',
    districts: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tezpur'],
    lat: 26.2006,
    lng: 92.9376,
  },
  {
    state: 'Bihar',
    districts: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
    lat: 25.0961,
    lng: 85.3131,
  },
  {
    state: 'Chhattisgarh',
    districts: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Jagdalpur'],
    lat: 21.2787,
    lng: 81.8661,
  },
  {
    state: 'Goa',
    districts: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
    lat: 15.2993,
    lng: 74.1240,
  },
  {
    state: 'Gujarat',
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar'],
    lat: 22.2587,
    lng: 71.1924,
  },
  {
    state: 'Haryana',
    districts: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak'],
    lat: 29.0588,
    lng: 76.0856,
  },
  {
    state: 'Himachal Pradesh',
    districts: ['Shimla', 'Dharamshala', 'Manali', 'Solan', 'Mandi', 'Kullu'],
    lat: 31.1048,
    lng: 77.1734,
  },
  {
    state: 'Jharkhand',
    districts: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar'],
    lat: 23.6102,
    lng: 85.2799,
  },
  {
    state: 'Karnataka',
    districts: ['Bengaluru Urban', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Udupi'],
    lat: 15.3173,
    lng: 75.7139,
  },
  {
    state: 'Kerala',
    districts: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Kottayam'],
    lat: 10.8505,
    lng: 76.2711,
  },
  {
    state: 'Madhya Pradesh',
    districts: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Satna', 'Rewa'],
    lat: 22.9734,
    lng: 78.6569,
  },
  {
    state: 'Maharashtra',
    districts: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar', 'Solapur'],
    lat: 19.7515,
    lng: 75.7139,
  },
  {
    state: 'Manipur',
    districts: ['Imphal', 'Churachandpur', 'Thoubal', 'Bishnupur'],
    lat: 24.6637,
    lng: 93.9063,
  },
  {
    state: 'Meghalaya',
    districts: ['Shillong', 'Tura', 'Jowai', 'Nongpoh'],
    lat: 25.4670,
    lng: 91.3662,
  },
  {
    state: 'Mizoram',
    districts: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'],
    lat: 23.1645,
    lng: 92.9376,
  },
  {
    state: 'Nagaland',
    districts: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
    lat: 26.1584,
    lng: 94.5624,
  },
  {
    state: 'Odisha',
    districts: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Berhampur'],
    lat: 20.9517,
    lng: 85.0985,
  },
  {
    state: 'Punjab',
    districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
    lat: 31.1471,
    lng: 75.3412,
  },
  {
    state: 'Rajasthan',
    districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Bhilwara'],
    lat: 27.0238,
    lng: 74.2179,
  },
  {
    state: 'Sikkim',
    districts: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
    lat: 27.5330,
    lng: 88.5122,
  },
  {
    state: 'Tamil Nadu',
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore'],
    lat: 11.1271,
    lng: 78.6569,
  },
  {
    state: 'Telangana',
    districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
    lat: 18.1124,
    lng: 79.0193,
  },
  {
    state: 'Tripura',
    districts: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'],
    lat: 23.9408,
    lng: 91.9882,
  },
  {
    state: 'Uttar Pradesh',
    districts: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Noida', 'Prayagraj', 'Ghaziabad', 'Gorakhpur', 'Meerut'],
    lat: 26.8467,
    lng: 80.9462,
  },
  {
    state: 'Uttarakhand',
    districts: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Nainital', 'Rishikesh'],
    lat: 30.0668,
    lng: 79.0193,
  },
  {
    state: 'West Bengal',
    districts: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Kharagpur'],
    lat: 22.9868,
    lng: 87.8550,
  },

  // --- 8 UNION TERRITORIES ---
  {
    state: 'Andaman and Nicobar Islands',
    districts: ['Port Blair', 'Car Nicobar', 'Mayabunder'],
    lat: 11.7401,
    lng: 92.6586,
  },
  {
    state: 'Chandigarh',
    districts: ['Chandigarh'],
    lat: 30.7333,
    lng: 76.7794,
  },
  {
    state: 'Dadra and Nagar Haveli and Daman and Diu',
    districts: ['Daman', 'Diu', 'Silvassa'],
    lat: 20.4283,
    lng: 72.8397,
  },
  {
    state: 'Delhi',
    districts: ['New Delhi', 'North Delhi', 'South Delhi', 'West Delhi', 'East Delhi', 'Central Delhi'],
    lat: 28.6139,
    lng: 77.2090,
  },
  {
    state: 'Jammu and Kashmir',
    districts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
    lat: 33.7782,
    lng: 76.5762,
  },
  {
    state: 'Ladakh',
    districts: ['Leh', 'Kargil'],
    lat: 34.1526,
    lng: 77.5771,
  },
  {
    state: 'Lakshadweep',
    districts: ['Kavaratti', 'Agatti', 'Minicoy'],
    lat: 10.5667,
    lng: 72.6417,
  },
  {
    state: 'Puducherry',
    districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    lat: 11.9416,
    lng: 79.8083,
  },
];
