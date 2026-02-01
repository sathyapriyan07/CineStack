import Header from "@/components/ui/Header";
import SearchBar from "@/components/ui/search-bar";
import HomeSections from "@/components/home/home-sections";
import Footer from "@/components/ui/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col gap-4 pt-16 pb-24 px-2">
        <div className="w-full max-w-md mx-auto">
          <SearchBar />
        </div>
        <HomeSections />
      </main>
      <Footer />
    </div>
  );
}
