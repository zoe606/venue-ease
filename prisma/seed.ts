import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.POSTGRES_PRISMA_URL;
if (!connectionString) {
  throw new Error("POSTGRES_PRISMA_URL not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateSlug(name: string, city: string): string {
  return `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const venues = [
  {
    name: "The Grand Ballroom",
    city: "San Francisco",
    address: "123 Market Street, San Francisco, CA 94105",
    capacity: 300,
    pricePerNight: 750,
    description:
      "An elegant venue featuring floor-to-ceiling windows with stunning city views. Perfect for large corporate events and galas.",
    imageUrl:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
    amenities: ["WiFi", "AV Equipment", "Catering Kitchen", "Stage", "Parking"],
  },
  {
    name: "Skyline Conference Center",
    city: "New York",
    address: "456 5th Avenue, New York, NY 10018",
    capacity: 200,
    pricePerNight: 650,
    description:
      "Modern conference space in the heart of Manhattan with panoramic skyline views. Ideal for corporate retreats and workshops.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    amenities: ["WiFi", "Video Conferencing", "Whiteboard Walls", "Coffee Bar"],
  },
  {
    name: "Lakeside Retreat",
    city: "Austin",
    address: "789 Lake Austin Blvd, Austin, TX 78703",
    capacity: 80,
    pricePerNight: 350,
    description:
      "Peaceful lakeside venue with outdoor terraces and natural surroundings. Great for team-building and intimate gatherings.",
    imageUrl:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
    amenities: ["WiFi", "Outdoor Space", "Fire Pit", "BBQ Area", "Kayaks"],
  },
  {
    name: "Mountain View Lodge",
    city: "Denver",
    address: "321 Mountain Road, Denver, CO 80202",
    capacity: 150,
    pricePerNight: 450,
    description:
      "Rustic yet modern lodge with breathtaking mountain views. Features both indoor and outdoor meeting spaces.",
    imageUrl:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
    amenities: ["WiFi", "Fireplace", "Hiking Trails", "Hot Tub", "Catering"],
  },
  {
    name: "Oceanfront Pavilion",
    city: "Miami",
    address: "555 Ocean Drive, Miami Beach, FL 33139",
    capacity: 250,
    pricePerNight: 550,
    description:
      "Stunning beachfront venue with retractable walls opening to ocean views. Perfect for memorable corporate events.",
    imageUrl:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
    amenities: ["WiFi", "Beach Access", "Pool", "Bar", "Valet Parking"],
  },
  {
    name: "Urban Loft Space",
    city: "Chicago",
    address: "888 W Fulton Market, Chicago, IL 60607",
    capacity: 60,
    pricePerNight: 275,
    description:
      "Industrial-chic loft in the trendy Fulton Market district. Exposed brick and creative atmosphere for innovative teams.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
    amenities: ["WiFi", "Projector", "Breakout Rooms", "Rooftop Access"],
  },
  {
    name: "Garden Terrace",
    city: "Seattle",
    address: "444 Pike Street, Seattle, WA 98101",
    capacity: 100,
    pricePerNight: 400,
    description:
      "Charming venue with a beautiful enclosed garden and greenhouse. Natural light and greenery create a refreshing atmosphere.",
    imageUrl:
      "https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=800",
    amenities: ["WiFi", "Garden Space", "Natural Lighting", "Catering Kitchen"],
  },
  {
    name: "Desert Oasis Resort",
    city: "Los Angeles",
    address: "999 Sunset Boulevard, Los Angeles, CA 90028",
    capacity: 400,
    pricePerNight: 800,
    description:
      "Luxurious resort venue with palm-lined courtyards and desert-inspired architecture. The ultimate destination for large-scale events.",
    imageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    amenities: [
      "WiFi",
      "Pool",
      "Spa",
      "Multiple Rooms",
      "On-site Hotel",
      "Valet",
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.bookingInquiry.deleteMany();
  await prisma.venue.deleteMany();

  // Create venues with generated slugs
  for (const venue of venues) {
    await prisma.venue.create({
      data: {
        ...venue,
        slug: generateSlug(venue.name, venue.city),
      },
    });
  }

  console.log(`Created ${venues.length} venues`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
