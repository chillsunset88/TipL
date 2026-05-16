export interface CountryData {
  name: string;
  imageUrl: string;
  flag: string;
  cities: string[];
}

export const COUNTRIES_DATA: CountryData[] = [
  {
    name: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
    flag: '🇯🇵',
    cities: ['Tokyo', 'Osaka', 'Kyoto', 'Nagoya', 'Sapporo', 'Hiroshima', 'Fukuoka', 'Nara', 'Kobe', 'Yokohama', 'Sendai', 'Kanazawa', 'Nagasaki', 'Okinawa', 'Hakone'],
  },
  {
    name: 'South Korea',
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600',
    flag: '🇰🇷',
    cities: ['Seoul', 'Busan', 'Jeju', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Suwon', 'Jeonju', 'Gyeongju', 'Sokcho', 'Yeosu', 'Pohang', 'Changwon'],
  },
  {
    name: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600',
    flag: '🇸🇬',
    cities: ['Marina Bay', 'Orchard', 'Sentosa', 'Clarke Quay', 'Chinatown', 'Little India', 'Bugis', 'Jurong East', 'Tampines', 'Woodlands', 'Raffles Place', 'Tanjong Pagar', 'Changi', 'Bedok', 'Queenstown'],
  },
  {
    name: 'United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600',
    flag: '🇬🇧',
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Liverpool', 'Leeds', 'Oxford', 'Cambridge', 'Bristol', 'Bath', 'Nottingham', 'Sheffield', 'Newcastle', 'Cardiff'],
  },
  {
    name: 'France',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    flag: '🇫🇷',
    cities: ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nice', 'Strasbourg', 'Toulouse', 'Nantes', 'Montpellier', 'Lille', 'Rennes', 'Cannes', 'Monaco', 'Versailles', 'Annecy'],
  },
  {
    name: 'United States',
    imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600',
    flag: '🇺🇸',
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco', 'Seattle', 'Las Vegas', 'Boston', 'Washington DC', 'Atlanta', 'Dallas', 'Denver', 'Portland', 'Nashville'],
  },
  {
    name: 'Australia',
    imageUrl: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600',
    flag: '🇦🇺',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Darwin', 'Hobart', 'Cairns', 'Byron Bay', 'Surfers Paradise', 'Newcastle', 'Wollongong', 'Geelong'],
  },
  {
    name: 'Germany',
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600',
    flag: '🇩🇪',
    cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Dresden', 'Nuremberg', 'Leipzig', 'Bremen', 'Hannover', 'Heidelberg', 'Freiburg', 'Potsdam'],
  },
  {
    name: 'Italy',
    imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=600',
    flag: '🇮🇹',
    cities: ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Bologna', 'Turin', 'Verona', 'Palermo', 'Genoa', 'Bari', 'Catania', 'Amalfi', 'Cinque Terre', 'Capri'],
  },
  {
    name: 'Thailand',
    imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600',
    flag: '🇹🇭',
    cities: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi', 'Koh Samui', 'Hua Hin', 'Koh Tao', 'Pai', 'Kanchanaburi', 'Ayutthaya', 'Sukhothai', 'Koh Lanta', 'Rai Leh', 'Mae Hong Son'],
  },
  {
    name: 'UAE',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600',
    flag: '🇦🇪',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Al Ain', 'Umm Al Quwain', 'Dubai Marina', 'Downtown Dubai', 'Jumeirah', 'Deira', 'Bur Dubai', 'Palm Jumeirah', 'JBR'],
  },
  {
    name: 'Malaysia',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600',
    flag: '🇲🇾',
    cities: ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Kota Kinabalu', 'Kuching', 'Malacca', 'Langkawi', 'Ipoh', 'Petaling Jaya', 'Shah Alam', 'Subang Jaya', 'Pahang', 'Terengganu', 'Genting Highlands', 'Cameron Highlands'],
  },
  {
    name: 'China',
    imageUrl: 'https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=600',
    flag: '🇨🇳',
    cities: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Xi\'an', 'Hangzhou', 'Nanjing', 'Chongqing', 'Wuhan', 'Suzhou', 'Guilin', 'Lijiang', 'Zhangjiajie', 'Yunnan'],
  },
  {
    name: 'Turkey',
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600',
    flag: '🇹🇷',
    cities: ['Istanbul', 'Antalya', 'Ankara', 'Izmir', 'Cappadocia', 'Bodrum', 'Marmaris', 'Alanya', 'Trabzon', 'Bursa', 'Fethiye', 'Kemer', 'Pamukkale', 'Ephesus', 'Troy'],
  },
  {
    name: 'Netherlands',
    imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600',
    flag: '🇳🇱',
    cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Delft', 'Leiden', 'Maastricht', 'Haarlem', 'Bruges', 'Tilburg', 'Nijmegen', 'Enschede', 'Breda'],
  },
  {
    name: 'Switzerland',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    flag: '🇨🇭',
    cities: ['Zurich', 'Geneva', 'Bern', 'Basel', 'Lausanne', 'Lucerne', 'Interlaken', 'Zermatt', 'St. Moritz', 'Lugano', 'Montreux', 'Locarno', 'Grindelwald', 'Davos', 'Verbier'],
  },
  {
    name: 'Spain',
    imageUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600',
    flag: '🇪🇸',
    cities: ['Barcelona', 'Madrid', 'Seville', 'Valencia', 'Bilbao', 'Granada', 'Malaga', 'Ibiza', 'Palma', 'Toledo', 'Santander', 'Cordoba', 'San Sebastian', 'Alicante', 'Zaragoza'],
  },
  {
    name: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600',
    flag: '🇮🇳',
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Jaipur', 'Agra', 'Goa', 'Kerala', 'Udaipur', 'Varanasi', 'Amritsar', 'Darjeeling', 'Rishikesh'],
  },
  {
    name: 'Hong Kong',
    imageUrl: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=600',
    flag: '🇭🇰',
    cities: ['Central', 'Tsim Sha Tsui', 'Mong Kok', 'Causeway Bay', 'Wan Chai', 'Sham Shui Po', 'Kowloon City', 'Lantau Island', 'Sha Tin', 'Tuen Mun', 'Yuen Long', 'Tai Po', 'Sai Kung', 'Stanley', 'Repulse Bay'],
  },
  {
    name: 'Taiwan',
    imageUrl: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=600',
    flag: '🇹🇼',
    cities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Hsinchu', 'Keelung', 'Taoyuan', 'Jiufen', 'Hualien', 'Taroko', 'Sun Moon Lake', 'Kenting', 'Alishan', 'Yilan', 'Penghu'],
  },
];

export function getCountryData(name: string): CountryData | undefined {
  return COUNTRIES_DATA.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}
