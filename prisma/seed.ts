import bcrypt from "bcryptjs";
import {
  PrismaClient,
  ProductStatus,
  StaffRole,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();
const image = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

const categories = [
  {
    name: "Personalized Gifts",
    slug: "personalized-gifts",
    description: "Keepsakes made especially for someone dear.",
  },
  {
    name: "Rakhi & Festive",
    slug: "rakhi-festive",
    description: "Small rituals, joyful colour, and festive warmth.",
  },
  {
    name: "Home & Decor",
    slug: "home-decor",
    description: "Artisanal details for lived-in spaces.",
  },
  {
    name: "Jewelry Accessories",
    slug: "jewelry-accessories",
    description: "Hand-finished accents for everyday celebration.",
  },
];

const products = [
  [
    "Personalized Brass Name Plate",
    "personalized-brass-name-plate",
    "Hand-etched brass name plate for a new home or a thoughtful housewarming gift.",
    "A hand-etched welcome.",
    "PG-BRASS-001",
    2499,
    12,
    "personalized-gifts",
    true,
    "Name to engrave",
    28,
    "photo-1600607687939-ce8a6c25118c",
  ],
  [
    "Monogrammed Linen Keepsake Box",
    "monogrammed-linen-keepsake-box",
    "A linen-wrapped box with a hand-painted monogram for treasured little things.",
    "A place for memories.",
    "PG-LINEN-002",
    1299,
    24,
    "personalized-gifts",
    true,
    "Initials to add",
    3,
    "photo-1586023492125-27b2c045efd7",
  ],
  [
    "Custom Engraved Desk Tray",
    "custom-engraved-desk-tray",
    "Solid mango wood tray finished by hand and engraved with a personal note.",
    "Make their everyday beautiful.",
    "PG-WOOD-003",
    899,
    30,
    "personalized-gifts",
    true,
    "Message to engrave",
    45,
    "photo-1494438639946-1ebd1d20bf85",
  ],
  [
    "Handpainted Rakhi Set",
    "handpainted-rakhi-set",
    "A joyful set of two handpainted rakhis with soft cotton threads and seed beads.",
    "For the bond that keeps growing.",
    "RF-RAKHI-004",
    599,
    45,
    "rakhi-festive",
    false,
    null,
    null,
    "photo-1599552683573-16b443d7a6a3",
  ],
  [
    "Kansa Tealight Pair",
    "kansa-tealight-pair",
    "A pair of warm kansa metal tealight holders for festive evenings and quiet corners.",
    "Light, held gently.",
    "RF-KANSA-005",
    1099,
    18,
    "rakhi-festive",
    false,
    null,
    null,
    "photo-1603006905003-be475563bc59",
  ],
  [
    "Madhubani Festive Toran",
    "madhubani-festive-toran",
    "A hand-painted fabric toran inspired by the bold lines of Madhubani folk art.",
    "Welcome in colour.",
    "RF-TORAN-006",
    1499,
    15,
    "rakhi-festive",
    false,
    null,
    null,
    "photo-1604917877934-07d8d248d396",
  ],
  [
    "Block Print Table Runner",
    "block-print-table-runner",
    "A cotton table runner printed by hand with an understated botanical pattern.",
    "Set the table with story.",
    "HD-RUNNER-007",
    1199,
    20,
    "home-decor",
    false,
    null,
    null,
    "photo-1604014237800-1c9102c219da",
  ],
  [
    "Terracotta Diya Cluster",
    "terracotta-diya-cluster",
    "Six terracotta diyas shaped and fired by a family of potters in Rajasthan.",
    "For evenings that glow.",
    "HD-DIYA-008",
    749,
    50,
    "home-decor",
    false,
    null,
    null,
    "photo-1572726729207-a78d6feb18d7",
  ],
  [
    "Carved Mango Wood Bookends",
    "carved-mango-wood-bookends",
    "A sculptural pair of mango wood bookends with a softly carved sun motif.",
    "A little grounding for your shelf.",
    "HD-BOOK-009",
    1899,
    10,
    "home-decor",
    false,
    null,
    null,
    "photo-1544947950-fa07a98d237f",
  ],
  [
    "Brass Lotus Incense Holder",
    "brass-lotus-incense-holder",
    "A lotus-shaped brass holder made for incense sticks and slow morning rituals.",
    "Make room for stillness.",
    "HD-LOTUS-010",
    699,
    35,
    "home-decor",
    false,
    null,
    null,
    "photo-1519710164239-da123dc03ef4",
  ],
  [
    "Beaded Silk Potli",
    "beaded-silk-potli",
    "A festive silk potli detailed with glass beads and a soft drawstring closure.",
    "A tiny celebration to carry.",
    "JA-POTLI-011",
    999,
    22,
    "jewelry-accessories",
    false,
    null,
    null,
    "photo-1612902456551-333ac5afa26e",
  ],
  [
    "Dhokra Leaf Earrings",
    "dhokra-leaf-earrings",
    "Lightweight lost-wax brass earrings with an organic leaf silhouette.",
    "Wear a little wildness.",
    "JA-EARTH-012",
    1299,
    16,
    "jewelry-accessories",
    false,
    null,
    null,
    "photo-1535632066927-ab7c9ab60908",
  ],
  [
    "Kundan Hair Pin Set",
    "kundan-hair-pin-set",
    "A set of two delicate hair pins with hand-set kundan details.",
    "An heirloom feeling, every day.",
    "JA-KUNDAN-013",
    899,
    25,
    "jewelry-accessories",
    false,
    null,
    null,
    "photo-1523779917675-b6ed3a42a561",
  ],
  [
    "Handwoven Cotton Stole",
    "handwoven-cotton-stole",
    "A light handwoven cotton stole with a fine zari edge for gifting or keeping.",
    "Soft colour, easy grace.",
    "JA-STOLE-014",
    1599,
    14,
    "jewelry-accessories",
    false,
    null,
    null,
    "photo-1601924928374-7b7a9c1b8bde",
  ],
  [
    "Personalized Celebration Card Set",
    "personalized-celebration-card-set",
    "Five illustrated cards with space for a name, note, or small blessing.",
    "Say it in your own words.",
    "PG-CARD-015",
    449,
    60,
    "personalized-gifts",
    true,
    "Name or short message",
    40,
    "photo-1513475382585-d06e58bcb0e0",
  ],
  [
    "Marigold Door Hanging",
    "marigold-door-hanging",
    "A reusable fabric marigold hanging made for doorways, mantels, and joyful entrances.",
    "A brighter welcome.",
    "RF-MARIGOLD-016",
    799,
    28,
    "rakhi-festive",
    false,
    null,
    null,
    "photo-1478146896981-b80fe463b330",
  ],
  [
    "Stoneware Serving Bowl",
    "stoneware-serving-bowl",
    "A wheel-thrown serving bowl with a quiet speckled glaze and generous curve.",
    "Gather around something made well.",
    "HD-BOWL-017",
    1699,
    9,
    "home-decor",
    false,
    null,
    null,
    "photo-1610701596007-11502861dcfa",
  ],
  [
    "Handpainted Silk Scrunchie Trio",
    "handpainted-silk-scrunchie-trio",
    "Three soft silk scrunchies made from handpainted offcuts in complementary tones.",
    "Small luxuries, thoughtfully made.",
    "JA-SILK-018",
    699,
    32,
    "jewelry-accessories",
    false,
    null,
    null,
    "photo-1596462502278-27bfdc403348",
  ],
] as const;

async function main() {
  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryMap.set(category.slug, record.id);
  }

  for (const [
    name,
    slug,
    description,
    shortDescription,
    sku,
    price,
    stock,
    categorySlug,
    customizationEnabled,
    customizationLabel,
    customizationMaxLength,
    imageSeed,
  ] of products) {
    const metadata = {
      occasionTags:
        categorySlug === "rakhi-festive"
          ? ["festivals", "rakhi"]
          : categorySlug === "personalized-gifts"
            ? ["birthdays", "weddings", "housewarming"]
            : ["birthdays", "festivals"],
      colors:
        categorySlug === "jewelry-accessories"
          ? ["gold", "multicolour"]
          : categorySlug === "home-decor"
            ? ["natural", "terracotta"]
            : ["gold", "red"],
      materials:
        categorySlug === "home-decor"
          ? ["wood", "metal", "clay"]
          : categorySlug === "jewelry-accessories"
            ? ["silk", "brass"]
            : ["brass", "cotton"],
      salesCount: Math.max(8, 100 - stock * 2),
    };
    await prisma.product.upsert({
      where: { slug },
      update: {
        name,
        description,
        shortDescription,
        sku,
        price,
        stock,
        images: [image(imageSeed)],
        status: ProductStatus.ACTIVE,
        customizationEnabled,
        customizationLabel,
        customizationMaxLength,
        categoryId: categoryMap.get(categorySlug)!,
        ...metadata,
      },
      create: {
        name,
        slug,
        description,
        shortDescription,
        sku,
        price,
        stock,
        images: [image(imageSeed)],
        status: ProductStatus.ACTIVE,
        customizationEnabled,
        customizationLabel,
        customizationMaxLength,
        categoryId: categoryMap.get(categorySlug)!,
        ...metadata,
      },
    });
  }

  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "DivineAdmin123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const staffAccounts = [
    {
      name: "Divine Karigari Admin",
      email: "admin@divinekarigari.in",
      role: StaffRole.SUPER_ADMIN,
    },
    {
      name: "Order Manager",
      email: "orders@divinekarigari.in",
      role: StaffRole.ORDER_MANAGER,
    },
    {
      name: "Inventory Manager",
      email: "inventory@divinekarigari.in",
      role: StaffRole.INVENTORY_MANAGER,
    },
  ];

  for (const account of staffAccounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        passwordHash,
        role: UserRole.STAFF,
      },
      create: {
        name: account.name,
        email: account.email,
        passwordHash,
        role: UserRole.STAFF,
      },
    });
    await prisma.staff.upsert({
      where: { userId: user.id },
      update: { role: account.role, active: true },
      create: { userId: user.id, role: account.role },
    });
  }
}

main().finally(() => prisma.$disconnect());
