// Parser script to convert the user's new price list into structured catalog format
import fs from 'fs';

const rawText = `Item name	Selling price
	
	
Sattai	
1.5" twinkling stars	40
4" twinkling stars	90
Jil jil stars	40
	
Sparklers	
7cm Electric	20
7cm Crackling	22
7cm Green	22
7cm Red	25
10cm Electric	30
10cm Crackling	35
10cm Green	40
10cm Red	40
10cm Supreme Pink	60
12cm Electric	45
12cm Crackling	50
12cm Green	52
12cm Red	55
15cm Electric	70
15cm Crackling	75
15cm Green	75
15cm Red	85
30cm Electric	70
30cm Crackling	75
30cm Green	75
30cm Red	85
50cm Electric	300
50cm Colour	320
Lovely 	200
Super Deluxe  10 in 1	125
	
Chakkra & Spinners	
Chakkra Big(25pcs)	110
Ashoka Chakkra 	110
Special Chakkra	130
Deluxe Chakkra	120
Fancy Chakkra 	
Deluxe Chakkra (plastic)	220
Spinner Special	200
Spinner Deluxe min	170
Spinner Deluxe max	260
Vijay Zamin Chakkra	300
Wire Chakkra	250
Dancing Chakkra	330
Reverse Chakkra	110
Whistle Wheel 	280
Whistle Chakkra	200
	
Flower pots	
FP. Big	120
FP. Special	140
FP. Ashoka plus	280
FP. Ashoka	220
FP. Giant	120
FP.Deluxe	120
FP. Col-Koti	340
Fancy Flower pots	
RSR Colour Koti  delx	450
FP.Elegant	520
FP.sizzing fountain	600
FP.Color Buster	600
FP.Multi color pots	800
FP.Lucky	350
FP.Gypsy (5pcs)	320
Mini Tricolor	320
Tricolor	360
RSR Tricolor	500
sonny Violet pots	1000
	
Guj F/P	
Rim gim	180
Rim gim Delx	400
Rim gim panchanga	200
Mini pearl 	260
Fancy Guj F/P	
Rim Jasmin	600
Rim Asaraf	600
Rim Magic Star	600
2 in 1 rim gim 	650
Colour Change rim gim	900
Popcorn Rim gim	520
Gift mega pack	1200
	
Bombs	
Jallikattu	60
Jallikattu delx	90
Lion king	110
Hulk	50
2 3/4" Kuruvi	13
3 1/2" Kuruvi	30
3 1/2" Lakshmi	17
4" Lakshmi	22
4" Deluxe Lakshmi	46
4"1/2  Bahubali	65
Gold Lakshmi	43
Gold Deluxe Lakshmi	63
2 Sound	48
Hydro bomb	120
Mega Bombs	
Gorilla bomb	160
King bomb	190
Classic  Bomb	230
Dinosaur bomb	280
Agni Bomb	300
Gypsy bomb	340
Digital Bomb	345
King Rider	380
Military bomb	400
	
	
Paper Bombs	
1/4 Kg Paper Bomb	80
1/2  Kg Paper Bomb	150
1kg  Paper Bomb	300
	
Kids	
Red bijli	65
Stripped  bijli	65
Snake tablet Big	340
Thar Car	350
Men In Black Gun	190
Ring Caps	20
Sahara Gun 3200	560
Sahara Gun 1400	240
Sahara Gun 800	140
Boss Baby	260
Cylinder 	240
Big Giant Gun	840
Fancy Kids	
Elephant toys 	370
Simba Fountain	400
Kunfupanda foun	400
Marvel Hammer Ajanta	490
Tik tok 	280
Pizza	700
Vel Toys	300
Pubg Gun	360
	
Rockets	
Whistling Rocket	200
Whistling Rocket Delx	300
3 Sound Rocket	220
2 Sound Rocket	200
2 Sound Rocket Delx	240
NASA Rocket	150
Lunik Rocket	200
	
Fancy Pipes	
1½ 3pcs link 	320
2" Sky shot	240
2½" Sky shot	250
2" sky shot (2pcs)	500
2½ Tesco (2pcs)	600
RSR 2 Fancy (3pcs) 	600
2½ Fancy 3 pcs Starvell	700
Mega Pipes	
3"1/2 Niagara	580
4" Single	550
4" Niagara 2pcs	1600
4" (2pcs)  	1500
3"½ Single	600
3"½ NSV (2pcs)	900
3½ double ball (sastha)	800
6" Pipe Sastha	1400
Wow Star Purple 4"1/2	800
Wow Star Golden 4"1/2	800
wow star starwars 4"1/2	800
wow star colors 4"1/2	800
7 step pipe  4"	800
shammah 7 step  4"1/2 (2pcs)	1500
Holiday (2pcs)	1600
Twin towers(2pcs)	1700
Vertex 4" (3Pcs)	2700
5"1/2 triple treat (3pcs)	3200
Dancing Shooter (Mothers)	450
6" RR(2pcs)	2300
nayagara (2pcs)	1200
	
	
Day Fancy	
15 shot" colour smoke 	700
90 Watts	180
Smoke	180
Smoke XL	260
	
Night  Shots	
Tejas  Hand Shot 	2500
12 Shot "	300
12 Shot " legends	350
20 shot"	600
30 Shot "	850
30 Shot " Delx	950
Pink Shot	1900
60 Shot" Maan	1500
60 Shot" Delx	1650
120 Shot "	2800
240 Shot "	5500
30 setout, 2.5"	6000
25 setout , 3"	6500
Gang Bangers	5000
3*10 IPL shot	1500
10*10 IPL	5500
	
Night Fancy 	
 Sun, Star, Moon Delx	150
Mothers Sun, Star, Moon 	130
Red Sun , Moon , star	550
KitKat Jeyams	40
Chit Put 	100
Chit Put (Mothers)	100
1000W Mega Fountains	300
2000W Mega Fountains	350
5000W Mega Fountains	400
Teddy 5pcs	450
Jolly bolly Mocktail	900
King Star	350
Mega Crackling Coconut (3 Pcs)	520
4" Tin single pc	130
Tin 2Pcs Pack	300
Tin 3Pcs Pack	550
Lemontree Ayyan	220
Thirumalas lemon tree	200
Color Rain	150
Feather Drops	150
Golden Drops	150
Green star	450
Gold Coin	450
Little Star 	450
Golden Star 	200
Titanic  Drops	520
Amaze fountain	400
Red Robo	200
oyobla	300
Min Mini	250
RSR Minions	300
Polo 	100
Ice Fountains	300
Twix	250
Colour Collection	350
Penta Force 	250
Lucky penta	250
Color Deluxe Penta 	400
Planet Wheel starvell (2 Pcs)	360
Monkey star starvell	360
Welcome Shower (Water Queen)	360
Waterqueen (ALL)	140
Butterfly	100
Lollipop	280
chin chan starvell	180
i cone	200
Pink Bada Peacock	750
Bada Peacock 	700
RSR Peacock	250
wowstar  Peacock	350
Mega Peacock	250
Motu Patlu	500
4×4 Wheel	
Welcome Shower  Delx	350
Water pencil	250
Starwell Race Car	800
Vadivel Poem	700
Mad Angles inf	550
Ayyans Little Dove	110
Deva Mega Siren 	320
Siren Small	200
Siren Big (5+5)	220
	
Wala	
28 Giant	40
56 Giant	80
Shower	150
100 Wala	80
24 Mega Delx wala	600
50 Mega Delx wala	300
100 Delx wala	520
	
Mega Wala 	
1000 Wala	500
2000 Wala	1000
5000 Wala	2250
10000 Wala	4500`;

// Known pieces mappings helper
const PIECES_MAP = {
  "1.5\" twinkling stars": "1 Box",
  "4\" twinkling stars": "1 Box",
  "Jil jil stars": "1 Box",
  "7cm Electric": "10 Pcs",
  "7cm Crackling": "10 Pcs",
  "7cm Green": "10 Pcs",
  "7cm Red": "10 Pcs",
  "10cm Electric": "10 Pcs",
  "10cm Crackling": "10 Pcs",
  "10cm Green": "10 Pcs",
  "10cm Red": "10 Pcs",
  "10cm Supreme Pink": "10 Pcs",
  "12cm Electric": "10 Pcs",
  "12cm Crackling": "10 Pcs",
  "12cm Green": "10 Pcs",
  "12cm Red": "10 Pcs",
  "15cm Electric": "10 Pcs",
  "15cm Crackling": "10 Pcs",
  "15cm Green": "10 Pcs",
  "15cm Red": "10 Pcs",
  "30cm Electric": "5 Pcs",
  "30cm Crackling": "5 Pcs",
  "30cm Green": "5 Pcs",
  "30cm Red": "5 Pcs",
  "50cm Electric": "5 Pcs",
  "50cm Colour": "5 Pcs",
  "Lovely": "1 Box",
  "Super Deluxe  10 in 1": "10 In 1 Box",
  "Chakkra Big(25pcs)": "25 Pcs",
  "Ashoka Chakkra": "10 Pcs",
  "Special Chakkra": "10 Pcs",
  "Deluxe Chakkra": "10 Pcs",
  "Deluxe Chakkra (plastic)": "10 Pcs",
  "Spinner Special": "10 Pcs",
  "Spinner Deluxe min": "10 Pcs",
  "Spinner Deluxe max": "10 Pcs",
  "Vijay Zamin Chakkra": "10 Pcs",
  "Wire Chakkra": "10 Pcs",
  "Dancing Chakkra": "5 Pcs",
  "Reverse Chakkra": "10 Pcs",
  "Whistle Wheel": "5 Pcs",
  "Whistle Chakkra": "5 Pcs",
  "FP. Big": "10 Pcs",
  "FP. Special": "10 Pcs",
  "FP. Ashoka plus": "10 Pcs",
  "FP. Ashoka": "10 Pcs",
  "FP. Giant": "10 Pcs",
  "FP.Deluxe": "10 Pcs",
  "FP. Col-Koti": "10 Pcs",
  "RSR Colour Koti  delx": "10 Pcs",
  "FP.Elegant": "5 Pcs",
  "FP.sizzing fountain": "5 Pcs",
  "FP.Color Buster": "5 Pcs",
  "FP.Multi color pots": "5 Pcs",
  "FP.Lucky": "5 Pcs",
  "FP.Gypsy (5pcs)": "5 Pcs",
  "Mini Tricolor": "5 Pcs",
  "Tricolor": "5 Pcs",
  "RSR Tricolor": "5 Pcs",
  "sonny Violet pots": "5 Pcs",
  "Rim gim": "1 Box",
  "Rim gim Delx": "1 Box",
  "Rim gim panchanga": "1 Box",
  "Mini pearl": "1 Box",
  "Rim Jasmin": "1 Box",
  "Rim Asaraf": "1 Box",
  "Rim Magic Star": "1 Box",
  "2 in 1 rim gim": "1 Box",
  "Colour Change rim gim": "1 Box",
  "Popcorn Rim gim": "1 Box",
  "Gift mega pack": "1 Box",
  "Jallikattu": "10 Pcs",
  "Jallikattu delx": "10 Pcs",
  "Lion king": "10 Pcs",
  "Hulk": "10 Pcs",
  "2 3/4\" Kuruvi": "1 Pkt (8 Pcs)",
  "3 1/2\" Kuruvi": "1 Pkt (8 Pcs)",
  "3 1/2\" Lakshmi": "1 Pkt (8 Pcs)",
  "4\" Lakshmi": "1 Pkt (8 Pcs)",
  "4\" Deluxe Lakshmi": "1 Pkt (8 Pcs)",
  "4\"1/2  Bahubali": "1 Pkt (8 Pcs)",
  "Gold Lakshmi": "1 Pkt (8 Pcs)",
  "Gold Deluxe Lakshmi": "1 Pkt (8 Pcs)",
  "2 Sound": "10 Pcs",
  "Hydro bomb": "10 Pcs",
  "Gorilla bomb": "10 Pcs",
  "King bomb": "10 Pcs",
  "Classic  Bomb": "10 Pcs",
  "Dinosaur bomb": "10 Pcs",
  "Agni Bomb": "10 Pcs",
  "Gypsy bomb": "10 Pcs",
  "Digital Bomb": "1 Box (10 Pcs)",
  "King Rider": "10 Pcs",
  "Military bomb": "10 Pcs",
  "1/4 Kg Paper Bomb": "1 Pc",
  "1/2  Kg Paper Bomb": "1 Pc",
  "1kg  Paper Bomb": "1 Pc",
  "Red bijli": "1 Pkt (100 Pcs)",
  "Stripped  bijli": "1 Pkt (100 Pcs)",
  "Snake tablet Big": "1 Box",
  "Thar Car": "1 Pc",
  "Men In Black Gun": "1 Pc",
  "Ring Caps": "1 Box (9 Rings)",
  "Sahara Gun 3200": "1 Pc",
  "Sahara Gun 1400": "1 Pc",
  "Sahara Gun 800": "1 Pc",
  "Boss Baby": "1 Pc",
  "Cylinder": "1 Box",
  "Big Giant Gun": "1 Pc",
  "Elephant toys": "1 Box",
  "Simba Fountain": "1 Box",
  "Kunfupanda foun": "1 Box",
  "Marvel Hammer Ajanta": "1 Box",
  "Tik tok": "1 Box",
  "Pizza": "1 Box",
  "Vel Toys": "1 Box",
  "Pubg Gun": "1 Pc",
  "Whistling Rocket": "10 Pcs",
  "Whistling Rocket Delx": "10 Pcs",
  "3 Sound Rocket": "10 Pcs",
  "2 Sound Rocket": "10 Pcs",
  "2 Sound Rocket Delx": "10 Pcs",
  "NASA Rocket": "10 Pcs",
  "Lunik Rocket": "10 Pcs",
  "1½ 3pcs link": "3 Pcs",
  "2\" Sky shot": "1 Pc",
  "2½\" Sky shot": "1 Pc",
  "2\" sky shot (2pcs)": "2 Pcs",
  "2½ Tesco (2pcs)": "2 Pcs",
  "RSR 2 Fancy (3pcs)": "3 Pcs",
  "2½ Fancy 3 pcs Starvell": "3 Pcs",
  "3\"1/2 Niagara": "1 Pc",
  "4\" Single": "1 Pc",
  "4\" Niagara 2pcs": "2 Pcs",
  "4\" (2pcs)": "2 Pcs",
  "3\"½ Single": "1 Pc",
  "3\"½ NSV (2pcs)": "2 Pcs",
  "3½ double ball (sastha)": "1 Pc",
  "6\" Pipe Sastha": "1 Pc",
  "Wow Star Purple 4\"1/2": "1 Pc",
  "Wow Star Golden 4\"1/2": "1 Pc",
  "wow star starwars 4\"1/2": "1 Pc",
  "wow star colors 4\"1/2": "1 Pc",
  "7 step pipe  4\"": "1 Pc",
  "shammah 7 step  4\"1/2 (2pcs)": "2 Pcs",
  "Holiday (2pcs)": "2 Pcs",
  "Twin towers(2pcs)": "2 Pcs",
  "Vertex 4\" (3Pcs)": "3 Pcs",
  "5\"1/2 triple treat (3pcs)": "3 Pcs",
  "Dancing Shooter (Mothers)": "1 Pc",
  "6\" RR(2pcs)": "2 Pcs",
  "nayagara (2pcs)": "2 Pcs",
  "15 shot\" colour smoke": "1 Box",
  "90 Watts": "1 Box",
  "Smoke": "1 Box",
  "Smoke XL": "1 Box",
  "Tejas  Hand Shot": "1 Pc",
  "12 Shot \"": "1 Pc",
  "12 Shot \" legends": "1 Pc",
  "20 shot\"": "1 Pc",
  "30 Shot \"": "1 Pc",
  "30 Shot \" Delx": "1 Pc",
  "Pink Shot": "1 Pc",
  "60 Shot\" Maan": "1 Pc",
  "60 Shot\" Delx": "1 Pc",
  "120 Shot \"": "1 Pc",
  "240 Shot \"": "1 Pc",
  "30 setout, 2.5\"": "1 Box",
  "25 setout , 3\"": "1 Box",
  "Gang Bangers": "1 Box",
  "3*10 IPL shot": "1 Box",
  "10*10 IPL": "1 Box",
  "Sun, Star, Moon Delx": "1 Box",
  "Mothers Sun, Star, Moon": "1 Box",
  "Red Sun , Moon , star": "1 Box",
  "KitKat Jeyams": "1 Box",
  "Chit Put": "1 Box",
  "Chit Put (Mothers)": "1 Box",
  "1000W Mega Fountains": "1 Pc",
  "2000W Mega Fountains": "1 Pc",
  "5000W Mega Fountains": "1 Pc",
  "Teddy 5pcs": "5 Pcs",
  "Jolly bolly Mocktail": "1 Box",
  "King Star": "1 Box",
  "Mega Crackling Coconut (3 Pcs)": "3 Pcs",
  "4\" Tin single pc": "1 Pc",
  "Tin 2Pcs Pack": "2 Pcs",
  "Tin 3Pcs Pack": "3 Pcs",
  "Lemontree Ayyan": "1 Box",
  "Thirumalas lemon tree": "1 Box",
  "Color Rain": "1 Box",
  "Feather Drops": "1 Box",
  "Golden Drops": "1 Box",
  "Green star": "1 Box",
  "Gold Coin": "1 Box",
  "Little Star": "1 Box",
  "Golden Star": "1 Box",
  "Titanic  Drops": "1 Box",
  "Amaze fountain": "1 Box",
  "Red Robo": "1 Box",
  "oyobla": "1 Box",
  "Min Mini": "1 Box",
  "RSR Minions": "1 Box",
  "Polo": "1 Box",
  "Ice Fountains": "4 Pcs",
  "Twix": "1 Box",
  "Colour Collection": "1 Box",
  "Penta Force": "1 Box",
  "Lucky penta": "1 Box",
  "Color Deluxe Penta": "1 Box",
  "Planet Wheel starvell (2 Pcs)": "2 Pcs",
  "Monkey star starvell": "1 Box",
  "Welcome Shower (Water Queen)": "1 Box",
  "Waterqueen (ALL)": "1 Box",
  "Butterfly": "1 Box",
  "Lollipop": "1 Box",
  "chin chan starvell": "1 Box",
  "i cone": "1 Box",
  "Pink Bada Peacock": "1 Box",
  "Bada Peacock": "1 Box",
  "RSR Peacock": "1 Box",
  "wowstar  Peacock": "1 Box",
  "Mega Peacock": "1 Box",
  "Motu Patlu": "1 Box",
  "4×4 Wheel": "1 Box",
  "Welcome Shower  Delx": "1 Box",
  "Water pencil": "1 Box",
  "Starwell Race Car": "1 Pc",
  "Vadivel Poem": "1 Box",
  "Mad Angles inf": "1 Box",
  "Ayyans Little Dove": "1 Box",
  "Deva Mega Siren": "1 Box",
  "Siren Small": "1 Box",
  "Siren Big (5+5)": "1 Box (10 Pcs)",
  "28 Giant": "1 Pkt",
  "56 Giant": "1 Pkt",
  "Shower": "1 Box",
  "100 Wala": "1 Box",
  "24 Mega Delx wala": "1 Box",
  "50 Mega Delx wala": "1 Box",
  "100 Delx wala": "1 Box",
  "1000 Wala": "1 Box",
  "2000 Wala": "1 Box",
  "5000 Wala": "1 Box",
  "10000 Wala": "1 Box"
};

const lines = rawText.split('\n');
let currentCategory = 'GENERAL';
const items = [];

for (const rawLine of lines) {
  const line = rawLine.trim();
  if (!line || line.startsWith('Item name')) continue;

  const parts = rawLine.split('\t').map(p => p.trim());
  const name = parts[0] || '';
  const priceStr = parts[1] || '';

  // Check if it's a category header
  if (!priceStr || isNaN(Number(priceStr))) {
    // Subheaders or category headers
    const upper = name.toUpperCase();
    if (upper === 'SATTAI') currentCategory = 'SATTAI';
    else if (upper === 'SPARKLERS') currentCategory = 'SPARKLERS';
    else if (upper.includes('CHAKKRA') || upper.includes('SPINNERS')) currentCategory = 'CHAKKRA & SPINNERS';
    else if (upper.includes('FLOWER POTS')) currentCategory = 'FLOWER POTS';
    else if (upper.includes('GUJ F/P')) currentCategory = 'GUJARAT POTS';
    else if (upper.includes('BOMBS')) currentCategory = 'BOMBS';
    else if (upper.includes('PAPER BOMBS')) currentCategory = 'PAPER BOMBS';
    else if (upper.includes('KIDS')) currentCategory = 'KIDS';
    else if (upper.includes('ROCKETS')) currentCategory = 'ROCKETS';
    else if (upper.includes('FANCY PIPES') || upper.includes('MEGA PIPES')) currentCategory = 'FANCY PIPES';
    else if (upper.includes('DAY FANCY')) currentCategory = 'DAY FANCY';
    else if (upper.includes('NIGHT  SHOTS') || upper.includes('NIGHT SHOTS')) currentCategory = 'NIGHT SHOTS';
    else if (upper.includes('NIGHT FANCY') || upper.includes('NIGHT FANCY')) currentCategory = 'NIGHT FANCY';
    else if (upper.includes('MEGA WALA') || upper.includes('WALA')) currentCategory = 'WALA';
    else {
      // Sub-heading or item without price (e.g. "Fancy Chakkra", "4×4 Wheel")
      console.log(`Skipping subheader or empty-price row: "${name}"`);
    }
    continue;
  }

  const sellingPrice = Number(priceStr);
  const pieces = PIECES_MAP[name] || PIECES_MAP[name.trim()] || (currentCategory === 'BOMBS' ? '10 Pcs' : '1 Box');

  items.push({
    cat: currentCategory,
    name: name.trim(),
    price: sellingPrice,
    pieces
  });
}

console.log(`Parsed ${items.length} items successfully!`);
fs.writeFileSync('parsed_new_stock.json', JSON.stringify(items, null, 2), 'utf8');
