// HALFLIT catalogue. Images are Higgsfield generations served from its CDN;
// each is referenced by job id and resolved to a URL through IMAGES.
(function (global) {
  "use strict";

  const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3IyamoeRdPrHnqa8Qdx1XvZjWur/";

  // job id -> filename timestamp prefix
  const IMAGES = {
    "c6bc42ba-8167-4854-8001-4c368c15f9ee": "hf_20260927_020958",
    "efdb994e-d727-410c-a812-8eb5bbfb8ef0": "hf_20260927_020959",
    "2a74e700-8848-42d4-b771-00415f416c40": "hf_20260927_020959",
    "f670bc5f-8887-4e36-be07-d091f3657ef9": "hf_20260927_020959",
    "a302a70f-bae7-4bbe-b2e6-c896e4bcce5a": "hf_20260927_020959",
    "4274e901-a123-4d00-845c-53d827073f3e": "hf_20260927_020959",
    "29810115-af4b-4162-9484-8a6bb4636d3c": "hf_20260927_020959",
    "59387655-3c13-4f5d-b446-fd2aad5cf0ff": "hf_20260927_020959",
    "c21c36e1-6ec3-4d78-8e0c-d10138749180": "hf_20260927_020959",
    "9fc32808-d78e-44e9-927e-cb5f998aecfc": "hf_20260927_020959",
    "005bc4aa-91db-4007-bbda-a6f6dae78af7": "hf_20260927_020959",
    "7ac11bbf-25dc-490b-8658-dbbc4a147b79": "hf_20260927_020747",
    "45cabaac-c5f4-42a3-ade5-32a8c8ad2f93": "hf_20260927_020748",
    "8b88747e-c272-45d4-aa00-3f8370965e86": "hf_20260927_020748",
    "d588e579-8bc7-4d0a-8d0c-077911ad9854": "hf_20260927_021124",
    "880ac191-78dd-4cbe-a9ad-86e36bfd8989": "hf_20260927_021124",
    "b0388a2b-98c8-42dc-a354-145bd54a9476": "hf_20260927_021124",
    "b60f1933-cd7e-4b9d-a500-4352647cc7c1": "hf_20260927_021124",
    "5511d01a-70a6-405f-94c1-f197e2ca35b4": "hf_20260927_021124",
    "b69f3182-a10d-4f78-bd1b-0af635e42659": "hf_20260927_021124",
    "c06e0112-1c1f-472e-8eaf-ecd8f5b2252c": "hf_20260927_021124",
    "bf784806-2c09-42fa-b67c-11b9ff51895e": "hf_20260927_021124",
    "98a1b8ea-fb7d-4eb4-aa90-5b86c6222c15": "hf_20260927_021125",
    "2341cdff-6d27-4a45-be1d-2e695729ae07": "hf_20260927_021124",
    "87b30be3-224c-4d31-b300-7553adeb26b2": "hf_20260927_021124",
    "15c94aee-14db-4dbe-bf3e-947221511e26": "hf_20260927_021247",
    "dd56815c-c2b0-4118-9770-11030fa25785": "hf_20260927_021247",
    "3a731e8c-0b7d-485d-9d4b-0f0ff45525c4": "hf_20260927_021247",
    "b060d1a7-8621-4ae6-9e91-ca5fe96a8c93": "hf_20260927_021247",
    "6c6f2057-d8c5-4ecb-b3bb-194a50a3a80e": "hf_20260927_021247",
    "943ff9f3-996e-4c00-85f8-7038ebafaaec": "hf_20260927_021247",
    "e6708645-c2f7-42b3-a6d3-0753bf4bec6a": "hf_20260927_021247",
    "f00ed8a1-725e-42da-a9b2-adca66cb9dbc": "hf_20260927_021247",
    "505bfd4a-9088-403d-a12b-c2bc60f71fc8": "hf_20260927_021247",
    "7bca1289-8ee9-49fe-a051-0c7061a110c7": "hf_20260927_021340",
    "82c1a895-f271-47af-99ba-bd903cc080af": "hf_20260927_021340",
    "e16fc09f-bdb3-49d1-9dcd-e01d3644c5fb": "hf_20260927_021340",
    "85a57fcc-ac25-40b2-b6af-b89b47e0fc1f": "hf_20260927_021340",
    "1b149e71-6035-43cb-96ab-9191874bba17": "hf_20260927_021506",
    "4c704fa0-373a-4283-a0bd-32d0c6a4c6d1": "hf_20260927_021505",
    "4c32799e-f19f-4c3b-b067-bd6f69b9fde2": "hf_20260927_021506",
    "23c67a67-18aa-41bd-a5ee-dc856ba7c444": "hf_20260927_021506",
    "e7f74614-0fbf-47fd-8b1e-addb54d0cfb9": "hf_20260927_021713",
    "eb7c348d-8909-4d39-8884-764200951840": "hf_20260927_021713",
    "4e7be762-2623-48b8-9d79-e8e10c61a498": "hf_20260927_021714",
    "8b4077f9-a2b0-4688-9f87-efd1276ea0ac": "hf_20260927_021714",
    "151f4055-3935-4a04-8d04-73603ad0dfb5": "hf_20260927_021842",
    "7f97cf52-fcd8-4d58-b6fc-00d65db78fcc": "hf_20260927_021842",
    "386c25db-bf08-4392-b7ff-8fe54932a973": "hf_20260927_021842",
    "f6d65b42-370b-4f3f-ae05-17e0a0616823": "hf_20260927_021842",
    "2a9c147c-9c21-4a5e-ab3c-9cf52ee56293": "hf_20260927_022114",
    "087d6fc3-80c6-4bec-a33f-19ba11b280bd": "hf_20260927_022114",
    "354d4169-d10e-4e05-bbbb-37c17eecb15e": "hf_20260927_022114",
    "93760f3d-0898-42f0-943f-0f99c2f0c973": "hf_20260927_022114",
    "7e50b9be-3b40-4271-9cde-e2dc822337ad": "hf_20260927_022212",
    "eeb9d808-fcf9-4069-b648-7280bf6d34e6": "hf_20260927_022212",
    "4dab2751-7204-47fb-b626-cc056985e2b7": "hf_20260927_022211",
    "6177aabf-4b8f-459e-bf1d-8b48da403d1c": "hf_20260927_022211",
    "2707e824-2fec-4af9-addc-8dcde548f7d2": "hf_20260927_022309",
    "5f3ecbaf-10b1-4b8b-a1f4-1eab5c90bb5d": "hf_20260927_022309",
    "983897c1-d31b-4302-83fc-d0453c5be493": "hf_20260927_022309",
    "6944b169-4e2f-49ff-a1b1-b9770e6713fb": "hf_20260927_022309",
    "843580f7-2a50-44cd-aaf6-41b172f672ca": "hf_20260927_022408",
    "acba9b34-1150-4267-b259-9e6907729716": "hf_20260927_022408",
    "7b28da40-99b9-467d-994c-ba7bff397780": "hf_20260927_022408",
    "b99678e0-9a61-4525-8118-ebda421d8071": "hf_20260927_022408",
    "0ec5fc03-efdf-4b70-b268-a42691b60861": "hf_20260927_022508",
    "f0d96d79-7b79-4b3e-961f-5fdc930a9b3b": "hf_20260927_022510",
    "b06d9546-975d-412f-a721-a20cd24209a9": "hf_20260927_022509",
    "1a564913-c0d3-42ec-8e2e-bc35b1fa6562": "hf_20260927_022508",
    "b12fad22-80ea-4848-9426-19c99fd64267": "hf_20260927_022613",
    "efdce79e-f8c9-48bb-be0a-aeac750de0dd": "hf_20260927_022612",
    "84327b99-4734-4af5-961f-4502eff5e2b2": "hf_20260927_022613",
    "13fffd53-3428-4b94-98f0-42a603f1b003": "hf_20260927_022613",
    "127cc0cc-929c-4f77-adaa-3cee10201622": "hf_20260927_022706",
    "64f08750-b078-4895-bd66-9fd21d3975fd": "hf_20260927_022706",
    "8ab846ba-56ad-488e-8325-f5cda7da1588": "hf_20260927_022706",
    "acd089d2-99f4-42f0-b3a7-ec68de82e300": "hf_20260927_022706",
    "c9a51c32-c81c-421c-8975-3acce1e8a162": "hf_20260927_022756",
    "a6b80f79-beaa-4446-a452-9f4293135434": "hf_20260927_022756",
    "43e22575-fe80-42be-b0a4-dfc361c0edd1": "hf_20260927_022756",
    "27b79302-7311-483c-9ade-f0f16a5594c2": "hf_20260927_022757",
    "a758d863-997d-4271-a8e4-182ad304090e": "hf_20260927_022849",
    "b5db6162-97f8-446e-9fce-e98def9adbdd": "hf_20260927_022848",
  };

  function img(id, size) {
    const ts = IMAGES[id];
    if (!ts) return "";
    const base = `${CDN}${ts}_${id}`;
    return size === "min" ? `${base}_min.webp` : `${base}.png`;
  }

  const CAST = {
    kai: { name: "Kai", age: 22, city: "Brooklyn", height: "6'1\"", tags: ["Moth neck tattoo", "Bleached twists", "Septum"], bio: "Skates, DJs, never on time." },
    rosa: { name: "Rosa", age: 20, city: "East LA", height: "5'5\"", tags: ["Floral sleeve", "Buzz cut", "Brow slit"], bio: "Tattoo apprentice. Runs 5k at midnight." },
    jun: { name: "Jun", age: 23, city: "Queens", height: "5'10\"", tags: ["Stick-and-pokes", "Mullet", "Hoops"], bio: "Shoots film, fixes bikes, sleeps at 4." },
    amara: { name: "Amara", age: 21, city: "Atlanta", height: "5'9\"", tags: ["Vitiligo", "Knotless braids", "Nose ring"], bio: "Point guard. Studies architecture." },
    theo: { name: "Theo", age: 19, city: "Manchester", height: "5'11\"", tags: ["Freckles", "Lip ring", "Knuckle tats"], bio: "Works the deli counter, makes beats." },
    noor: { name: "Noor", age: 24, city: "Toronto", height: "5'6\"", tags: ["Collarbone script", "Curls", "Septum"], bio: "Poet. Owns too many varsity jackets." },
  };

  const CATEGORIES = [
    ["all", "All"],
    ["tops", "Hoodies & Crews"],
    ["tees", "Graphic Tees"],
    ["outerwear", "Outerwear"],
    ["denim", "Denim"],
    ["active", "Active"],
    ["lounge", "Lounge"],
    ["acc", "Accessories"],
  ];

  const TOP = ["XS", "S", "M", "L", "XL", "XXL"];
  const WAIST = ["26", "28", "30", "32", "34", "36"];

  const PRODUCTS = [
    {
      id: "dusk-hoodie", name: "Dusk Hoodie", cat: "tops", price: 98, badge: "Bestseller",
      sub: "480gsm heavyweight fleece", technique: "Screen print, back + chest",
      desc: "Our heaviest hoodie. Boxy, dropped shoulder, double-lined hood with no drawcords to lose. The back carries the full Dusk graphic: a half-lit moon rising over the skyline.",
      fit: "Oversized. Size down for a regular fit.", fabric: "100% brushed-back cotton, 480gsm, garment washed",
      model: "kai", modelSize: "L", sizes: TOP, soldOut: ["XS"],
      colours: [
        { name: "Ink", hex: "#1b1b1d", flat: "c6bc42ba-8167-4854-8001-4c368c15f9ee", back: "880ac191-78dd-4cbe-a9ad-86e36bfd8989" },
        { name: "Sodium", hex: "#ff6a13", flat: "b60f1933-cd7e-4b9d-a500-4352647cc7c1" },
        { name: "Bone", hex: "#e7e0d2", flat: "5511d01a-70a6-405f-94c1-f197e2ca35b4" },
      ],
      shots: { front: "e7f74614-0fbf-47fd-8b1e-addb54d0cfb9", back: "7e50b9be-3b40-4271-9cde-e2dc822337ad", detail: "0ec5fc03-efdf-4b70-b268-a42691b60861", close: "" },
    },
    {
      id: "chainstitch-crew", name: "Chainstitch Crew", cat: "tops", price: 88, badge: "Embroidered",
      sub: "Chain-stitch script crewneck", technique: "Chain-stitch embroidery",
      desc: "Boxy crewneck with the Halflit script sewn on a vintage chain-stitch machine, so every loop sits a little differently. Heavy rib at the collar, cuffs and hem.",
      fit: "Boxy, slightly cropped.", fabric: "80% cotton, 20% recycled polyester fleece, 420gsm",
      model: "rosa", modelSize: "M", sizes: TOP, soldOut: [],
      colours: [
        { name: "Heather", hex: "#b9b8b4", flat: "efdb994e-d727-410c-a812-8eb5bbfb8ef0" },
        { name: "Forest", hex: "#24402f", flat: "b69f3182-a10d-4f78-bd1b-0af635e42659" },
        { name: "Washed Navy", hex: "#2c3550", flat: "c06e0112-1c1f-472e-8eaf-ecd8f5b2252c" },
      ],
      shots: { front: "eb7c348d-8909-4d39-8884-764200951840", back: "", detail: "eeb9d808-fcf9-4069-b648-7280bf6d34e6", close: "f0d96d79-7b79-4b3e-961f-5fdc930a9b3b" },
    },
    {
      id: "open-late-tee", name: "Open Late Tee", cat: "tees", price: 48, badge: "Graphic",
      sub: "Oversized graphic tee", technique: "Water-based screen print, cracked finish",
      desc: "Dedicated to every corner shop that stays open when nothing else does. Boxy heavyweight tee with a thick collar that won't bacon after one wash.",
      fit: "Oversized, boxy, dropped shoulder.", fabric: "100% cotton jersey, 260gsm",
      model: "jun", modelSize: "L", sizes: TOP, soldOut: [],
      colours: [
        { name: "White", hex: "#f2f0ea", flat: "2a74e700-8848-42d4-b771-00415f416c40" },
        { name: "Black", hex: "#141414", flat: "bf784806-2c09-42fa-b67c-11b9ff51895e" },
        { name: "Faded Olive", hex: "#646447", flat: "98a1b8ea-fb7d-4eb4-aa90-5b86c6222c15" },
      ],
      shots: { front: "4e7be762-2623-48b8-9d79-e8e10c61a498", back: "", detail: "4dab2751-7204-47fb-b626-cc056985e2b7", close: "b06d9546-975d-412f-a721-a20cd24209a9" },
    },
    {
      id: "arch-tee", name: "Varsity Arch Tee", cat: "tees", price: 52,
      sub: "Puff-print collegiate tee", technique: "Raised puff print",
      desc: "Collegiate arch, no college required. The puff print is heat-cured so the letters sit up off the fabric and feel like they look.",
      fit: "Relaxed, true to size.", fabric: "100% cotton jersey, 240gsm",
      model: "amara", modelSize: "M", sizes: TOP, soldOut: ["XXL"],
      colours: [
        { name: "Cream", hex: "#ede4cf", flat: "d588e579-8bc7-4d0a-8d0c-077911ad9854" },
        { name: "Maroon", hex: "#5c1c24", flat: "15c94aee-14db-4dbe-bf3e-947221511e26" },
      ],
      shots: { front: "8b4077f9-a2b0-4688-9f87-efd1276ea0ac", back: "", detail: "6177aabf-4b8f-459e-bf1d-8b48da403d1c", close: "1a564913-c0d3-42ec-8e2e-bc35b1fa6562" },
    },
    {
      id: "nightshift-puffer", name: "Nightshift Puffer", cat: "outerwear", price: 268, badge: "New",
      sub: "Cropped gloss puffer", technique: "Reflective sleeve patch",
      desc: "Cropped, boxy and very warm. Recycled down in oversized baffles, a stand collar that meets your chin and a reflective phase patch that lights up in headlights.",
      fit: "Cropped and boxy. True to size.", fabric: "Gloss recycled nylon shell, 650-fill recycled down",
      model: "theo", modelSize: "M", sizes: TOP, soldOut: [],
      colours: [
        { name: "Gloss Black", hex: "#0c0c0c", flat: "f670bc5f-8887-4e36-be07-d091f3657ef9" },
        { name: "Sodium", hex: "#ff6a13", flat: "2341cdff-6d27-4a45-be1d-2e695729ae07" },
        { name: "Liquid Silver", hex: "#c9ccd1", flat: "87b30be3-224c-4d31-b300-7553adeb26b2" },
      ],
      shots: { front: "151f4055-3935-4a04-8d04-73603ad0dfb5", back: "", detail: "2707e824-2fec-4af9-addc-8dcde548f7d2", close: "" },
    },
    {
      id: "afterhours-varsity", name: "Afterhours Varsity", cat: "outerwear", price: 295, badge: "Chenille",
      sub: "Wool + leather varsity jacket", technique: "Chenille + chain-stitch patch",
      desc: "Melton wool body, real leather sleeves and a chenille H with the phase mark stitched inside. Quilted lining, snap front, striped rib that holds its shape.",
      fit: "Regular, slightly boxy.", fabric: "Wool-blend melton body, lambskin leather sleeves, quilted lining",
      model: "noor", modelSize: "S", sizes: TOP, soldOut: ["XS", "S"],
      colours: [
        { name: "Black / Cream", hex: "linear-gradient(90deg,#121212 50%,#e9e0cb 50%)", flat: "a302a70f-bae7-4bbe-b2e6-c896e4bcce5a" },
        { name: "Navy / Grey", hex: "linear-gradient(90deg,#1f2640 50%,#b7b8bb 50%)", flat: "dd56815c-c2b0-4118-9770-11030fa25785" },
      ],
      shots: { front: "7f97cf52-fcd8-4d58-b6fc-00d65db78fcc", back: "5f3ecbaf-10b1-4b8b-a1f4-1eab5c90bb5d", detail: "", close: "b12fad22-80ea-4848-9426-19c99fd64267" },
    },
    {
      id: "loose-carpenter", name: "Loose Carpenter Jean", cat: "denim", price: 128,
      sub: "14oz baggy carpenter denim", technique: "Embroidered coin pocket",
      desc: "Wide, low and heavy. Double knees, a hammer loop you'll use for keys and a tiny sodium phase mark stitched on the coin pocket.",
      fit: "Baggy, wide straight leg, mid-low rise.", fabric: "14oz 100% cotton denim",
      model: "jun", modelSize: "30", sizes: WAIST, soldOut: ["26"],
      colours: [
        { name: "Washed Indigo", hex: "#4a6285", flat: "4274e901-a123-4d00-845c-53d827073f3e" },
        { name: "Black Wash", hex: "#2b2b2d", flat: "3a731e8c-0b7d-485d-9d4b-0f0ff45525c4" },
        { name: "Stone", hex: "#d9cfbb", flat: "b060d1a7-8621-4ae6-9e91-ca5fe96a8c93" },
      ],
      shots: { front: "386c25db-bf08-4392-b7ff-8fe54932a973", back: "983897c1-d31b-4302-83fc-d0453c5be493", detail: "", close: "efdce79e-f8c9-48bb-be0a-aeac750de0dd" },
    },
    {
      id: "worker-jacket", name: "Worker Denim Jacket", cat: "denim", price: 158, badge: "Embroidered",
      sub: "Boxy chore jacket", technique: "Chain-stitch back embroidery",
      desc: "A boxy, cropped chore jacket in rigid denim with a cord collar, sodium topstitching and a big chain-stitched back piece that took our embroiderer two weeks to get right.",
      fit: "Boxy and cropped.", fabric: "13oz rigid cotton denim, corduroy collar",
      model: "kai", modelSize: "L", sizes: TOP, soldOut: [],
      colours: [
        { name: "Mid Indigo", hex: "#3b5378", flat: "29810115-af4b-4162-9484-8a6bb4636d3c", back: "b0388a2b-98c8-42dc-a354-145bd54a9476" },
        { name: "Washed Black", hex: "#2a2a2c", flat: "6c6f2057-d8c5-4ecb-b3bb-194a50a3a80e" },
      ],
      shots: { front: "f6d65b42-370b-4f3f-ae05-17e0a0616823", back: "6944b169-4e2f-49ff-a1b1-b9770e6713fb", detail: "", close: "84327b99-4734-4af5-961f-4502eff5e2b2" },
    },
    {
      id: "run-club-set", name: "Run Club Track Set", cat: "active", price: 148, badge: "Set",
      sub: "Nylon track jacket + pant", technique: "Printed chest logo",
      desc: "For the Tuesday-night 5k and everything after. Lightweight crinkle nylon, mesh lining, zip pockets and stripes that catch the light.",
      fit: "Relaxed jacket, straight-leg pant.", fabric: "100% recycled crinkle nylon, mesh lining",
      model: "rosa", modelSize: "S", sizes: TOP, soldOut: [],
      colours: [
        { name: "Black / Sodium", hex: "linear-gradient(90deg,#111 50%,#ff6a13 50%)", flat: "59387655-3c13-4f5d-b446-fd2aad5cf0ff" },
        { name: "Royal / White", hex: "linear-gradient(90deg,#2446b8 50%,#f4f4f4 50%)", flat: "943ff9f3-996e-4c00-85f8-7038ebafaaec" },
      ],
      shots: { front: "2a9c147c-9c21-4a5e-ab3c-9cf52ee56293", back: "13fffd53-3428-4b94-98f0-42a603f1b003", detail: "843580f7-2a50-44cd-aaf6-41b172f672ca", close: "" },
    },
    {
      id: "motion-set", name: "Motion Set", cat: "active", price: 92,
      sub: "Rib sports top + bike short", technique: "Tonal heat-transfer logo",
      desc: "Soft, sculpting rib that moves with you from the court to the corner shop. Medium support top, high-rise short with a hidden key pocket.",
      fit: "Compressive. True to size.", fabric: "78% recycled nylon, 22% elastane rib",
      model: "amara", modelSize: "M", sizes: ["XS", "S", "M", "L", "XL"], soldOut: [],
      colours: [
        { name: "Charcoal", hex: "#3a3a3d", flat: "c21c36e1-6ec3-4d78-8e0c-d10138749180" },
        { name: "Sage", hex: "#9aa58d", flat: "e6708645-c2f7-42b3-a6d3-0753bf4bec6a" },
        { name: "Sodium", hex: "#ff6a13", flat: "f00ed8a1-725e-42da-a9b2-adca66cb9dbc" },
      ],
      shots: { front: "087d6fc3-80c6-4bec-a33f-19ba11b280bd", back: "acba9b34-1150-4267-b259-9e6907729716", detail: "", close: "" },
    },
    {
      id: "lounge-set", name: "Lounge Fleece Set", cat: "lounge", price: 118,
      sub: "Zip hoodie + wide sweatpant", technique: "Tonal embroidery",
      desc: "The set you'll wear three days in a row and not regret it. Brushed-inside fleece, wide-leg sweats, a two-way zip and tonal embroidery on the thigh.",
      fit: "Relaxed, wide leg.", fabric: "100% cotton brushed fleece, 400gsm",
      model: "noor", modelSize: "S", sizes: TOP, soldOut: [],
      colours: [
        { name: "Oatmeal", hex: "#d8ccb6", flat: "9fc32808-d78e-44e9-927e-cb5f998aecfc" },
        { name: "Heather", hex: "#a9a8a4", flat: "4c32799e-f19f-4c3b-b067-bd6f69b9fde2" },
        { name: "Black", hex: "#1a1a1a", flat: "23c67a67-18aa-41bd-a5ee-dc856ba7c444" },
      ],
      shots: { front: "354d4169-d10e-4e05-bbbb-37c17eecb15e", back: "", detail: "7b28da40-99b9-467d-994c-ba7bff397780", close: "" },
    },
    {
      id: "phase-beanie", name: "Phase Beanie", cat: "acc", price: 38,
      sub: "Fisherman rib beanie", technique: "Woven phase label",
      desc: "Chunky fisherman rib with a shallow cuff and a woven phase label. Sits above the ears, the way it should.",
      fit: "One size.", fabric: "100% merino wool",
      model: "theo", modelSize: "One size", sizes: ["One size"], soldOut: [],
      colours: [
        { name: "Black", hex: "#141414", flat: "005bc4aa-91db-4007-bbda-a6f6dae78af7" },
        { name: "Sodium", hex: "#ff6a13", flat: "505bfd4a-9088-403d-a12b-c2bc60f71fc8" },
      ],
      shots: { front: "93760f3d-0898-42f0-943f-0f99c2f0c973", back: "", detail: "b99678e0-9a61-4525-8118-ebda421d8071", close: "" },
    },
  ];

  const CAMPAIGN = {
    hero: "7bca1289-8ee9-49fe-a051-0c7061a110c7",
    looks: [
      { id: "7bca1289-8ee9-49fe-a051-0c7061a110c7", wide: true, title: "02:10 — Outside the shutter", who: "Dusk Hoodie · Chainstitch Crew · Afterhours Varsity · Nightshift Puffer" },
      { id: "82c1a895-f271-47af-99ba-bd903cc080af", title: "Level P3", who: "Open Late Tee · Loose Carpenter Jean" },
      { id: "e16fc09f-bdb3-49d1-9dcd-e01d3644c5fb", title: "Rooftop, last light", who: "Afterhours Varsity" },
      { id: "85a57fcc-ac25-40b2-b6af-b89b47e0fc1f", title: "Court lights", who: "Motion Set — Charcoal" },
      { id: "1b149e71-6035-43cb-96ab-9191874bba17", title: "Corner deli", who: "Nightshift Puffer — Sodium · Phase Beanie" },
      { id: "4c704fa0-373a-4283-a0bd-32d0c6a4c6d1", title: "Spin cycle", who: "Chainstitch Crew — Heather" },
      { id: "127cc0cc-929c-4f77-adaa-3cee10201622", title: "Streetlight, 01:40", who: "Dusk Hoodie — Ink" },
      { id: "64f08750-b078-4895-bd66-9fd21d3975fd", title: "Wash, dry, repeat", who: "Chainstitch Crew — Heather" },
      { id: "8ab846ba-56ad-488e-8325-f5cda7da1588", title: "Green light", who: "Open Late Tee — White" },
      { id: "acd089d2-99f4-42f0-b3a7-ec68de82e300", title: "Fourth quarter", who: "Motion Set — Charcoal" },
    ],
    portraits: { kai: "c9a51c32-c81c-421c-8975-3acce1e8a162", rosa: "a6b80f79-beaa-4446-a452-9f4293135434", jun: "43e22575-fe80-42be-b0a4-dfc361c0edd1", amara: "27b79302-7311-483c-9ade-f0f16a5594c2", theo: "a758d863-997d-4271-a8e4-182ad304090e", noor: "b5db6162-97f8-446e-9fce-e98def9adbdd",},
  };

  // Drop calendar: every drop ships with its own phase of the mark.
  const DROPS = [
    { n: "01", name: "New Moon", phase: 0, date: "Mar 2026" },
    { n: "02", name: "Crescent", phase: 0.25, date: "Jun 2026" },
    { n: "03", name: "Night Shift", phase: 0.5, date: "Sep 2026", now: true },
    { n: "04", name: "Gibbous", phase: 0.75, date: "Dec 2026" },
    { n: "05", name: "Full Beam", phase: 1, date: "Mar 2027" },
    { n: "06", name: "Waning", phase: 0.62, date: "Jun 2027" },
  ];

  global.HALFLIT = { img, IMAGES, CAST, CATEGORIES, PRODUCTS, CAMPAIGN, DROPS };
})(window);
