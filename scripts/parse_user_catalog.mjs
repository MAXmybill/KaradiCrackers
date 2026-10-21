import fs from 'fs';
import path from 'path';

// Complete Raw text provided by user
const rawText = `
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
10000 Wala	4500		
			
Gift Boxes	25  Items 	244	600
Gift Boxes	35  Items 	245	900
Gift Boxes	40  Items 	246	1100
Gift Boxes	50  Items 	247	1500
Gift Boxes	51  Items 	248	1900
Gift Boxes	60  Items 	249	2100
`;

const categoryMap = {
  'SATTAI': 'SATTAI',
  'SPARKLERS': 'SPARKLERS',
  'CHAKKRA & SPINNERS': 'CHAKKRA & SPINNERS',
  'FANCY CHAKKRA': 'CHAKKRA & SPINNERS',
  'FLOWER POTS': 'FLOWER POTS',
  'FANCY FLOWER POTS': 'FLOWER POTS',
  'GUJ F/P': 'GUJARAT POTS',
  'GUJARAT POTS': 'GUJARAT POTS',
  'FANCY GUJ F/P': 'GUJARAT POTS',
  'BOMBS': 'BOMBS',
  'MEGA BOMBS': 'BOMBS',
  'PAPER BOMBS': 'PAPER BOMBS',
  'KIDS': 'KIDS',
  'FANCY KIDS': 'KIDS',
  'ROCKETS': 'ROCKETS',
  'FANCY PIPES': 'FANCY PIPES',
  'MEGA PIPES': 'FANCY PIPES',
  'DAY FANCY': 'DAY FANCY',
  'NIGHT  SHOTS': 'NIGHT SHOTS',
  'NIGHT SHOTS': 'NIGHT SHOTS',
  'NIGHT FANCY': 'NIGHT FANCY',
  'NIGHT FANCY ': 'NIGHT FANCY',
  'WALA': 'WALA',
  'MEGA WALA': 'WALA',
  'GIFT BOXES': 'GIFT BOXES'
};

const lines = rawText.split('\n');
let currentCat = 'SATTAI';
const items = [];

for (const rawLine of lines) {
  const line = rawLine.trim();
  if (!line) continue;
  if (line.toLowerCase().startsWith('karadi crackers') || line.toLowerCase().startsWith('item name')) {
    continue;
  }

  // Check if Gift Boxes explicit tab line
  if (line.startsWith('Gift Boxes')) {
    const parts = line.split('\t').map(s => s.trim()).filter(Boolean);
    // Format: Gift Boxes \t 25 Items \t 244 \t 600
    if (parts.length >= 3) {
      const name = parts[1]; // "25 Items"
      const price = Number(parts[parts.length - 1]); // 600
      items.push({
        cat: 'GIFT BOXES',
        name: `Gift Box (${name})`,
        price: price,
        pieces: name
      });
      continue;
    }
  }

  // Check if category header
  const upperLine = line.toUpperCase().replace(/\t+/g, ' ').trim();
  if (categoryMap[upperLine]) {
    currentCat = categoryMap[upperLine];
    continue;
  }

  // Check if row has tab separated values
  const parts = line.split('\t').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const name = parts[0];
    const priceStr = parts[1].replace(/[^\d.]/g, '');
    const price = parseFloat(priceStr);
    if (!isNaN(price) && price > 0) {
      let pieces = '1 Box';
      const pcsMatch = name.match(/\((\d+\s*pcs?)\)/i);
      if (pcsMatch) pieces = pcsMatch[1];
      else if (currentCat === 'SPARKLERS') pieces = '10 Pcs';
      else if (currentCat === 'CHAKKRA & SPINNERS') pieces = '10 Pcs';
      else if (currentCat === 'FLOWER POTS') pieces = '10 Pcs';
      else if (currentCat === 'BOMBS') pieces = '10 Pcs';
      else if (currentCat === 'ROCKETS') pieces = '10 Pcs';

      items.push({
        cat: currentCat,
        name: name,
        price: price,
        pieces: pieces
      });
      continue;
    }
  }

  // In case of subheadings like "Fancy Chakkra", "Mega Bombs", etc without tabs
  const cleanedHeader = line.toUpperCase().replace(/\s+/g, ' ');
  if (categoryMap[cleanedHeader]) {
    currentCat = categoryMap[cleanedHeader];
    continue;
  }

  console.log(`Skipping subheader or non-priced line: "${line}"`);
}

console.log(`Total items parsed: ${items.length}`);
const catCounts = {};
items.forEach(i => catCounts[i.cat] = (catCounts[i.cat] || 0) + 1);
console.log('Categories count:', catCounts);

fs.writeFileSync(path.join(process.cwd(), 'parsed_new_stock.json'), JSON.stringify(items, null, 2), 'utf8');
console.log('Saved to parsed_new_stock.json');
