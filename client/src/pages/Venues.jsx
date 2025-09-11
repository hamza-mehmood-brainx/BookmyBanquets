// pages/venues (or wherever this page lives)
import { useEffect, useState } from "react";
import axios from "axios";
import Footer from "../components/FooterNew";
import Hero from "../components/Hero";
import VenueGrid from "../components/VenueGrid";

const API = "/api/v1";

// Utility to transform absolute URLs to relative URLs
const transformImageUrl = (url) => {
  if (!url) return url;
  // If it's already a relative URL, return as is
  if (url.startsWith('/')) return url;
  // Transform absolute URLs to relative URLs
  if (url.includes('/uploads/halls/')) {
    const match = url.match(/\/uploads\/halls\/.+$/);
    return match ? match[0] : url;
  }
  return url;
};

const firstImage = (imageURLs) => {
  if (!imageURLs) return "/placeholder.svg?height=300&width=500";
  if (Array.isArray(imageURLs)) {
    const first = imageURLs[0];
    return first ? transformImageUrl(first) : "/placeholder.svg?height=300&width=500";
  }
  const first = String(imageURLs)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];
  return first ? transformImageUrl(first) : "/placeholder.svg?height=300&width=500";
};

const pkr = (n) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n || 0);

export default function Home() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // NEW: use the public listing endpoint with aggregates
        // adjust the path to whatever you exposed for listPublicHall
        const { data } = await axios.get(`${API}/hall`);

        // Flexible: accept either {venues:[...]} or raw array
        const rows = Array.isArray(data) ? data : (data?.venues ?? data?.halls ?? []);

        const mapped = rows.map((h) => ({
          id: h.id || h.hallId,
          name: h.name,
          // if backend already sends `location` string, use it; else build from address
          location: h.location ?? (h.address ? `${h.address.city ?? ""}, ${h.address.state ?? ""}` : ""),
          image: firstImage(h.image ?? h.imageURLs),
          price: pkr(h.price),
          capacity: `${h.capacity} guests`,
          rating: Number(h.rating ?? 0),
          reviewCount: Number(h.reviewCount ?? 0),
          featured: Boolean(h.featured ?? false),
        }));

        setVenues(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <Hero />

      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-[#FF477E] animate-spin" />
        </div>
      ) : venues.length === 0 ? (
        <div className="py-16 text-center text-gray-600">No venues available right now.</div>
      ) : (
        <VenueGrid venues={venues} />
      )}

      <Footer />
    </div>
  );
}
